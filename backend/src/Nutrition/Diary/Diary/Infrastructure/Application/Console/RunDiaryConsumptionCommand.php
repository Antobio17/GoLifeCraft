<?php

namespace Nutrition\Diary\Diary\Infrastructure\Application\Console;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Nutrition\Diary\Diary\Application\Command\ConsumePastDiaryEntriesCommand;
use Nutrition\Diary\Diary\Domain\QueryModel\ConsumePastDiaryEntriesNeedleDataQuery;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class RunDiaryConsumptionCommand extends Command
{
    use HandleTrait;

    private const string SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';
    private const string TIMEZONE = 'Europe/Madrid';
    private const int DEFAULT_DAYS = 7;

    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly Connection $writerTenantConnection,
        private readonly EntityManagerInterface $tenantEntityManager,
        private readonly ConsumePastDiaryEntriesNeedleDataQuery $needleDataQuery,
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;

        parent::__construct(name: 'app:diary:consume-past-entries');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Tick as eaten every diary entry of the days already gone that is still pending, so the pantry takes it out without anyone ticking it by hand. Whatever was not eaten is deleted from the diary instead. Idempotent and dated on the day of each entry. Meant to run every night.')
            ->addOption(name: 'tenant', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Run a single tenant database by name instead of discovering all GLC% tenants.', default: null)
            ->addOption(name: 'date', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Treat this ISO date (YYYY-MM-DD) as today instead of the current day in Europe/Madrid.', default: null)
            ->addOption(name: 'days', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'How many days before today to look back. Older pending entries are left as they are.', default: (string) self::DEFAULT_DAYS)
            ->addOption(name: 'dry-run', shortcut: null, mode: InputOption::VALUE_NONE, description: 'List what would be ticked without writing anything.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $today = $input->getOption('date')
            ?? (new \DateTimeImmutable(datetime: 'now', timezone: new \DateTimeZone(timezone: self::TIMEZONE)))->format(format: 'Y-m-d');
        $days = $input->getOption('days');

        if (1 !== preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $today)) {
            $output->writeln(messages: sprintf('<error>The date must follow the YYYY-MM-DD format, got "%s".</error>', $today));

            return Command::INVALID;
        }

        if (1 !== preg_match(pattern: '/^[1-9]\d*$/', subject: (string) $days)) {
            $output->writeln(messages: sprintf('<error>--days must be a positive integer, got "%s".</error>', $days));

            return Command::INVALID;
        }

        $yesterday = new \DateTimeImmutable(datetime: $today.' -1 day');
        $toDate = $yesterday->format(format: 'Y-m-d');
        $fromDate = $yesterday->modify(modifier: sprintf('-%d days', (int) $days - 1))->format(format: 'Y-m-d');

        $tenant = $input->getOption('tenant');
        $databases = null !== $tenant
            ? [$tenant]
            : $this->writerTenantConnection->executeQuery("SHOW DATABASES LIKE 'GLC%'")->fetchFirstColumn();

        if ([] === $databases) {
            $output->writeln(messages: '<comment>No tenant databases found.</comment>');

            return Command::SUCCESS;
        }

        foreach ($databases as $dbname) {
            $this->runTenant(
                dbname: $dbname,
                fromDate: $fromDate,
                toDate: $toDate,
                dryRun: (bool) $input->getOption('dry-run'),
                output: $output,
            );
        }

        return Command::SUCCESS;
    }

    private function runTenant(string $dbname, string $fromDate, string $toDate, bool $dryRun, OutputInterface $output): void
    {
        $this->switcher->switch(tenantId: $dbname);
        $this->tenantEntityManager->clear();

        $pending = $this->needleDataQuery->findPendingEntryIds(fromDate: $fromDate, toDate: $toDate);

        if ([] === $pending) {
            $output->writeln(messages: sprintf('<comment>%s: nothing pending between %s and %s.</comment>', $dbname, $fromDate, $toDate));

            return;
        }

        if ($dryRun) {
            $output->writeln(messages: sprintf('<comment>%s: dry run, %d entries between %s and %s would be ticked.</comment>', $dbname, count($pending), $fromDate, $toDate));

            return;
        }

        $this->handle(message: new ConsumePastDiaryEntriesCommand(
            fromDate: $fromDate,
            toDate: $toDate,
            updatedByUserId: self::SYSTEM_USER_ID,
        ));

        $output->writeln(messages: sprintf('<info>%s: %d entries between %s and %s ticked as eaten.</info>', $dbname, count($pending), $fromDate, $toDate));
    }
}
