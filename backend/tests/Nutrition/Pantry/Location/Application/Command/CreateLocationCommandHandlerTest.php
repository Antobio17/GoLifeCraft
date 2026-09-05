<?php

namespace App\Tests\Nutrition\Pantry\Location\Application\Command;

use Nutrition\Pantry\Location\Application\Command\CreateLocationCommand;
use Nutrition\Pantry\Location\Application\Command\CreateLocationCommandHandler;
use Nutrition\Pantry\Location\Domain\Exception\CreateLocationException;
use Nutrition\Pantry\Location\Infrastructure\Domain\Model\InMemory\InMemoryLocationRepository;
use Nutrition\Pantry\Location\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateLocationNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateLocationCommandHandlerTest extends TestCase
{
    private InMemoryLocationRepository $locationRepository;

    protected function setUp(): void
    {
        $this->locationRepository = new InMemoryLocationRepository();
    }

    public function testItCreatesTheLocation(): void
    {
        ($this->handlerWith(existingNames: []))(new CreateLocationCommand(
            name: '  Congelador  ',
            emoji: '🧊',
            description: 'Cajón de abajo',
            createdByUserId: 'god-user-id',
        ));

        $location = $this->locationRepository->findById(id: 'pantry-location-1');

        $this->assertSame(expected: 'Congelador', actual: $location->name);
        $this->assertSame(expected: '🧊', actual: $location->emoji);
        $this->assertSame(expected: 'Cajón de abajo', actual: $location->description);
    }

    public function testItRefusesADuplicatedName(): void
    {
        $this->expectException(exception: CreateLocationException::class);

        ($this->handlerWith(existingNames: ['Nevera']))(new CreateLocationCommand(
            name: 'Nevera',
            emoji: '',
            description: '',
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItRefusesAnEmptyName(): void
    {
        $this->expectException(exception: CreateLocationException::class);

        ($this->handlerWith(existingNames: []))(new CreateLocationCommand(
            name: '   ',
            emoji: '',
            description: '',
            createdByUserId: 'god-user-id',
        ));
    }

    /**
     * @param string[] $existingNames
     */
    private function handlerWith(array $existingNames): CreateLocationCommandHandler
    {
        return new CreateLocationCommandHandler(
            locationRepository: $this->locationRepository,
            needleDataQuery: new InMemoryCreateLocationNeedleDataQuery(existingNames: $existingNames),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }
}
