<?php

namespace Nutrition\Pantry\Location\Application\Command;

use Nutrition\Pantry\Location\Domain\Exception\DeleteLocationException;
use Nutrition\Pantry\Location\Domain\Model\LocationRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteLocationCommandHandler
{
    public function __construct(
        private LocationRepository $locationRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteLocationCommand $command): void
    {
        $location = $this->locationRepository->findById(id: $command->locationId);

        if (null === $location) {
            throw DeleteLocationException::notFound(locationId: $command->locationId);
        }

        $location->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->locationRepository->delete(location: $location);
        $this->domainEventCollectorService->register(aggregate: $location);
    }
}
