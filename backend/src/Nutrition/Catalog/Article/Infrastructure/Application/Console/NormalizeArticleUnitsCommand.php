<?php

namespace Nutrition\Catalog\Article\Infrastructure\Application\Console;

use Doctrine\DBAL\ArrayParameterType;
use Doctrine\DBAL\Connection;
use Nutrition\Catalog\Article\Domain\Model\Article;
use Nutrition\Catalog\Article\Domain\Model\ArticleUnit;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

final class NormalizeArticleUnitsCommand extends Command
{
    private const string KIND_MEASUREMENT = 'measurement';
    private const string KIND_ALIAS = 'alias';
    private const string KIND_BASE = 'base';

    private const array ALIAS_MAP = [
        'sachet' => 'container',
        'sobre' => 'container',
        'envase' => 'container',
        'teaspoon' => 'pack',
        'cucharadita' => 'pack',
        'paquete' => 'pack',
        'unidad' => 'unit',
        'unidades' => 'unit',
        'loncha' => 'slice',
        'lonchas' => 'slice',
        'rebanada' => 'bread_slice',
        'vaso' => 'glass',
        'racion' => 'serving',
        'ración' => 'serving',
        'pieza' => 'piece',
        'lata' => 'can',
        'bote' => 'jar',
        'tarro' => 'jar',
        'bolsa' => 'bag',
        'cartón' => 'carton',
        'carton' => 'carton',
        'brik' => 'carton',
        'cucharada' => 'tablespoon',
        'puñado' => 'handful',
    ];

    private const array BASE_MAP = [
        'gram' => Article::BASE_UNIT_GRAM,
        'grams' => Article::BASE_UNIT_GRAM,
        'gramo' => Article::BASE_UNIT_GRAM,
        'gramos' => Article::BASE_UNIT_GRAM,
        'gr' => Article::BASE_UNIT_GRAM,
        'milliliter' => Article::BASE_UNIT_MILLILITER,
        'mililitro' => Article::BASE_UNIT_MILLILITER,
        'mililitros' => Article::BASE_UNIT_MILLILITER,
    ];

    private const array COLUMNS = [
        ['table' => 'article', 'column' => 'base_unit', 'kind' => self::KIND_BASE],
        ['table' => 'article', 'column' => 'recipe_unit', 'kind' => self::KIND_MEASUREMENT],
        ['table' => 'article', 'column' => 'diary_unit', 'kind' => self::KIND_MEASUREMENT],
        ['table' => 'article', 'column' => 'pack_unit', 'kind' => self::KIND_ALIAS],
        ['table' => 'article_equivalence', 'column' => 'unit', 'kind' => self::KIND_ALIAS],
        ['table' => 'recipe_ingredient', 'column' => 'unit', 'kind' => self::KIND_MEASUREMENT],
        ['table' => 'diary_entry', 'column' => 'unit', 'kind' => self::KIND_MEASUREMENT],
        ['table' => 'menu_item', 'column' => 'unit', 'kind' => self::KIND_MEASUREMENT],
    ];

    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly Connection $writerTenantConnection,
    ) {
        parent::__construct(name: 'app:catalog:normalize-units');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Normalize every stored measurement unit to the canonical catalog keys across all tenant databases. Run once after the unit catalog became an enum.')
            ->addOption(name: 'tenant', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Normalize a single tenant database by name instead of discovering all GLC% tenants.', default: null)
            ->addOption(name: 'force', shortcut: null, mode: InputOption::VALUE_NONE, description: 'Actually write the changes. Without it the command only reports what it would change.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $tenant = $input->getOption('tenant');
        $force = (bool) $input->getOption('force');
        $databases = null !== $tenant
            ? [$tenant]
            : $this->writerTenantConnection->executeQuery("SHOW DATABASES LIKE 'GLC%'")->fetchFirstColumn();

        if (empty($databases)) {
            $output->writeln(messages: '<comment>No tenant databases found.</comment>');

            return Command::SUCCESS;
        }

        if (!$force) {
            $output->writeln(messages: '<comment>Dry run: no changes will be written. Add --force to apply them.</comment>');
        }

        $unresolved = 0;

        foreach ($databases as $dbname) {
            $unresolved += $this->normalizeTenant(dbname: $dbname, force: $force, output: $output);
        }

        if ($unresolved > 0) {
            $output->writeln(messages: '<error>Some values could not be mapped to a canonical unit and need a manual decision.</error>');

            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    private function normalizeTenant(string $dbname, bool $force, OutputInterface $output): int
    {
        $this->switcher->switch(tenantId: $dbname);
        $output->writeln(messages: sprintf('<info>Tenant %s</info>', $dbname));

        $changed = 0;

        foreach (self::COLUMNS as $target) {
            $changed += $this->normalizeColumn(
                table: $target['table'],
                column: $target['column'],
                kind: $target['kind'],
                force: $force,
                output: $output,
            );
        }

        if (0 === $changed) {
            $output->writeln(messages: '  <comment>nothing to normalize</comment>');
        }

        return $this->reportUnresolved(dbname: $dbname, force: $force, output: $output);
    }

    private function normalizeColumn(string $table, string $column, string $kind, bool $force, OutputInterface $output): int
    {
        $changed = 0;

        foreach (self::mapFor(kind: $kind) as $legacy => $canonical) {
            $rows = $force
                ? $this->writerTenantConnection->executeStatement(
                    sql: sprintf('UPDATE %s SET %s = ? WHERE %s = ?', $table, $column, $column),
                    params: [$canonical, $legacy],
                )
                : (int) $this->writerTenantConnection->fetchOne(
                    query: sprintf('SELECT COUNT(*) FROM %s WHERE %s = ?', $table, $column),
                    params: [$legacy],
                );

            if (0 === $rows) {
                continue;
            }

            $output->writeln(messages: sprintf('  %s.%s: %d × "%s" → "%s"', $table, $column, $rows, $legacy, $canonical));
            $changed += $rows;
        }

        return $changed;
    }

    private function reportUnresolved(string $dbname, bool $force, OutputInterface $output): int
    {
        $unresolved = 0;

        foreach (self::COLUMNS as $target) {
            $alreadyMapped = $force ? [] : self::mapFor(kind: $target['kind']);
            $values = $this->writerTenantConnection->fetchFirstColumn(
                query: sprintf(
                    'SELECT DISTINCT %s FROM %s WHERE %s IS NOT NULL AND %s NOT IN (?)',
                    $target['column'],
                    $target['table'],
                    $target['column'],
                    $target['column'],
                ),
                params: [self::allowedFor(kind: $target['kind'])],
                types: [ArrayParameterType::STRING],
            );

            foreach ($values as $value) {
                if (array_key_exists($value, $alreadyMapped)) {
                    continue;
                }

                $output->writeln(messages: sprintf(
                    '  <error>%s: %s.%s holds the unknown unit "%s"</error>',
                    $dbname,
                    $target['table'],
                    $target['column'],
                    $value,
                ));
                ++$unresolved;
            }
        }

        return $unresolved;
    }

    /**
     * @return array<string, string>
     */
    private static function mapFor(string $kind): array
    {
        if (self::KIND_BASE === $kind) {
            return self::BASE_MAP;
        }

        if (self::KIND_ALIAS === $kind) {
            return self::ALIAS_MAP;
        }

        return array_merge(self::ALIAS_MAP, self::BASE_MAP);
    }

    /**
     * @return string[]
     */
    private static function allowedFor(string $kind): array
    {
        if (self::KIND_BASE === $kind) {
            return Article::BASE_UNITS;
        }

        if (self::KIND_ALIAS === $kind) {
            return ArticleUnit::values();
        }

        return array_merge(Article::BASE_UNITS, ArticleUnit::values());
    }
}
