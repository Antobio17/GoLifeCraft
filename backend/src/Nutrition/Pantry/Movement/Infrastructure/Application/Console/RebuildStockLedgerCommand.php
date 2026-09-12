<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Application\Console;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Inventory\Domain\Model\Inventory;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Service\StockBalanceCalculator;
use Ramsey\Uuid\Uuid;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

final class RebuildStockLedgerCommand extends Command
{
    private const string SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly Connection $writerTenantConnection,
        private readonly StockBalanceCalculator $balanceCalculator,
        private readonly DateTimeGenerator $dateTimeGenerator,
    ) {
        parent::__construct(name: 'app:pantry:rebuild-stock');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Seed the stock ledger from the stock every tenant holds today and recompute every projection from it. Run once after the ledger is deployed.')
            ->addOption(name: 'tenant', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Rebuild a single tenant database by name instead of discovering all GLC% tenants.', default: null);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $tenant = $input->getOption('tenant');
        $databases = null !== $tenant
            ? [$tenant]
            : $this->writerTenantConnection->executeQuery("SHOW DATABASES LIKE 'GLC%'")->fetchFirstColumn();

        if ([] === $databases) {
            $output->writeln(messages: '<comment>No tenant databases found.</comment>');

            return Command::SUCCESS;
        }

        foreach ($databases as $dbname) {
            $this->rebuildTenant(dbname: $dbname, output: $output);
        }

        return Command::SUCCESS;
    }

    private function rebuildTenant(string $dbname, OutputInterface $output): void
    {
        $this->switcher->switch(tenantId: $dbname);

        $nightShifts = $this->writerTenantConnection->update(
            table: 'inventory',
            data: ['shift' => Inventory::SHIFT_AFTERNOON],
            criteria: ['shift' => 'night'],
        );

        $seeded = $this->seedOpeningCounts(kind: StockMovement::KIND_ARTICLE, table: 'article_stock', refColumn: 'article_id', quantityColumn: 'quantity')
            + $this->seedOpeningCounts(kind: StockMovement::KIND_RECIPE, table: 'recipe_stock', refColumn: 'recipe_id', quantityColumn: 'servings');

        $rebuilt = $this->rebuildProjection(kind: StockMovement::KIND_ARTICLE, table: 'article_stock', refColumn: 'article_id', quantityColumn: 'quantity')
            + $this->rebuildProjection(kind: StockMovement::KIND_RECIPE, table: 'recipe_stock', refColumn: 'recipe_id', quantityColumn: 'servings');

        $output->writeln(messages: sprintf(
            '<info>%s: %d night counts moved to afternoon, %d opening counts seeded, %d projections rebuilt.</info>',
            $dbname,
            $nightShifts,
            $seeded,
            $rebuilt,
        ));
    }

    private function seedOpeningCounts(string $kind, string $table, string $refColumn, string $quantityColumn): int
    {
        $now = $this->dateTimeGenerator->now();
        $seeded = 0;

        foreach ($this->stockRows(table: $table, refColumn: $refColumn, quantityColumn: $quantityColumn) as $row) {
            $seeded += $this->seedOpeningCount(kind: $kind, row: $row, now: $now);
        }

        return $seeded;
    }

    /**
     * @param array<string, mixed> $row
     */
    private function seedOpeningCount(string $kind, array $row, \DateTime $now): int
    {
        if (0.0 === (float) $row['quantity']) {
            return 0;
        }

        if ($this->hasMovements(kind: $kind, refId: $row['ref_id'])) {
            return 0;
        }

        $this->writerTenantConnection->insert(table: 'stock_movement', data: [
            'id' => Uuid::uuid4()->toString(),
            'version' => 1,
            'kind' => $kind,
            'ref_id' => $row['ref_id'],
            'type' => StockMovement::TYPE_COUNT,
            'effective_at' => $now->format(format: 'Y-m-d H:i:s'),
            'quantity' => (float) $row['quantity'],
            'original_quantity' => (float) $row['quantity'],
            'original_unit' => null,
            'source_kind' => StockMovement::SOURCE_MANUAL,
            'source_id' => $row['ref_id'],
            'created_at' => $now->format(format: 'Y-m-d H:i:s'),
            'updated_at' => $now->format(format: 'Y-m-d H:i:s'),
            'created_by_user_id' => self::SYSTEM_USER_ID,
            'updated_by_user_id' => self::SYSTEM_USER_ID,
        ]);

        return 1;
    }

    private function rebuildProjection(string $kind, string $table, string $refColumn, string $quantityColumn): int
    {
        $now = $this->dateTimeGenerator->now();
        $rebuilt = 0;

        foreach ($this->stockRows(table: $table, refColumn: $refColumn, quantityColumn: $quantityColumn) as $row) {
            $this->writerTenantConnection->update(
                table: $table,
                data: [
                    $quantityColumn => $this->balanceCalculator->balanceFor(kind: $kind, refId: $row['ref_id']),
                    'updated_at' => $now->format(format: 'Y-m-d H:i:s'),
                ],
                criteria: ['id' => $row['id']],
            );
            ++$rebuilt;
        }

        return $rebuilt;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function stockRows(string $table, string $refColumn, string $quantityColumn): array
    {
        return $this->writerTenantConnection->createQueryBuilder()
            ->select('s.id', sprintf('s.%s AS ref_id', $refColumn), sprintf('s.%s AS quantity', $quantityColumn))
            ->from(table: $table, alias: 's')
            ->executeQuery()
            ->fetchAllAssociative();
    }

    private function hasMovements(string $kind, string $refId): bool
    {
        $result = $this->writerTenantConnection->createQueryBuilder()
            ->select('m.id')
            ->from(table: 'stock_movement', alias: 'm')
            ->where('m.kind = :kind')
            ->andWhere('m.ref_id = :refId')
            ->setParameter(key: 'kind', value: $kind)
            ->setParameter(key: 'refId', value: $refId)
            ->setMaxResults(maxResults: 1)
            ->executeQuery()
            ->fetchOne();

        return false !== $result;
    }
}
