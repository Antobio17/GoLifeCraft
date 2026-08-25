<?php

namespace App\Tests\Gym\Training\Session\Application\Command;

use Gym\Training\Session\Application\Command\AddSessionExerciseCommand;
use Gym\Training\Session\Application\Command\AddSessionExerciseCommandHandler;
use Gym\Training\Session\Application\Command\CreateSessionCommand;
use Gym\Training\Session\Application\Command\CreateSessionCommandHandler;
use Gym\Training\Session\Application\Command\ExerciseSetAssembler;
use Gym\Training\Session\Application\Command\ExerciseSetData;
use Gym\Training\Session\Application\Command\RemoveSessionExerciseCommand;
use Gym\Training\Session\Application\Command\RemoveSessionExerciseCommandHandler;
use Gym\Training\Session\Application\Command\ReorderSessionExercisesCommand;
use Gym\Training\Session\Application\Command\ReorderSessionExercisesCommandHandler;
use Gym\Training\Session\Application\Command\SessionExerciseAssembler;
use Gym\Training\Session\Application\Command\SessionExerciseData;
use Gym\Training\Session\Application\Command\UpdateSessionDetailsCommand;
use Gym\Training\Session\Application\Command\UpdateSessionDetailsCommandHandler;
use Gym\Training\Session\Application\Command\UpdateSessionExerciseCommand;
use Gym\Training\Session\Application\Command\UpdateSessionExerciseCommandHandler;
use Gym\Training\Session\Domain\Exception\UpdateSessionException;
use Gym\Training\Session\Infrastructure\Domain\Model\InMemory\InMemorySessionRepository;
use Gym\Training\Session\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateSessionNeedleDataQuery;
use Gym\Training\Session\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateSessionNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class SessionExerciseCommandHandlersTest extends TestCase
{
    private InMemorySessionRepository $sessionRepository;
    private InMemoryUpdateSessionNeedleDataQuery $needleDataQuery;
    private UpdateSessionDetailsCommandHandler $updateDetailsHandler;
    private AddSessionExerciseCommandHandler $addExerciseHandler;
    private UpdateSessionExerciseCommandHandler $updateExerciseHandler;
    private RemoveSessionExerciseCommandHandler $removeExerciseHandler;
    private ReorderSessionExercisesCommandHandler $reorderExercisesHandler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $domainEventCollectorService = new DomainEventCollectorService();
        $exerciseSetAssembler = new ExerciseSetAssembler(dateTimeGenerator: $dateTimeGenerator);
        $this->sessionRepository = new InMemorySessionRepository();
        $this->needleDataQuery = new InMemoryUpdateSessionNeedleDataQuery();

        $createHandler = new CreateSessionCommandHandler(
            sessionRepository: $this->sessionRepository,
            needleDataQuery: new InMemoryCreateSessionNeedleDataQuery(),
            sessionExerciseAssembler: new SessionExerciseAssembler(dateTimeGenerator: $dateTimeGenerator),
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        ($createHandler)(new CreateSessionCommand(
            name: 'Empuje A',
            estimatedDurationMinutes: 55,
            exercises: [
                new SessionExerciseData(
                    exerciseId: 'exercise-1',
                    position: 1,
                    note: null,
                    sets: [new ExerciseSetData(position: 1, reps: 10, weight: 40.0)],
                ),
            ],
            createdByUserId: 'god-user-id',
        ));

        $this->needleDataQuery->addExistingName(sessionId: 'session-1', name: 'Empuje A');

        $this->updateDetailsHandler = new UpdateSessionDetailsCommandHandler(
            sessionRepository: $this->sessionRepository,
            needleDataQuery: $this->needleDataQuery,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->addExerciseHandler = new AddSessionExerciseCommandHandler(
            sessionRepository: $this->sessionRepository,
            exerciseSetAssembler: $exerciseSetAssembler,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->updateExerciseHandler = new UpdateSessionExerciseCommandHandler(
            sessionRepository: $this->sessionRepository,
            exerciseSetAssembler: $exerciseSetAssembler,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->removeExerciseHandler = new RemoveSessionExerciseCommandHandler(
            sessionRepository: $this->sessionRepository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        $this->reorderExercisesHandler = new ReorderSessionExercisesCommandHandler(
            sessionRepository: $this->sessionRepository,
            domainEventCollectorService: $domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testUpdatingDetailsLeavesExercisesUntouched(): void
    {
        ($this->updateDetailsHandler)(new UpdateSessionDetailsCommand(
            sessionId: 'session-1',
            name: 'Empuje B',
            estimatedDurationMinutes: 40,
            updatedByUserId: 'god-user-id',
        ));

        $session = $this->sessionRepository->findById(id: 'session-1');
        $this->assertEquals(expected: 'Empuje B', actual: $session->name);
        $this->assertEquals(expected: 40, actual: $session->estimatedDurationMinutes);
        $this->assertCount(expectedCount: 1, haystack: $session->exercises);
        $this->assertEquals(expected: 'exercise-1', actual: $session->exercises[0]->exerciseId);
    }

    public function testItAddsAnExerciseWithTheGivenId(): void
    {
        ($this->addExerciseHandler)($this->addCommand());

        $session = $this->sessionRepository->findById(id: 'session-1');
        $this->assertCount(expectedCount: 2, haystack: $session->exercises);
        $this->assertEquals(expected: 'session-exercise-2', actual: $session->exercises[1]->id);
        $this->assertEquals(expected: 2, actual: $session->exercises[1]->position);
        $this->assertCount(expectedCount: 1, haystack: $session->exercises[1]->sets);
    }

    public function testAddingTheSameExerciseTwiceIsIdempotent(): void
    {
        ($this->addExerciseHandler)($this->addCommand());
        ($this->addExerciseHandler)($this->addCommand());

        $session = $this->sessionRepository->findById(id: 'session-1');
        $this->assertCount(expectedCount: 2, haystack: $session->exercises);
    }

    public function testItReplacesTheSetsOfASingleExercise(): void
    {
        ($this->addExerciseHandler)($this->addCommand());

        $session = $this->sessionRepository->findById(id: 'session-1');
        $untouchedId = $session->exercises[0]->id;

        ($this->updateExerciseHandler)(new UpdateSessionExerciseCommand(
            sessionId: 'session-1',
            sessionExerciseId: 'session-exercise-2',
            sets: [
                new ExerciseSetData(position: 1, reps: 8, weight: 60.0),
                new ExerciseSetData(position: 2, reps: 6, weight: 65.0),
            ],
            note: 'Baja despacio',
            updatedByUserId: 'god-user-id',
        ));

        $session = $this->sessionRepository->findById(id: 'session-1');
        $this->assertCount(expectedCount: 1, haystack: $session->exercises[0]->sets);
        $this->assertEquals(expected: $untouchedId, actual: $session->exercises[0]->id);
        $this->assertCount(expectedCount: 2, haystack: $session->exercises[1]->sets);
        $this->assertEquals(expected: 'Baja despacio', actual: $session->exercises[1]->note);
    }

    public function testItThrowsWhenUpdatingAnUnknownExercise(): void
    {
        $this->expectException(exception: UpdateSessionException::class);

        ($this->updateExerciseHandler)(new UpdateSessionExerciseCommand(
            sessionId: 'session-1',
            sessionExerciseId: 'missing-exercise',
            sets: [],
            note: null,
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItRemovesAnExerciseAndRepositionsTheRest(): void
    {
        ($this->addExerciseHandler)($this->addCommand());

        $session = $this->sessionRepository->findById(id: 'session-1');
        $firstId = $session->exercises[0]->id;

        ($this->removeExerciseHandler)(new RemoveSessionExerciseCommand(
            sessionId: 'session-1',
            sessionExerciseId: $firstId,
            removedByUserId: 'god-user-id',
        ));

        $session = $this->sessionRepository->findById(id: 'session-1');
        $this->assertCount(expectedCount: 1, haystack: $session->exercises);
        $this->assertEquals(expected: 'session-exercise-2', actual: $session->exercises[0]->id);
        $this->assertEquals(expected: 1, actual: $session->exercises[0]->position);
    }

    public function testRemovingAnAlreadyRemovedExerciseIsIdempotent(): void
    {
        ($this->removeExerciseHandler)(new RemoveSessionExerciseCommand(
            sessionId: 'session-1',
            sessionExerciseId: 'missing-exercise',
            removedByUserId: 'god-user-id',
        ));

        $session = $this->sessionRepository->findById(id: 'session-1');
        $this->assertCount(expectedCount: 1, haystack: $session->exercises);
    }

    public function testItAppliesTheWholeOrderInOneGo(): void
    {
        ($this->addExerciseHandler)($this->addCommand());
        ($this->addExerciseHandler)($this->addCommand(sessionExerciseId: 'session-exercise-3', exerciseId: 'exercise-3'));

        $session = $this->sessionRepository->findById(id: 'session-1');
        $firstId = $session->exercises[0]->id;

        ($this->reorderExercisesHandler)(new ReorderSessionExercisesCommand(
            sessionId: 'session-1',
            orderedSessionExerciseIds: ['session-exercise-3', 'session-exercise-2', $firstId],
            reorderedByUserId: 'god-user-id',
        ));

        $session = $this->sessionRepository->findById(id: 'session-1');
        $this->assertEquals(
            expected: ['exercise-3', 'exercise-2', 'exercise-1'],
            actual: array_map(
                callback: static fn ($sessionExercise): string => $sessionExercise->exerciseId,
                array: $session->exercises,
            ),
        );
        $this->assertEquals(
            expected: [1, 2, 3],
            actual: array_map(
                callback: static fn ($sessionExercise): int => $sessionExercise->position,
                array: $session->exercises,
            ),
        );
    }

    public function testReorderingKeepsTheSetsAttachedToTheirExercise(): void
    {
        ($this->addExerciseHandler)($this->addCommand());

        $session = $this->sessionRepository->findById(id: 'session-1');
        $firstId = $session->exercises[0]->id;

        ($this->reorderExercisesHandler)(new ReorderSessionExercisesCommand(
            sessionId: 'session-1',
            orderedSessionExerciseIds: ['session-exercise-2', $firstId],
            reorderedByUserId: 'god-user-id',
        ));

        $session = $this->sessionRepository->findById(id: 'session-1');
        $this->assertEquals(expected: $firstId, actual: $session->exercises[1]->id);
        $this->assertCount(expectedCount: 1, haystack: $session->exercises[1]->sets);
        $this->assertEquals(expected: 40.0, actual: $session->exercises[1]->sets[0]->weight);
    }

    public function testReorderingWithTheSameOrderChangesNothing(): void
    {
        ($this->addExerciseHandler)($this->addCommand());

        $session = $this->sessionRepository->findById(id: 'session-1');
        $order = $session->exerciseIds();

        ($this->reorderExercisesHandler)(new ReorderSessionExercisesCommand(
            sessionId: 'session-1',
            orderedSessionExerciseIds: $order,
            reorderedByUserId: 'god-user-id',
        ));

        $session = $this->sessionRepository->findById(id: 'session-1');
        $this->assertEquals(expected: $order, actual: $session->exerciseIds());
    }

    public function testItThrowsWhenTheOrderDoesNotMatchTheExercises(): void
    {
        ($this->addExerciseHandler)($this->addCommand());

        $this->expectException(exception: UpdateSessionException::class);

        ($this->reorderExercisesHandler)(new ReorderSessionExercisesCommand(
            sessionId: 'session-1',
            orderedSessionExerciseIds: ['session-exercise-2', 'missing-exercise'],
            reorderedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenTheOrderDropsAnExercise(): void
    {
        ($this->addExerciseHandler)($this->addCommand());

        $this->expectException(exception: UpdateSessionException::class);

        ($this->reorderExercisesHandler)(new ReorderSessionExercisesCommand(
            sessionId: 'session-1',
            orderedSessionExerciseIds: ['session-exercise-2'],
            reorderedByUserId: 'god-user-id',
        ));
    }

    private function addCommand(
        string $sessionExerciseId = 'session-exercise-2',
        string $exerciseId = 'exercise-2',
    ): AddSessionExerciseCommand {
        return new AddSessionExerciseCommand(
            sessionId: 'session-1',
            sessionExerciseId: $sessionExerciseId,
            exerciseId: $exerciseId,
            sets: [new ExerciseSetData(position: 1, reps: 12, weight: 20.0)],
            note: null,
            addedByUserId: 'god-user-id',
        );
    }
}
