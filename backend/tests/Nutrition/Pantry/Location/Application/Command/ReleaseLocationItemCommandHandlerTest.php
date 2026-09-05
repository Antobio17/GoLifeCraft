<?php

namespace App\Tests\Nutrition\Pantry\Location\Application\Command;

use Nutrition\Pantry\Location\Application\Command\ReleaseLocationItemCommand;
use Nutrition\Pantry\Location\Application\Command\ReleaseLocationItemCommandHandler;
use Nutrition\Pantry\Location\Domain\Exception\ReleaseLocationItemException;
use Nutrition\Pantry\Location\Domain\Model\Location;
use Nutrition\Pantry\Location\Infrastructure\Domain\Model\InMemory\InMemoryLocationRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ReleaseLocationItemCommandHandlerTest extends TestCase
{
    private InMemoryLocationRepository $locationRepository;
    private DateTimeGenerator $dateTimeGenerator;
    private ReleaseLocationItemCommandHandler $handler;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->locationRepository = new InMemoryLocationRepository();
        $this->handler = new ReleaseLocationItemCommandHandler(
            locationRepository: $this->locationRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $location = Location::create(
            id: 'pantry-location-1',
            name: 'Nevera',
            emoji: '🥶',
            description: '',
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $location->assign(
            kind: Location::ITEM_ARTICLE,
            refId: 'article-1',
            previousLocationId: null,
            assignedByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->locationRepository->save(location: $location);
    }

    public function testItTakesTheArticleOutOfTheLocation(): void
    {
        ($this->handler)(new ReleaseLocationItemCommand(
            locationId: 'pantry-location-1',
            kind: Location::ITEM_ARTICLE,
            refId: 'article-1',
            releasedByUserId: 'god-user-id',
        ));

        $this->assertSame(expected: [], actual: $this->locationRepository->findById(id: 'pantry-location-1')->items);
    }

    public function testItRefusesAnUnknownLocation(): void
    {
        $this->expectException(exception: ReleaseLocationItemException::class);

        ($this->handler)(new ReleaseLocationItemCommand(
            locationId: 'missing-location',
            kind: Location::ITEM_ARTICLE,
            refId: 'article-1',
            releasedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesSomethingThatIsNotKeptThere(): void
    {
        $this->expectException(exception: ReleaseLocationItemException::class);

        ($this->handler)(new ReleaseLocationItemCommand(
            locationId: 'pantry-location-1',
            kind: Location::ITEM_RECIPE,
            refId: 'recipe-1',
            releasedByUserId: 'god-user-id',
        ));
    }
}
