<?php

namespace Gamification\Achievement\Achievement\Infrastructure\Application\Console;

use Doctrine\ORM\EntityManagerInterface;
use Gamification\Achievement\Achievement\Application\Command\DeleteAchievementProgressCommand;
use Gamification\Achievement\Achievement\Application\Command\RecordAchievementProgressCommandFactory;
use Gamification\Achievement\Achievement\Domain\QueryModel\Dto\AchievementOwner;
use Gamification\Achievement\Achievement\Domain\QueryModel\RebuildAchievementsNeedleDataQuery;
use Gamification\Achievement\Achievement\Domain\Service\AchievementCatalog;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Messenger\MessageBusInterface;

final class RebuildAchievementsCommand extends Command
{
    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly EntityManagerInterface $tenantEntityManager,
        private readonly RebuildAchievementsNeedleDataQuery $needleDataQuery,
        private readonly AchievementCatalog $achievementCatalog,
        private readonly RecordAchievementProgressCommandFactory $commandFactory,
        private readonly MessageBusInterface $messageBus,
    ) {
        parent::__construct(name: 'app:achievement:rebuild');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Recompute every achievement from the domain event log of each tenant. Wipes the current progress first, and records the replayed unlocks as already seen so nobody gets a burst of celebrations.')
            ->addOption(name: 'tenant', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Only rebuild this tenant database.', default: null);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $owners = $this->needleDataQuery->owners(tenantId: $input->getOption('tenant'));
        $rebuiltTenants = [];

        foreach ($owners as $owner) {
            if (in_array(needle: $owner->tenantId, haystack: $rebuiltTenants, strict: true)) {
                continue;
            }

            $replayed = $this->rebuildTenant(owner: $owner);
            $rebuiltTenants[] = $owner->tenantId;

            $output->writeln(messages: sprintf('%s: %d occurrence(s) replayed.', $owner->tenantId, $replayed));
        }

        $output->writeln(messages: sprintf('%d tenant(s) rebuilt.', count(value: $rebuiltTenants)));

        return Command::SUCCESS;
    }

    private function rebuildTenant(AchievementOwner $owner): int
    {
        $this->switcher->switch(tenantId: $owner->tenantId);
        $this->tenantEntityManager->clear();

        foreach ($this->needleDataQuery->progressDefinitionKeys() as $definitionKey) {
            $this->messageBus->dispatch(new DeleteAchievementProgressCommand(
                definitionKey: $definitionKey,
                deletedByUserId: $owner->userId,
            ));
        }

        $replayed = 0;

        foreach ($this->needleDataQuery->trackedEvents(eventNames: $this->achievementCatalog->eventNames()) as $event) {
            $commands = $this->commandFactory->forEvent(
                eventName: $event->eventName,
                payload: $event->payload,
                occurredOn: $event->occurredOn,
                celebrate: false,
                fallbackUserId: $owner->userId,
            );

            foreach ($commands as $command) {
                $this->messageBus->dispatch($command);
                ++$replayed;
            }
        }

        return $replayed;
    }
}
