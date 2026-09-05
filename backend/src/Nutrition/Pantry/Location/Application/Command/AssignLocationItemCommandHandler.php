<?php

namespace Nutrition\Pantry\Location\Application\Command;

use Nutrition\Pantry\Location\Domain\Exception\AssignLocationItemException;
use Nutrition\Pantry\Location\Domain\Model\LocationRepository;
use Nutrition\Pantry\Location\Domain\QueryModel\AssignLocationItemNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class AssignLocationItemCommandHandler
{
    public function __construct(
        private LocationRepository $locationRepository,
        private AssignLocationItemNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(AssignLocationItemCommand $command): void
    {
        $location = $this->locationRepository->findById(id: $command->locationId);

        if (null === $location) {
            throw AssignLocationItemException::locationNotFound(locationId: $command->locationId);
        }

        if (!$this->needleDataQuery->referenceExists(kind: $command->kind, refId: $command->refId)) {
            throw AssignLocationItemException::referenceNotFound(kind: $command->kind, refId: $command->refId);
        }

        $location->assign(
            kind: $command->kind,
            refId: $command->refId,
            previousLocationId: $this->needleDataQuery->currentLocationId(
                kind: $command->kind,
                refId: $command->refId,
            ),
            assignedByUserId: $command->assignedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->locationRepository->save(location: $location);
        $this->domainEventCollectorService->register(aggregate: $location);
    }
}
