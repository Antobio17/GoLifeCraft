<?php

namespace Nutrition\Pantry\Location\Application\Command;

use Nutrition\Pantry\Location\Domain\Exception\CreateLocationException;
use Nutrition\Pantry\Location\Domain\Model\Location;
use Nutrition\Pantry\Location\Domain\Model\LocationRepository;
use Nutrition\Pantry\Location\Domain\QueryModel\CreateLocationNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateLocationCommandHandler
{
    public function __construct(
        private LocationRepository $locationRepository,
        private CreateLocationNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateLocationCommand $command): void
    {
        if ($this->needleDataQuery->alreadyExists(name: trim(string: $command->name))) {
            throw CreateLocationException::alreadyExists(name: $command->name);
        }

        $location = Location::create(
            id: $this->locationRepository->nextId(),
            name: $command->name,
            emoji: $command->emoji,
            description: $command->description,
            createdByUserId: $command->createdByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->locationRepository->save(location: $location);
        $this->domainEventCollectorService->register(aggregate: $location);
    }
}
