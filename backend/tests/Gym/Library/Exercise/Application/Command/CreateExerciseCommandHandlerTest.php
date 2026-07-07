<?php

namespace App\Tests\Gym\Library\Exercise\Application\Command;

use Authorization\User\User\Domain\Model\User;
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
            muscleGroups: ['Pecho', 'Tríceps'],
            createdByUserId: 'god-user-id',
        ));

        $created = $this->repository->findById(id: '1');
        $this->assertNotNull(actual: $created);
        $this->assertEquals(expected: 'Press banca', actual: $created->name);
        $this->assertEquals(expected: Exercise::TYPE_BILATERAL, actual: $created->type);
        $this->assertEquals(expected: ['Pecho', 'Tríceps'], actual: $created->muscleGroups);
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItThrowsExceptionWhenNameAlreadyExists(): void
    {
        $this->needleDataQuery->addExistingName(name: 'Press banca');

        $this->expectException(exception: CreateExerciseException::class);

        ($this->handler)(new CreateExerciseCommand(
            name: 'Press banca',
            description: null,
            type: Exercise::TYPE_BILATERAL,
            muscleGroups: ['Pecho'],
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
            muscleGroups: ['Bíceps'],
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
            muscleGroups: [],
            createdByUserId: 'god-user-id',
        ));
    }
}
