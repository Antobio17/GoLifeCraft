<?php

namespace Nutrition\Pantry\Location\Application\Command;

use Nutrition\Pantry\Location\Domain\Exception\ReleaseLocationItemException;
use Nutrition\Pantry\Location\Domain\Model\LocationRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class ReleaseLocationItemCommandHandler
{
    public function __construct(
        private LocationRepository $locationRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ReleaseLocationItemCommand $command): void
    {
        $location = $this->locationRepository->findById(id: $command->locationId);

        if (null === $location) {
            throw ReleaseLocationItemException::locationNotFound(locationId: $command->locationId);
        }

        $location->release(
            kind: $command->kind,
            refId: $command->refId,
            releasedByUserId: $command->releasedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->locationRepository->save(location: $location);
        $this->domainEventCollectorService->register(aggregate: $location);
    }
}
