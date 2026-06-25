<?php

namespace Shared\Tenant\Tenant\Infrastructure\Application\Console;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\Tools\SchemaTool;
use Doctrine\Persistence\ManagerRegistry;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

final class UpdateTenantSchemaCommand extends Command
{
    public function __construct(
        private readonly ManagerRegistry $doctrine,
        private readonly TenantConnectionSwitcher $switcher,
        private readonly Connection $writerTenantConnection,
    ) {
        parent::__construct(name: 'app:tenant:schema-update');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Update the database schema for all tenant databases.')
            ->addOption(
                name: 'dump-sql',
                shortcut: null,
                mode: InputOption::VALUE_NONE,
                description: 'Only dump SQL statements instead of executing them.'
            )
            ->addOption(
                name: 'force',
                shortcut: null,
                mode: InputOption::VALUE_NONE,
                description: 'Actually execute the SQL statements.'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $dump = (bool) $input->getOption('dump-sql');
        $force = (bool) $input->getOption('force');

        $sql = "SHOW DATABASES LIKE 'tenant\\_%'";
        $databases = $this->writerTenantConnection->executeQuery($sql)->fetchFirstColumn();

        if (empty($databases)) {
            $output->writeln(messages: '<comment>No tenant databases found.</comment>');

            return Command::SUCCESS;
        }

        foreach ($databases as $dbname) {
            $output->writeln(messages: sprintf('<info>Processing tenant database:</info> %s', $dbname));

            $this->switcher->switch(tenantId: $dbname);

            $em = $this->doctrine->resetManager('tenant_manager');
            $metadata = $em->getMetadataFactory()->getAllMetadata();

            if (empty($metadata)) {
                $output->writeln(messages: '<comment>Nothing to update for this tenant (no metadata).</comment>');
                continue;
            }

            $schemaTool = new SchemaTool(em: $em);

            if ($dump) {
                $queries = $schemaTool->getUpdateSchemaSql(classes: $metadata);
                foreach ($queries as $query) {
                    $output->writeln(messages: $query);
                }
            }

            if ($force) {
                $schemaTool->updateSchema(classes: $metadata);
                $output->writeln(messages: sprintf('<comment>Schema updated for %s</comment>', $dbname));
            }

            $em->clear();
        }

        return Command::SUCCESS;
    }
}
