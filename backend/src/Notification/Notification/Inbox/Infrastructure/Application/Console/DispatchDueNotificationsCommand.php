<?php

namespace Notification\Notification\Inbox\Infrastructure\Application\Console;

use Doctrine\ORM\EntityManagerInterface;
use Notification\Notification\Inbox\Application\Command\DeliverNotificationCommand;
use Notification\Notification\Inbox\Domain\QueryModel\DispatchDueNotificationsNeedleDataQuery;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\AgendaAppointment;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\NotificationRecipient;
use Notification\Notification\Inbox\Domain\QueryModel\NotificationRecipientsNeedleDataQuery;
use Notification\Notification\Inbox\Domain\Service\AgendaReminderPlanner;
use Notification\Notification\Inbox\Domain\Service\Dto\DueNotification;
use Notification\Notification\Inbox\Domain\Service\MealReminderPlanner;
use Notification\Notification\Inbox\Domain\Service\WorkoutReminderPlanner;
use Notification\Notification\Settings\Domain\QueryModel\Dto\NotificationSettingsSnapshot;
use Notification\Notification\Settings\Domain\QueryModel\NotificationSettingsNeedleDataQuery;
use Psr\Log\LoggerInterface;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class DispatchDueNotificationsCommand extends Command
{
    use HandleTrait;

    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly EntityManagerInterface $tenantEntityManager,
        private readonly NotificationRecipientsNeedleDataQuery $recipientsNeedleDataQuery,
        private readonly NotificationSettingsNeedleDataQuery $settingsNeedleDataQuery,
        private readonly DispatchDueNotificationsNeedleDataQuery $needleDataQuery,
        private readonly AgendaReminderPlanner $agendaReminderPlanner,
        private readonly MealReminderPlanner $mealReminderPlanner,
        private readonly WorkoutReminderPlanner $workoutReminderPlanner,
        MessageBusInterface $messageBus,
        private readonly DateTimeGenerator $dateTimeGenerator,
        private readonly LoggerInterface $logger,
    ) {
        $this->messageBus = $messageBus;

        parent::__construct(name: 'app:notification:dispatch');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Deliver every notification that is due right now to the inbox of its user, and push it to their devices unless it falls in their quiet hours. Idempotent: each notification is delivered once, so it is meant to run every minute.')
            ->addOption(name: 'tenant', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Only dispatch the users of this tenant database.', default: null)
            ->addOption(name: 'now', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Treat this ISO 8601 date-time as the current moment.', default: null)
            ->addOption(name: 'dry-run', shortcut: null, mode: InputOption::VALUE_NONE, description: 'List what would be delivered without writing or pushing anything.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $now = $this->resolveNow(rawNow: $input->getOption('now'));

        if (null === $now) {
            $output->writeln(messages: sprintf('<error>The --now option must be an ISO 8601 date-time, got "%s".</error>', $input->getOption('now')));

            return Command::FAILURE;
        }

        $dryRun = (bool) $input->getOption('dry-run');
        $recipients = $this->recipientsNeedleDataQuery->activeRecipients(tenantId: $input->getOption('tenant'));

        $output->writeln(messages: sprintf('Now: %s (UTC)%s', $now->setTimezone(timezone: new \DateTimeZone(timezone: 'UTC'))->format(format: 'Y-m-d H:i:s'), $dryRun ? ' [dry-run]' : ''), options: OutputInterface::VERBOSITY_VERBOSE);

        $dispatched = 0;

        foreach ($recipients as $recipient) {
            $dispatched += $this->dispatchRecipient(
                recipient: $recipient,
                now: $now,
                dryRun: $dryRun,
                output: $output,
            );
        }

        $output->writeln(messages: sprintf('%d recipient(s) checked, %d notification(s) %s.', count(value: $recipients), $dispatched, $dryRun ? 'would be delivered' : 'delivered'));

        return Command::SUCCESS;
    }

    private function dispatchRecipient(NotificationRecipient $recipient, \DateTimeImmutable $now, bool $dryRun, OutputInterface $output): int
    {
        $this->switcher->switch(tenantId: $recipient->tenantId);
        $this->tenantEntityManager->clear();

        $settings = $this->settingsNeedleDataQuery->current();
        $window = $this->agendaReminderPlanner->window(settings: $settings, now: $now);
        $appointments = $this->needleDataQuery->pendingAppointments(fromDate: $window['from'], toDate: $window['to']);
        $due = [
            ...$this->agendaReminderPlanner->plan(
                appointments: $appointments,
                settings: $settings,
                now: $now,
            ),
            ...$this->mealReminderPlanner->plan(
                entries: $this->needleDataQuery->diaryEntries(date: $this->mealReminderPlanner->day(settings: $settings, now: $now)),
                settings: $settings,
                now: $now,
            ),
            ...$this->workoutReminderPlanner->plan(
                workouts: $this->needleDataQuery->activeWorkouts(),
                settings: $settings,
                now: $now,
            ),
        ];

        $this->describeRecipient(
            recipient: $recipient,
            settings: $settings,
            appointments: $appointments,
            window: $window,
            now: $now,
            output: $output,
        );

        $delivered = $this->needleDataQuery->deliveredDedupeKeys(
            dedupeKeys: array_map(
                callback: static fn (DueNotification $notification): string => $notification->dedupeKeyFor(userId: $recipient->userId),
                array: $due,
            ),
        );

        $pending = array_filter(
            array: $due,
            callback: static fn (DueNotification $notification): bool => !in_array(
                needle: $notification->dedupeKeyFor(userId: $recipient->userId),
                haystack: $delivered,
                strict: true,
            ),
        );

        foreach ($due as $notification) {
            $output->writeln(
                messages: sprintf(
                    '  due %s at %s%s',
                    $notification->type->value,
                    $notification->dueAt->format(format: 'Y-m-d H:i'),
                    in_array(needle: $notification->dedupeKeyFor(userId: $recipient->userId), haystack: $delivered, strict: true) ? ' (already delivered)' : '',
                ),
                options: OutputInterface::VERBOSITY_VERBOSE,
            );
        }

        foreach ($pending as $notification) {
            $output->writeln(messages: sprintf('%s: %s → %s', $recipient->tenantId, $notification->type->value, $notification->dedupeKeyFor(userId: $recipient->userId)));

            if ($dryRun) {
                continue;
            }

            $this->deliver(recipient: $recipient, notification: $notification);
        }

        return count(value: $pending);
    }

    /**
     * @param AgendaAppointment[]             $appointments
     * @param array{from: string, to: string} $window
     */
    private function describeRecipient(
        NotificationRecipient $recipient,
        NotificationSettingsSnapshot $settings,
        array $appointments,
        array $window,
        \DateTimeImmutable $now,
        OutputInterface $output,
    ): void {
        if (!$output->isVerbose()) {
            return;
        }

        $output->writeln(messages: sprintf(
            '<info>%s</info> user %s · local now %s (%s)%s',
            $recipient->tenantId,
            $recipient->userId,
            $settings->localNow(now: $now)->format(format: 'Y-m-d H:i'),
            $settings->timezone,
            $settings->isQuietAt(now: $now) ? ' · quiet hours, no push' : '',
        ));

        foreach ($settings->preferences as $preference) {
            $output->writeln(messages: sprintf(
                '  pref %s: %s%s%s',
                $preference->type->value,
                $preference->enabled ? 'on' : 'off',
                null !== $preference->time ? ' at '.$preference->time : '',
                null !== $preference->leadMinutes ? sprintf(' %d min before', $preference->leadMinutes) : '',
            ));
        }

        $output->writeln(messages: sprintf('  %d pending appointment(s) between %s and %s', count(value: $appointments), $window['from'], $window['to']));

        foreach ($appointments as $appointment) {
            $output->writeln(messages: sprintf(
                '  appointment "%s" %s %s · created %s UTC',
                $appointment->title,
                $appointment->entryDate,
                $appointment->time ?? '(no time)',
                $appointment->createdAt->format(format: 'Y-m-d H:i'),
            ));
        }
    }

    private function deliver(NotificationRecipient $recipient, DueNotification $notification): void
    {
        try {
            $this->handle(message: new DeliverNotificationCommand(
                userId: $recipient->userId,
                type: $notification->type->value,
                dedupeKey: $notification->dedupeKeyFor(userId: $recipient->userId),
                params: $notification->params,
                url: $notification->url,
                dueAt: $notification->dueAt,
            ));
        } catch (\Throwable $e) {
            $this->logger->error(message: 'Notification could not be delivered.', context: [
                'tenantId' => $recipient->tenantId,
                'userId' => $recipient->userId,
                'type' => $notification->type->value,
                'exception' => $e,
            ]);
        }
    }

    private function resolveNow(?string $rawNow): ?\DateTimeImmutable
    {
        if (null === $rawNow) {
            return \DateTimeImmutable::createFromMutable(object: $this->dateTimeGenerator->now());
        }

        $now = \DateTimeImmutable::createFromFormat(format: \DateTimeInterface::ATOM, datetime: $rawNow);

        return false === $now ? null : $now;
    }
}
