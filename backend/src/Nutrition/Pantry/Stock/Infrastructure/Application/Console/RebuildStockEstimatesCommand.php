<?php

namespace Nutrition\Pantry\Stock\Infrastructure\Application\Console;

use Doctrine\DBAL\Connection;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Service\StockLedger;
use Nutrition\Pantry\Stock\Domain\Model\StockEstimate;
use Nutrition\Pantry\Stock\Domain\Model\StockTrackingMode;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

final class RebuildStockEstimatesCommand extends Command
{
    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly Connection $writerTenantConnection,
        private readonly StockLedger $stockLedger,
        private readonly DateTimeGenerator $dateTimeGenerator,
    ) {
        parent::__construct(name: 'app:pantry:rebuild-stock-estimates');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Recompute the confidence, the band and the level of every article stock from the ledger. Idempotent: run it once after deploying the estimate columns, and on a schedule so that confidence keeps falling while nobody looks at the pantry.')
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

        $now = $this->dateTimeGenerator->now();
        $rebuilt = 0;

        foreach ($this->stockRows() as $row) {
            $this->rebuildRow(row: $row, now: $now);
            ++$rebuilt;
        }

        $output->writeln(messages: sprintf('<info>%s: %d stock estimates rebuilt.</info>', $dbname, $rebuilt));
    }

    /**
     * @param array<string, mixed> $row
     */
    private function rebuildRow(array $row, \DateTime $now): void
    {
        $estimate = StockEstimate::from(
            summary: $this->stockLedger->summaryOf(
                kind: StockMovement::KIND_ARTICLE,
                refId: (string) $row['article_id'],
            ),
            trackingMode: StockTrackingMode::fromValue(value: $row['tracking_mode'] ?? null),
            packSize: null !== $row['pack_size'] ? (float) $row['pack_size'] : null,
            previousReference: null !== $row['reference_quantity'] ? (float) $row['reference_quantity'] : null,
            now: $now,
        );

        $this->writerTenantConnection->update(
            table: 'article_stock',
            data: $this->columnsOf(estimate: $estimate, now: $now),
            criteria: ['id' => $row['id']],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function columnsOf(StockEstimate $estimate, \DateTime $now): array
    {
        return [
            'quantity' => $estimate->quantity,
            'tracking_mode' => $estimate->trackingMode->value,
            'confidence' => $estimate->confidence,
            'uncertainty' => $estimate->uncertainty,
            'min_quantity' => $estimate->minQuantity,
            'max_quantity' => $estimate->maxQuantity,
            'level' => $estimate->level->value,
            'reference_quantity' => $estimate->referenceQuantity,
            'observed_at' => $estimate->observedAt?->format(format: 'Y-m-d H:i:s'),
            'observed_quantity' => $estimate->observedQuantity,
            'inferred_count' => $estimate->inferredCount,
            'inferred_flow' => $estimate->inferredFlow,
            'updated_at' => $now->format(format: 'Y-m-d H:i:s'),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function stockRows(): array
    {
        return $this->writerTenantConnection->createQueryBuilder()
            ->select('s.id', 's.article_id', 's.tracking_mode', 's.reference_quantity', 'e.quantity AS pack_size')
            ->from(table: 'article_stock', alias: 's')
            ->innerJoin('s', 'article', 'a', 'a.id = s.article_id')
            ->leftJoin('a', 'article_equivalence', 'e', 'e.article_id = a.id AND e.unit = a.pack_unit')
            ->executeQuery()
            ->fetchAllAssociative();
    }
}
