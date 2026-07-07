<?php

namespace App\Tests\Gym\Library\Exercise\Application\Command;

use Authorization\User\User\Domain\Model\User;
use Gym\Library\Exercise\Application\Command\CreateExerciseCommand;
use Gym\Library\Exercise\Application\Command\CreateExerciseCommandHandler;
use Gym\Library\Exercise\Application\Command\DeleteExerciseCommand;
use Gym\Library\Exercise\Application\Command\DeleteExerciseCommandHandler;
use Gym\Library\Exercise\Domain\Exception\DeleteExerciseException;
use Gym\Library\Exercise\Domain\Model\Exercise;
use Gym\Library\Exercise\Infrastructure\Domain\Model\InMemory\InMemoryExerciseRepository;
use Gym\Library\Exercise\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateExerciseNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteExerciseCommandHandlerTest extends TestCase
{
    private InMemoryExerciseRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private DeleteExerciseCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryExerciseRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $dateTimeGenerator = new DateTimeGenerator();

        $createHandler = new CreateExerciseCommandHandler(
            exerciseRepository: $this->repository,
            needleDataQuery: new InMemoryCreateExerciseNeedleDataQuery(),
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

        $this->handler = new DeleteExerciseCommandHandler(
            exerciseRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItDeletesAnExerciseSuccessfully(): void
    {
        ($this->handler)(new DeleteExerciseCommand(
            exerciseId: '1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->repository->findById(id: '1'));
    }

    public function testItThrowsExceptionWhenExerciseNotFound(): void
    {
        $this->expectException(exception: DeleteExerciseException::class);

        ($this->handler)(new DeleteExerciseCommand(
            exerciseId: 'missing-id',
            deletedByUserId: 'god-user-id',
        ));
    }
}
