<?php

namespace Nutrition\Pantry\Location\Application\Command;

use Nutrition\Pantry\Location\Domain\Exception\UpdateLocationException;
use Nutrition\Pantry\Location\Domain\Model\LocationRepository;
use Nutrition\Pantry\Location\Domain\QueryModel\UpdateLocationNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateLocationCommandHandler
{
    public function __construct(
        private LocationRepository $locationRepository,
        private UpdateLocationNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateLocationCommand $command): void
    {
        $location = $this->locationRepository->findById(id: $command->locationId);

        if (null === $location) {
            throw UpdateLocationException::notFound(locationId: $command->locationId);
        }

        if ($this->needleDataQuery->alreadyExists(name: trim(string: $command->name), locationId: $command->locationId)) {
            throw UpdateLocationException::alreadyExists(name: $command->name);
        }

        $location->update(
            name: $command->name,
            emoji: $command->emoji,
            description: $command->description,
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->locationRepository->save(location: $location);
        $this->domainEventCollectorService->register(aggregate: $location);
    }
}
