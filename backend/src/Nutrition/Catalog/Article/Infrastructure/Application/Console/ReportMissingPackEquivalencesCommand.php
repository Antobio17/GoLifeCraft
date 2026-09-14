<?php

namespace Nutrition\Catalog\Article\Infrastructure\Application\Console;

use Doctrine\DBAL\Connection;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

final class ReportMissingPackEquivalencesCommand extends Command
{
    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly Connection $writerTenantConnection,
    ) {
        parent::__construct(name: 'app:catalog:missing-equivalences');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'List the articles a shopping list cannot express in purchase format, because none of their pack, diary or recipe units has a row in article_equivalence. Those lines fall back to the base quantity instead of a number of packs.')
            ->addOption(name: 'tenant', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Inspect a single tenant database by name instead of discovering all GLC% tenants.', default: null)
            ->addOption(name: 'all', shortcut: null, mode: InputOption::VALUE_NONE, description: 'Report every article, not only those already used in a recipe, a menu or the diary.');
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

        $total = 0;

        foreach ($databases as $dbname) {
            $total += $this->reportTenant(dbname: $dbname, onlyUsed: !$input->getOption('all'), output: $output);
        }

        if ($total > 0) {
            $output->writeln(messages: sprintf('<comment>%d article(s) need a purchase equivalence.</comment>', $total));
        }

        return Command::SUCCESS;
    }

    private function reportTenant(string $dbname, bool $onlyUsed, OutputInterface $output): int
    {
        $this->switcher->switch(tenantId: $dbname);
        $output->writeln(messages: sprintf('<info>Tenant %s</info>', $dbname));

        $rows = $this->findArticlesWithoutPurchaseFormat(onlyUsed: $onlyUsed);

        if ([] === $rows) {
            $output->writeln(messages: '  <comment>every article resolves a purchase format</comment>');

            return 0;
        }

        foreach ($rows as $row) {
            $output->writeln(messages: sprintf(
                '  %s %s — base %s, pack %s, diary %s, recipe %s (used %d time(s))',
                $row['emoji'] ?: '•',
                $row['name'],
                $row['base_unit'] ?? '?',
                $row['pack_unit'] ?? '—',
                $row['diary_unit'] ?? '—',
                $row['recipe_unit'] ?? '—',
                (int) $row['usages'],
            ));
        }

        return count($rows);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function findArticlesWithoutPurchaseFormat(bool $onlyUsed): array
    {
        $usageFilter = $onlyUsed ? 'HAVING usages > 0' : '';

        $sql = <<<SQL
            SELECT
                a.id,
                a.name,
                a.emoji,
                a.base_unit,
                a.pack_unit,
                a.diary_unit,
                a.recipe_unit,
                (
                    (SELECT COUNT(*) FROM recipe_ingredient ri WHERE ri.ref_id = a.id)
                    + (SELECT COUNT(*) FROM menu_item mi WHERE mi.ref_id = a.id)
                    + (SELECT COUNT(*) FROM diary_entry de WHERE de.ref_id = a.id)
                ) AS usages
            FROM article a
            WHERE NOT EXISTS (
                SELECT 1 FROM article_equivalence e
                WHERE e.article_id = a.id
                  AND e.quantity > 0
                  AND e.unit IN (a.pack_unit, a.diary_unit, a.recipe_unit)
            )
            {$usageFilter}
            ORDER BY usages DESC, a.name ASC
            SQL;

        return $this->writerTenantConnection->executeQuery($sql)->fetchAllAssociative();
    }
}
