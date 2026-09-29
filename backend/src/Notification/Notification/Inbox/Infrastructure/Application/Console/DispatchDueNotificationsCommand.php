<?php

namespace Notification\Notification\Inbox\Infrastructure\Application\Console;

use Doctrine\ORM\EntityManagerInterface;
use Notification\Notification\Inbox\Application\Command\DeliverNotificationCommand;
use Notification\Notification\Inbox\Domain\QueryModel\DispatchDueNotificationsNeedleDataQuery;
use Notification\Notification\Inbox\Domain\QueryModel\Dto\NotificationRecipient;
use Notification\Notification\Inbox\Domain\QueryModel\NotificationRecipientsNeedleDataQuery;
use Notification\Notification\Inbox\Domain\Service\AgendaReminderPlanner;
use Notification\Notification\Inbox\Domain\Service\Dto\DueNotification;
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

        $recipients = $this->recipientsNeedleDataQuery->activeRecipients(tenantId: $input->getOption('tenant'));

        foreach ($recipients as $recipient) {
            $this->dispatchRecipient(
                recipient: $recipient,
                now: $now,
                dryRun: (bool) $input->getOption('dry-run'),
                output: $output,
            );
        }

        return Command::SUCCESS;
    }

    private function dispatchRecipient(NotificationRecipient $recipient, \DateTimeImmutable $now, bool $dryRun, OutputInterface $output): void
    {
        $this->switcher->switch(tenantId: $recipient->tenantId);
        $this->tenantEntityManager->clear();

        $settings = $this->settingsNeedleDataQuery->current();
        $window = $this->agendaReminderPlanner->window(settings: $settings, now: $now);
        $due = $this->agendaReminderPlanner->plan(
            appointments: $this->needleDataQuery->pendingAppointments(fromDate: $window['from'], toDate: $window['to']),
            settings: $settings,
            now: $now,
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

        foreach ($pending as $notification) {
            $output->writeln(messages: sprintf('%s: %s → %s', $recipient->tenantId, $notification->type->value, $notification->dedupeKeyFor(userId: $recipient->userId)));

            if ($dryRun) {
                continue;
            }

            $this->deliver(recipient: $recipient, notification: $notification);
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
