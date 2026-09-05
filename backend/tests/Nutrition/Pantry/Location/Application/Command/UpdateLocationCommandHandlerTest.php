<?php

namespace App\Tests\Nutrition\Pantry\Location\Application\Command;

use Nutrition\Pantry\Location\Application\Command\UpdateLocationCommand;
use Nutrition\Pantry\Location\Application\Command\UpdateLocationCommandHandler;
use Nutrition\Pantry\Location\Domain\Exception\UpdateLocationException;
use Nutrition\Pantry\Location\Domain\Model\Location;
use Nutrition\Pantry\Location\Infrastructure\Domain\Model\InMemory\InMemoryLocationRepository;
use Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateLocationNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateLocationCommandHandlerTest extends TestCase
{
    private InMemoryLocationRepository $locationRepository;
    private DateTimeGenerator $dateTimeGenerator;

    protected function setUp(): void
    {
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->locationRepository = new InMemoryLocationRepository();
        $this->locationRepository->save(location: Location::create(
            id: 'location-1',
            name: 'Nevera',
            emoji: '🥶',
            description: '',
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $this->dateTimeGenerator,
        ));
    }

    public function testItRenamesTheLocation(): void
    {
        ($this->handlerWith(namesById: ['location-1' => 'Nevera']))(new UpdateLocationCommand(
            locationId: 'location-1',
            name: 'Nevera de arriba',
            emoji: '🥶',
            description: 'La de la cocina',
            updatedByUserId: 'god-user-id',
        ));

        $location = $this->locationRepository->findById(id: 'location-1');

        $this->assertSame(expected: 'Nevera de arriba', actual: $location->name);
        $this->assertSame(expected: 'La de la cocina', actual: $location->description);
    }

    public function testItRefusesAnUnknownLocation(): void
    {
        $this->expectException(exception: UpdateLocationException::class);

        ($this->handlerWith(namesById: []))(new UpdateLocationCommand(
            locationId: 'missing-location',
            name: 'Despensa',
            emoji: '',
            description: '',
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesTheNameOfAnotherLocation(): void
    {
        $this->expectException(exception: UpdateLocationException::class);

        ($this->handlerWith(namesById: ['location-1' => 'Nevera', 'location-2' => 'Despensa']))(new UpdateLocationCommand(
            locationId: 'location-1',
            name: 'Despensa',
            emoji: '',
            description: '',
            updatedByUserId: 'god-user-id',
        ));
    }

    /**
     * @param array<string, string> $namesById
     */
    private function handlerWith(array $namesById): UpdateLocationCommandHandler
    {
        return new UpdateLocationCommandHandler(
            locationRepository: $this->locationRepository,
            needleDataQuery: new InMemoryUpdateLocationNeedleDataQuery(namesById: $namesById),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
    }
}
