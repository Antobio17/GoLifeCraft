<?php

namespace App\Tests\Gym\Library\Exercise\Application\Command;

use Authorization\User\User\Domain\Model\User;
use Gym\Library\Exercise\Application\Command\CreateExerciseCommand;
use Gym\Library\Exercise\Application\Command\CreateExerciseCommandHandler;
use Gym\Library\Exercise\Application\Command\UpdateExerciseCommand;
use Gym\Library\Exercise\Application\Command\UpdateExerciseCommandHandler;
use Gym\Library\Exercise\Domain\Exception\UpdateExerciseException;
use Gym\Library\Exercise\Domain\Model\Exercise;
use Gym\Library\Exercise\Infrastructure\Domain\Model\InMemory\InMemoryExerciseRepository;
use Gym\Library\Exercise\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateExerciseNeedleDataQuery;
use Gym\Library\Exercise\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateExerciseNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateExerciseCommandHandlerTest extends TestCase
{
    private InMemoryExerciseRepository $repository;
    private InMemoryCreateExerciseNeedleDataQuery $createNeedleDataQuery;
    private InMemoryUpdateExerciseNeedleDataQuery $needleDataQuery;
    private DomainEventCollectorService $domainEventCollectorService;
    private UpdateExerciseCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryExerciseRepository();
        $this->createNeedleDataQuery = new InMemoryCreateExerciseNeedleDataQuery();
        $this->needleDataQuery = new InMemoryUpdateExerciseNeedleDataQuery();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $dateTimeGenerator = new DateTimeGenerator();

        $createHandler = new CreateExerciseCommandHandler(
            exerciseRepository: $this->repository,
            needleDataQuery: $this->createNeedleDataQuery,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
        ($createHandler)(new CreateExerciseCommand(
            name: 'Press banca',
            description: null,
            type: Exercise::TYPE_BILATERAL,
            muscleGroups: ['Pecho'],
            createdByUserId: 'god-user-id',
        ));

        $this->handler = new UpdateExerciseCommandHandler(
            exerciseRepository: $this->repository,
            needleDataQuery: $this->needleDataQuery,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItUpdatesAnExerciseSuccessfully(): void
    {
        ($this->handler)(new UpdateExerciseCommand(
            exerciseId: '1',
            name: 'Press inclinado',
            description: 'Empuje en banco inclinado a 30°.',
            type: Exercise::TYPE_BILATERAL,
            muscleGroups: ['Pecho', 'Hombro'],
            updatedByUserId: 'god-user-id',
        ));

        $updated = $this->repository->findById(id: '1');
        $this->assertEquals(expected: 'Press inclinado', actual: $updated->name);
        $this->assertEquals(expected: ['Pecho', 'Hombro'], actual: $updated->muscleGroups);
    }

    public function testItThrowsExceptionWhenExerciseNotFound(): void
    {
        $this->expectException(exception: UpdateExerciseException::class);

        ($this->handler)(new UpdateExerciseCommand(
            exerciseId: 'missing-id',
            name: 'Press inclinado',
            description: null,
            type: Exercise::TYPE_BILATERAL,
            muscleGroups: ['Pecho'],
            updatedByUserId: 'god-user-id',
        ));
    }
}
