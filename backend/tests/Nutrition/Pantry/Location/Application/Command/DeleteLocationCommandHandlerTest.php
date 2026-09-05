<?php

namespace App\Tests\Nutrition\Pantry\Location\Application\Command;

use Nutrition\Pantry\Location\Application\Command\DeleteLocationCommand;
use Nutrition\Pantry\Location\Application\Command\DeleteLocationCommandHandler;
use Nutrition\Pantry\Location\Domain\Exception\DeleteLocationException;
use Nutrition\Pantry\Location\Domain\Model\Location;
use Nutrition\Pantry\Location\Infrastructure\Domain\Model\InMemory\InMemoryLocationRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteLocationCommandHandlerTest extends TestCase
{
    private InMemoryLocationRepository $locationRepository;
    private DeleteLocationCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->locationRepository = new InMemoryLocationRepository();
        $this->locationRepository->save(location: Location::create(
            id: 'location-1',
            name: 'Despensa',
            emoji: '',
            description: '',
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $dateTimeGenerator,
        ));

        $this->handler = new DeleteLocationCommandHandler(
            locationRepository: $this->locationRepository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItDeletesTheLocation(): void
    {
        ($this->handler)(new DeleteLocationCommand(
            locationId: 'location-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->locationRepository->findById(id: 'location-1'));
    }

    public function testItRefusesAnUnknownLocation(): void
    {
        $this->expectException(exception: DeleteLocationException::class);

        ($this->handler)(new DeleteLocationCommand(
            locationId: 'missing-location',
            deletedByUserId: 'god-user-id',
        ));
    }
}
