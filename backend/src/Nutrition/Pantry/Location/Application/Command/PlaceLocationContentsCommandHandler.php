<?php

namespace Nutrition\Pantry\Location\Application\Command;

use Nutrition\Pantry\Location\Domain\Exception\PlaceLocationContentsException;
use Nutrition\Pantry\Location\Domain\Model\Location;
use Nutrition\Pantry\Location\Domain\Model\LocationContent;
use Nutrition\Pantry\Location\Domain\Model\LocationRepository;
use Nutrition\Pantry\Location\Domain\QueryModel\PlaceLocationContentsNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class PlaceLocationContentsCommandHandler
{
    public function __construct(
        private LocationRepository $locationRepository,
        private PlaceLocationContentsNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(PlaceLocationContentsCommand $command): void
    {
        $location = $this->locationRepository->findById(id: $command->locationId);

        if (null === $location) {
            throw PlaceLocationContentsException::locationNotFound(locationId: $command->locationId);
        }

        foreach ($this->contentsOf(command: $command) as $content) {
            $this->place(
                location: $location,
                content: $content,
                placedByUserId: $command->placedByUserId,
            );
        }

        $this->locationRepository->save(location: $location);
        $this->domainEventCollectorService->register(aggregate: $location);
    }

    private function place(Location $location, LocationContent $content, string $placedByUserId): void
    {
        if (null !== $location->item(kind: $content->kind, refId: $content->refId)) {
            return;
        }

        if (!$this->needleDataQuery->referenceExists(kind: $content->kind, refId: $content->refId)) {
            throw PlaceLocationContentsException::referenceNotFound(kind: $content->kind, refId: $content->refId);
        }

        $location->assign(
            kind: $content->kind,
            refId: $content->refId,
            previousLocationId: $this->needleDataQuery->currentLocationId(
                kind: $content->kind,
                refId: $content->refId,
            ),
            assignedByUserId: $placedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }

    /**
     * @return LocationContent[]
     */
    private function contentsOf(PlaceLocationContentsCommand $command): array
    {
        return array_map(
            callback: static fn (mixed $content): LocationContent => self::contentFrom(content: $content),
            array: $command->contents,
        );
    }

    private static function contentFrom(mixed $content): LocationContent
    {
        $kind = is_array($content) ? $content['kind'] ?? null : null;
        $refId = is_array($content) ? $content['refId'] ?? null : null;

        if (!is_string($kind) || !is_string($refId)) {
            throw PlaceLocationContentsException::invalidContent();
        }

        return new LocationContent(kind: $kind, refId: $refId);
    }
}
