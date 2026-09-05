<?php

namespace App\Tests\Nutrition\Pantry\Location\Application\Command;

use Nutrition\Pantry\Location\Application\Command\AssignLocationItemCommand;
use Nutrition\Pantry\Location\Application\Command\AssignLocationItemCommandHandler;
use Nutrition\Pantry\Location\Domain\Event\LocationItemAssigned;
use Nutrition\Pantry\Location\Domain\Exception\AssignLocationItemException;
use Nutrition\Pantry\Location\Domain\Model\Location;
use Nutrition\Pantry\Location\Infrastructure\Domain\Model\InMemory\InMemoryLocationRepository;
use Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\InMemory\InMemoryAssignLocationItemNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class AssignLocationItemCommandHandlerTest extends TestCase
{
    private InMemoryLocationRepository $locationRepository;
    private InMemoryAssignLocationItemNeedleDataQuery $needleDataQuery;
    private DateTimeGenerator $dateTimeGenerator;
    private AssignLocationItemCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->locationRepository = new InMemoryLocationRepository();
        $this->needleDataQuery = new InMemoryAssignLocationItemNeedleDataQuery();
        $this->handler = new AssignLocationItemCommandHandler(
            locationRepository: $this->locationRepository,
            needleDataQuery: $this->needleDataQuery,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->givenLocation(id: 'pantry-location-1', name: 'Nevera');
        $this->needleDataQuery->addReference(kind: Location::ITEM_ARTICLE, refId: 'article-1');
    }

    public function testItPlacesAnArticleInTheLocation(): void
    {
        ($this->handler)(new AssignLocationItemCommand(
            locationId: 'pantry-location-1',
            kind: Location::ITEM_ARTICLE,
            refId: 'article-1',
            assignedByUserId: 'god-user-id',
        ));

        $location = $this->locationRepository->findById(id: 'pantry-location-1');

        $this->assertCount(expectedCount: 1, haystack: $location->items);
        $this->assertSame(expected: 'article-1', actual: $location->items[0]->refId);
        $this->assertSame(expected: 'pantry-location-1', actual: $location->items[0]->locationId);
    }

    public function testItCarriesTheFormerLocationSoTheItemCanBeReleasedFromIt(): void
    {
        $this->givenLocation(id: 'pantry-location-2', name: 'Despensa');
        $this->needleDataQuery->addReference(
            kind: Location::ITEM_ARTICLE,
            refId: 'article-1',
            locationId: 'pantry-location-2',
        );

        ($this->handler)(new AssignLocationItemCommand(
            locationId: 'pantry-location-1',
            kind: Location::ITEM_ARTICLE,
            refId: 'article-1',
            assignedByUserId: 'god-user-id',
        ));

        $events = array_values(array: array_filter(
            array: $this->locationRepository->findById(id: 'pantry-location-1')->pullDomainEvents(),
            callback: static fn (object $event): bool => $event instanceof LocationItemAssigned,
        ));

        $this->assertSame(expected: 'pantry-location-2', actual: $events[0]->previousLocationId);
    }

    public function testItRefusesAnUnknownLocation(): void
    {
        $this->expectException(exception: AssignLocationItemException::class);

        ($this->handler)(new AssignLocationItemCommand(
            locationId: 'missing-location',
            kind: Location::ITEM_ARTICLE,
            refId: 'article-1',
            assignedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnUnknownReference(): void
    {
        $this->expectException(exception: AssignLocationItemException::class);

        ($this->handler)(new AssignLocationItemCommand(
            locationId: 'pantry-location-1',
            kind: Location::ITEM_ARTICLE,
            refId: 'missing-article',
            assignedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesToPlaceTheSameThingTwiceInTheSameLocation(): void
    {
        ($this->handler)(new AssignLocationItemCommand(
            locationId: 'pantry-location-1',
            kind: Location::ITEM_ARTICLE,
            refId: 'article-1',
            assignedByUserId: 'god-user-id',
        ));

        $this->expectException(exception: AssignLocationItemException::class);

        ($this->handler)(new AssignLocationItemCommand(
            locationId: 'pantry-location-1',
            kind: Location::ITEM_ARTICLE,
            refId: 'article-1',
            assignedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAKindThatIsNeitherArticleNorRecipe(): void
    {
        $this->needleDataQuery->addReference(kind: 'exercise', refId: 'exercise-1');

        $this->expectException(exception: AssignLocationItemException::class);

        ($this->handler)(new AssignLocationItemCommand(
            locationId: 'pantry-location-1',
            kind: 'exercise',
            refId: 'exercise-1',
            assignedByUserId: 'god-user-id',
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
