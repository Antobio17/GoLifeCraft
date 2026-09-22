<?php

namespace App\Tests\Gym\Library\Exercise\Application\Command;

use Gym\Library\Exercise\Application\Command\CreateExerciseCommand;
use Gym\Library\Exercise\Application\Command\CreateExerciseCommandHandler;
use Gym\Library\Exercise\Domain\Exception\CreateExerciseException;
use Gym\Library\Exercise\Domain\Model\Exercise;
use Gym\Library\Exercise\Infrastructure\Domain\Model\InMemory\InMemoryExerciseRepository;
use Gym\Library\Exercise\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateExerciseNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateExerciseCommandHandlerTest extends TestCase
{
    private InMemoryExerciseRepository $repository;
    private InMemoryCreateExerciseNeedleDataQuery $needleDataQuery;
    private DomainEventCollectorService $domainEventCollectorService;
    private CreateExerciseCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryExerciseRepository();
        $this->needleDataQuery = new InMemoryCreateExerciseNeedleDataQuery();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new CreateExerciseCommandHandler(
            exerciseRepository: $this->repository,
            needleDataQuery: $this->needleDataQuery,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItCreatesAnExerciseSuccessfully(): void
    {
        ($this->handler)(new CreateExerciseCommand(
            name: 'Press banca',
            description: 'Empuje horizontal con barra.',
            type: Exercise::TYPE_BILATERAL,
            weightMode: Exercise::WEIGHT_MODE_TOTAL,
            muscleGroups: ['Pecho', 'Tríceps'],
            icon: 'benchIncline',
            createdByUserId: 'god-user-id',
        ));

        $created = $this->repository->findById(id: '1');
        $this->assertNotNull(actual: $created);
        $this->assertEquals(expected: 'Press banca', actual: $created->name);
        $this->assertEquals(expected: Exercise::TYPE_BILATERAL, actual: $created->type);
        $this->assertEquals(expected: Exercise::WEIGHT_MODE_TOTAL, actual: $created->weightMode);
        $this->assertEquals(expected: ['Pecho', 'Tríceps'], actual: $created->muscleGroups);
        $this->assertEquals(expected: 'benchIncline', actual: $created->icon);
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItCreatesAnExerciseWithPerSideWeightMode(): void
    {
        ($this->handler)(new CreateExerciseCommand(
            name: 'Curl martillo',
            description: null,
            type: Exercise::TYPE_UNILATERAL,
            weightMode: Exercise::WEIGHT_MODE_PER_SIDE,
            muscleGroups: ['Bíceps'],
            icon: 'dumbbell',
            createdByUserId: 'god-user-id',
        ));

        $created = $this->repository->findById(id: '1');
        $this->assertEquals(expected: Exercise::WEIGHT_MODE_PER_SIDE, actual: $created->weightMode);
    }

    public function testItFallsBackToTotalWeightModeWhenNotProvided(): void
    {
        ($this->handler)(new CreateExerciseCommand(
            name: 'Sentadilla',
            description: null,
            type: Exercise::TYPE_BILATERAL,
            weightMode: null,
            muscleGroups: ['Cuádriceps'],
            icon: null,
            createdByUserId: 'god-user-id',
        ));

        $created = $this->repository->findById(id: '1');
        $this->assertEquals(expected: Exercise::WEIGHT_MODE_TOTAL, actual: $created->weightMode);
    }

    public function testItThrowsExceptionForInvalidWeightMode(): void
    {
        $this->expectException(exception: CreateExerciseException::class);

        ($this->handler)(new CreateExerciseCommand(
            name: 'Curl',
            description: null,
            type: Exercise::TYPE_BILATERAL,
            weightMode: 'invalid-weight-mode',
            muscleGroups: ['Bíceps'],
            icon: null,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsExceptionWhenNameAlreadyExists(): void
    {
        $this->needleDataQuery->addExistingName(name: 'Press banca');

        $this->expectException(exception: CreateExerciseException::class);

        ($this->handler)(new CreateExerciseCommand(
            name: 'Press banca',
            description: null,
            type: Exercise::TYPE_BILATERAL,
            weightMode: Exercise::WEIGHT_MODE_TOTAL,
            muscleGroups: ['Pecho'],
            icon: null,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsExceptionForInvalidType(): void
    {
        $this->expectException(exception: CreateExerciseException::class);

        ($this->handler)(new CreateExerciseCommand(
            name: 'Curl',
            description: null,
            type: 'invalid-type',
            weightMode: Exercise::WEIGHT_MODE_TOTAL,
            muscleGroups: ['Bíceps'],
            icon: null,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsExceptionWhenNoMuscleGroups(): void
    {
        $this->expectException(exception: CreateExerciseException::class);

        ($this->handler)(new CreateExerciseCommand(
            name: 'Plancha',
            description: null,
            type: Exercise::TYPE_BILATERAL,
            weightMode: Exercise::WEIGHT_MODE_TOTAL,
            muscleGroups: [],
            icon: null,
            createdByUserId: 'god-user-id',
        ));
    }
}
