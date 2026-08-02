<?php

namespace Shared\Tenant\Tenant\Infrastructure\Application\Console;

use Doctrine\DBAL\Connection;
use Shared\Tenant\Tenant\Infrastructure\Domain\Service\Doctrine\TenantTableOptions;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

final class FixDatabaseCollationCommand extends Command
{
    public function __construct(
        private readonly Connection $masterConnection,
        private readonly Connection $writerTenantConnection,
    ) {
        parent::__construct(name: 'app:db:fix-collation');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: sprintf(
                'Normalize the master and tenant databases, tables and columns to %s.',
                TenantTableOptions::COLLATION,
            ))
            ->addOption(
                name: 'force',
                shortcut: null,
                mode: InputOption::VALUE_NONE,
                description: 'Actually execute the SQL statements.'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $force = (bool) $input->getOption('force');
        $pending = 0;

        $pending += $this->normalize(
            connection: $this->masterConnection,
            database: (string) $this->masterConnection->getDatabase(),
            force: $force,
            output: $output,
        );

        $databases = $this->writerTenantConnection->executeQuery("SHOW DATABASES LIKE 'GLC%'")->fetchFirstColumn();

        if (empty($databases)) {
            $output->writeln(messages: '<comment>No tenant databases found.</comment>');
        }

        foreach ($databases as $database) {
            $pending += $this->normalize(
                connection: $this->writerTenantConnection,
                database: $database,
                force: $force,
                output: $output,
            );
        }

        if (0 !== $pending && !$force) {
            $output->writeln(messages: '<comment>Run again with --force to execute these statements.</comment>');
        }

        return Command::SUCCESS;
    }

    private function normalize(Connection $connection, string $database, bool $force, OutputInterface $output): int
    {
        $output->writeln(messages: sprintf('<info>Processing database:</info> %s', $database));

        $statements = array_merge(
            $this->buildDatabaseStatement(connection: $connection, database: $database),
            $this->buildTableStatements(connection: $connection, database: $database),
        );

        if (empty($statements)) {
            $output->writeln(messages: '<comment>Already normalized.</comment>');

            return 0;
        }

        foreach ($statements as $statement) {
            $output->writeln(messages: $statement);
        }

        if (!$force) {
            return count($statements);
        }

        foreach ($statements as $statement) {
            $connection->executeStatement(sql: $statement);
        }

        $output->writeln(messages: sprintf('<comment>Collation fixed for %s</comment>', $database));

        return count($statements);
    }

    /**
     * @return array<int, string>
     */
    private function buildDatabaseStatement(Connection $connection, string $database): array
    {
        $collation = $connection->executeQuery(
            sql: 'SELECT DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = :database',
            params: ['database' => $database],
        )->fetchOne();

        if (TenantTableOptions::COLLATION === $collation) {
            return [];
        }

        return [sprintf(
            'ALTER DATABASE `%s` CHARACTER SET %s COLLATE %s',
            $database,
            TenantTableOptions::CHARSET,
            TenantTableOptions::COLLATION,
        )];
    }

    /**
     * @return array<int, string>
     */
    private function buildTableStatements(Connection $connection, string $database): array
    {
        $sql = <<<'SQL'
            SELECT TABLE_NAME
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = :database
              AND TABLE_TYPE = 'BASE TABLE'
              AND TABLE_COLLATION <> :collation
            UNION
            SELECT DISTINCT TABLE_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = :database
              AND COLLATION_NAME IS NOT NULL
              AND COLLATION_NAME <> :collation
            ORDER BY TABLE_NAME
            SQL;

        $tables = $connection->executeQuery(
            sql: $sql,
            params: ['database' => $database, 'collation' => TenantTableOptions::COLLATION],
        )->fetchFirstColumn();

        return array_map(
            callback: static fn (string $table): string => sprintf(
                'ALTER TABLE `%s`.`%s` CONVERT TO CHARACTER SET %s COLLATE %s',
                $database,
                $table,
                TenantTableOptions::CHARSET,
                TenantTableOptions::COLLATION,
            ),
            array: $tables,
        );
    }
}
