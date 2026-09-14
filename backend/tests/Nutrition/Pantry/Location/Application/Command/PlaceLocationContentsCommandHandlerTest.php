<?php

namespace App\Tests\Nutrition\Pantry\Location\Application\Command;

use Nutrition\Pantry\Location\Application\Command\PlaceLocationContentsCommand;
use Nutrition\Pantry\Location\Application\Command\PlaceLocationContentsCommandHandler;
use Nutrition\Pantry\Location\Domain\Event\LocationItemAssigned;
use Nutrition\Pantry\Location\Domain\Exception\PlaceLocationContentsException;
use Nutrition\Pantry\Location\Domain\Model\Location;
use Nutrition\Pantry\Location\Infrastructure\Domain\Model\InMemory\InMemoryLocationRepository;
use Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\InMemory\InMemoryPlaceLocationContentsNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class PlaceLocationContentsCommandHandlerTest extends TestCase
{
    private InMemoryLocationRepository $locationRepository;
    private InMemoryPlaceLocationContentsNeedleDataQuery $needleDataQuery;
    private DateTimeGenerator $dateTimeGenerator;
    private PlaceLocationContentsCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->locationRepository = new InMemoryLocationRepository();
        $this->needleDataQuery = new InMemoryPlaceLocationContentsNeedleDataQuery();
        $this->handler = new PlaceLocationContentsCommandHandler(
            locationRepository: $this->locationRepository,
            needleDataQuery: $this->needleDataQuery,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->givenLocation(id: 'pantry-location-1', name: 'Nevera');
        $this->needleDataQuery->addReference(kind: Location::ITEM_ARTICLE, refId: 'article-1');
        $this->needleDataQuery->addReference(kind: Location::ITEM_RECIPE, refId: 'recipe-1');
    }

    public function testItPlacesEverythingSentWithTheLocation(): void
    {
        ($this->handler)(new PlaceLocationContentsCommand(
            locationId: 'pantry-location-1',
            contents: [
                ['kind' => Location::ITEM_ARTICLE, 'refId' => 'article-1'],
                ['kind' => Location::ITEM_RECIPE, 'refId' => 'recipe-1'],
            ],
            placedByUserId: 'god-user-id',
        ));

        $location = $this->locationRepository->findById(id: 'pantry-location-1');

        $this->assertCount(expectedCount: 2, haystack: $location->items);
        $this->assertSame(expected: 'article-1', actual: $location->items[0]->refId);
        $this->assertSame(expected: 'recipe-1', actual: $location->items[1]->refId);
    }

    public function testItLeavesAloneWhatIsAlreadyKeptThere(): void
    {
        $contents = [['kind' => Location::ITEM_ARTICLE, 'refId' => 'article-1']];

        ($this->handler)(new PlaceLocationContentsCommand(
            locationId: 'pantry-location-1',
            contents: $contents,
            placedByUserId: 'god-user-id',
        ));

        ($this->handler)(new PlaceLocationContentsCommand(
            locationId: 'pantry-location-1',
            contents: $contents,
            placedByUserId: 'god-user-id',
        ));

        $this->assertCount(
            expectedCount: 1,
            haystack: $this->locationRepository->findById(id: 'pantry-location-1')->items,
        );
    }

    public function testItCarriesTheFormerLocationSoTheItemCanBeReleasedFromIt(): void
    {
        $this->givenLocation(id: 'pantry-location-2', name: 'Despensa');
        $this->needleDataQuery->addReference(
            kind: Location::ITEM_ARTICLE,
            refId: 'article-1',
            locationId: 'pantry-location-2',
        );

        ($this->handler)(new PlaceLocationContentsCommand(
            locationId: 'pantry-location-1',
            contents: [['kind' => Location::ITEM_ARTICLE, 'refId' => 'article-1']],
            placedByUserId: 'god-user-id',
        ));

        $events = array_values(array: array_filter(
            array: $this->locationRepository->findById(id: 'pantry-location-1')->pullDomainEvents(),
            callback: static fn (object $event): bool => $event instanceof LocationItemAssigned,
        ));

        $this->assertSame(expected: 'pantry-location-2', actual: $events[0]->previousLocationId);
    }

    public function testItRefusesAnUnknownLocation(): void
    {
        $this->expectException(exception: PlaceLocationContentsException::class);

        ($this->handler)(new PlaceLocationContentsCommand(
            locationId: 'missing-location',
            contents: [['kind' => Location::ITEM_ARTICLE, 'refId' => 'article-1']],
            placedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownReference(): void
    {
        $this->expectException(exception: PlaceLocationContentsException::class);

        ($this->handler)(new PlaceLocationContentsCommand(
            locationId: 'pantry-location-1',
            contents: [['kind' => Location::ITEM_ARTICLE, 'refId' => 'missing-article']],
            placedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAContentThatIsNotAKindAndAReference(): void
    {
        $this->expectException(exception: PlaceLocationContentsException::class);

        ($this->handler)(new PlaceLocationContentsCommand(
            locationId: 'pantry-location-1',
            contents: [['refId' => 'article-1']],
            placedByUserId: 'god-user-id',
        ));
    }

    private function givenLocation(string $id, string $name): void
    {
        $this->locationRepository->save(location: Location::create(
            id: $id,
            name: $name,
            emoji: '🥶',
            description: '',
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }
}
