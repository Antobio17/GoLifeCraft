<?php

namespace App\Tests\Nutrition\Diary\Diary\Infrastructure\Application\Console;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Nutrition\Diary\Diary\Application\Command\ConsumeDiaryEntryCommand;
use Nutrition\Diary\Diary\Application\Query\GetPastPendingDiaryEntryIdsQuery;
use Nutrition\Diary\Diary\Application\Query\GetPastPendingDiaryEntryIdsQueryHandler;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntrySnapshot;
use Nutrition\Diary\Diary\Infrastructure\Application\Console\RunDiaryConsumptionCommand;
use Nutrition\Diary\Diary\Infrastructure\Domain\QueryModel\InMemory\InMemoryConsumePastDiaryEntriesNeedleDataQuery;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use PHPUnit\Framework\TestCase;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Tester\CommandTester;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\HandledStamp;

final class RunDiaryConsumptionCommandTest extends TestCase
{
    private const string SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

    public function testItTicksThePendingEntriesOfTheLastSevenDaysOldestFirst(): void
    {
        [$tester, $messageBus] = $this->givenTester(entries: [
            $this->entry(id: 'yesterday-dinner', entryDate: '2026-10-17'),
            $this->entry(id: 'a-week-ago-lunch', entryDate: '2026-10-11'),
        ]);

        $tester->execute(input: ['--tenant' => 'GLC000000001', '--date' => '2026-10-18']);

        $this->assertSame(expected: Command::SUCCESS, actual: $tester->getStatusCode());
        $this->assertSame(expected: ['a-week-ago-lunch', 'yesterday-dinner'], actual: $this->dispatchedIds(messageBus: $messageBus));
        $this->assertTrue(condition: $messageBus->dispatched[0]->consumed);
        $this->assertSame(expected: self::SYSTEM_USER_ID, actual: $messageBus->dispatched[0]->updatedByUserId);
    }

    public function testItLeavesTodayAndTheDaysBeforeTheWindowPending(): void
    {
        [$tester, $messageBus] = $this->givenTester(entries: [
            $this->entry(id: 'today-breakfast', entryDate: '2026-10-18'),
            $this->entry(id: 'eight-days-ago-dinner', entryDate: '2026-10-10'),
            $this->entry(id: 'yesterday-dinner', entryDate: '2026-10-17'),
        ]);

        $tester->execute(input: ['--tenant' => 'GLC000000001', '--date' => '2026-10-18']);

        $this->assertSame(expected: ['yesterday-dinner'], actual: $this->dispatchedIds(messageBus: $messageBus));
    }

    public function testItWidensTheWindowWithTheDaysOption(): void
    {
        [$tester, $messageBus] = $this->givenTester(entries: [
            $this->entry(id: 'eight-days-ago-dinner', entryDate: '2026-10-10'),
        ]);

        $tester->execute(input: ['--tenant' => 'GLC000000001', '--date' => '2026-10-18', '--days' => '8']);

        $this->assertSame(expected: ['eight-days-ago-dinner'], actual: $this->dispatchedIds(messageBus: $messageBus));
    }

    public function testItSkipsTheEntriesAlreadyTicked(): void
    {
        $ticked = $this->entry(id: 'yesterday-lunch', entryDate: '2026-10-17');
        $ticked->consume(consumed: true, updatedByUserId: 'god-user-id', dateTimeGenerator: new DateTimeGenerator());

        [$tester, $messageBus] = $this->givenTester(entries: [$ticked]);

        $tester->execute(input: ['--tenant' => 'GLC000000001', '--date' => '2026-10-18']);

        $this->assertSame(expected: [], actual: $this->dispatchedIds(messageBus: $messageBus));
    }

    public function testItWritesNothingOnADryRun(): void
    {
        [$tester, $messageBus] = $this->givenTester(entries: [
            $this->entry(id: 'yesterday-dinner', entryDate: '2026-10-17'),
        ]);

        $tester->execute(input: ['--tenant' => 'GLC000000001', '--date' => '2026-10-18', '--dry-run' => true]);

        $this->assertSame(expected: [], actual: $this->dispatchedIds(messageBus: $messageBus));
        $this->assertStringContainsString(needle: '1 entries', haystack: $tester->getDisplay());
    }

    public function testItRejectsAMalformedDate(): void
    {
        [$tester, $messageBus] = $this->givenTester(entries: []);

        $tester->execute(input: ['--tenant' => 'GLC000000001', '--date' => '18/10/2026']);

        $this->assertSame(expected: Command::INVALID, actual: $tester->getStatusCode());
    }

    public function testItRejectsANonPositiveNumberOfDays(): void
    {
        [$tester, $messageBus] = $this->givenTester(entries: []);

        $tester->execute(input: ['--tenant' => 'GLC000000001', '--date' => '2026-10-18', '--days' => '0']);

        $this->assertSame(expected: Command::INVALID, actual: $tester->getStatusCode());
    }

    /**
     * @param DiaryEntry[] $entries
     *
     * @return array{0: CommandTester, 1: MessageBusInterface}
     */
    private function givenTester(array $entries): array
    {
        $messageBus = $this->givenMessageBus(queryHandler: new GetPastPendingDiaryEntryIdsQueryHandler(
            needleDataQuery: new InMemoryConsumePastDiaryEntriesNeedleDataQuery(entries: $entries),
        ));

        $tester = new CommandTester(command: new RunDiaryConsumptionCommand(
            switcher: new class implements TenantConnectionSwitcher {
                public function switch(string $tenantId): void
                {
                }
            },
            writerTenantConnection: $this->createStub(Connection::class),
            tenantEntityManager: $this->createStub(EntityManagerInterface::class),
            messageBus: $messageBus,
        ));

        return [$tester, $messageBus];
    }

    private function entry(string $id, string $entryDate): DiaryEntry
    {
        return DiaryEntry::create(
            id: $id,
            entryDate: $entryDate,
            meal: DiaryEntry::MEAL_DINNER,
            kind: DiaryEntry::KIND_RECIPE,
            refId: 'recipe-1',
            quantity: 1.0,
            unit: null,
            snapshot: new DiaryEntrySnapshot(
                name: 'Lentejas con chorizo',
                emoji: '🍲',
                macros: MacroBreakdown::zero(),
            ),
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    /**
     * @return string[]
     */
    private function dispatchedIds(MessageBusInterface $messageBus): array
    {
        return array_map(static fn (ConsumeDiaryEntryCommand $command): string => $command->entryId, $messageBus->dispatched);
    }

    private function givenMessageBus(GetPastPendingDiaryEntryIdsQueryHandler $queryHandler): MessageBusInterface
    {
        return new class($queryHandler) implements MessageBusInterface {
            /** @var array<int, ConsumeDiaryEntryCommand> */
            public array $dispatched = [];

            public function __construct(private readonly GetPastPendingDiaryEntryIdsQueryHandler $queryHandler)
            {
            }

            public function dispatch(object $message, array $stamps = []): Envelope
            {
                if ($message instanceof GetPastPendingDiaryEntryIdsQuery) {
                    return new Envelope(message: $message, stamps: [new HandledStamp(result: ($this->queryHandler)($message), handlerName: 'query')]);
                }

                $this->dispatched[] = $message;

                return new Envelope(message: $message, stamps: [new HandledStamp(result: null, handlerName: 'command')]);
            }
        };
    }
}
