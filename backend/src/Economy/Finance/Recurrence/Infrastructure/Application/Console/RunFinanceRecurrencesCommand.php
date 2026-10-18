<?php

namespace Economy\Finance\Recurrence\Infrastructure\Application\Console;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Economy\Finance\Recurrence\Application\Command\GenerateFinanceRecurrenceCommand;
use Economy\Finance\Recurrence\Application\Query\GetPendingFinanceRecurrenceBookingsQuery;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class RunFinanceRecurrencesCommand extends Command
{
    use HandleTrait;

    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly Connection $writerTenantConnection,
        private readonly EntityManagerInterface $tenantEntityManager,
        MessageBusInterface $messageBus,
        private readonly DateTimeGenerator $dateTimeGenerator,
    ) {
        $this->messageBus = $messageBus;

        parent::__construct(name: 'app:economy:run-recurrences');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Book the movements of every recurring income and expense whose charge day has already arrived. Idempotent: a month is booked once, and a run that is late catches up with the months it missed. Meant to run daily.')
            ->addOption(name: 'tenant', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Run a single tenant database by name instead of discovering all GLC% tenants.', default: null)
            ->addOption(name: 'date', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Treat this ISO date (YYYY-MM-DD) as today instead of the current day.', default: null)
            ->addOption(name: 'dry-run', shortcut: null, mode: InputOption::VALUE_NONE, description: 'List what would be booked without writing anything.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $today = $input->getOption('date') ?? $this->dateTimeGenerator->now()->format(format: 'Y-m-d');

        if (1 !== preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $today)) {
            $output->writeln(messages: sprintf('<error>The date must follow the YYYY-MM-DD format, got "%s".</error>', $today));

            return Command::FAILURE;
        }

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
                today: $today,
                dryRun: (bool) $input->getOption('dry-run'),
                output: $output,
            );
        }

        return Command::SUCCESS;
    }

    private function runTenant(string $dbname, string $today, bool $dryRun, OutputInterface $output): void
    {
        $this->switcher->switch(tenantId: $dbname);
        $this->tenantEntityManager->clear();

        $bookings = $this->handle(message: new GetPendingFinanceRecurrenceBookingsQuery(today: $today));

        if ([] === $bookings) {
            $output->writeln(messages: sprintf('<comment>%s: nothing to book.</comment>', $dbname));

            return;
        }

        foreach ($bookings as $booking) {
            $output->writeln(messages: sprintf('%s: %s → %s', $dbname, $booking->note, $booking->month));
        }

        if ($dryRun) {
            $output->writeln(messages: sprintf('<comment>%s: dry run, nothing booked.</comment>', $dbname));

            return;
        }

        foreach ($bookings as $booking) {
            $this->handle(message: new GenerateFinanceRecurrenceCommand(
                financeRecurrenceId: $booking->financeRecurrenceId,
                month: $booking->month,
                today: $booking->today,
            ));
        }

        $output->writeln(messages: sprintf('<info>%s: %d movements booked.</info>', $dbname, count($bookings)));
    }
}
