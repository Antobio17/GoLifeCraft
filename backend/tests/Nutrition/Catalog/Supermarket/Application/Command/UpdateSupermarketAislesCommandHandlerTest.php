<?php

namespace App\Tests\Nutrition\Catalog\Supermarket\Application\Command;

use Nutrition\Catalog\Supermarket\Application\Command\SupermarketAisleAssembler;
use Nutrition\Catalog\Supermarket\Application\Command\SupermarketAisleData;
use Nutrition\Catalog\Supermarket\Application\Command\UpdateSupermarketAislesCommand;
use Nutrition\Catalog\Supermarket\Application\Command\UpdateSupermarketAislesCommandHandler;
use Nutrition\Catalog\Supermarket\Domain\Exception\UpdateSupermarketAislesException;
use Nutrition\Catalog\Supermarket\Domain\Model\Supermarket;
use Nutrition\Catalog\Supermarket\Infrastructure\Domain\Model\InMemory\InMemorySupermarketRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateSupermarketAislesCommandHandlerTest extends TestCase
{
    private InMemorySupermarketRepository $supermarketRepository;
    private UpdateSupermarketAislesCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->supermarketRepository = new InMemorySupermarketRepository();
        $this->handler = new UpdateSupermarketAislesCommandHandler(
            supermarketRepository: $this->supermarketRepository,
            aisleAssembler: new SupermarketAisleAssembler(
                supermarketRepository: $this->supermarketRepository,
                dateTimeGenerator: $dateTimeGenerator,
            ),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: $dateTimeGenerator,
        );
    }

    public function testItCreatesTheAislesInTheGivenOrder(): void
    {
        $this->givenSupermarket(id: 'supermarket-1', name: 'Mercadona');

        ($this->handler)(new UpdateSupermarketAislesCommand(
            supermarketId: 'supermarket-1',
            aisles: [
                new SupermarketAisleData(id: null, name: 'Frutería', position: 1),
                new SupermarketAisleData(id: null, name: 'Panadería', position: 2),
            ],
            updatedByUserId: 'god-user-id',
        ));

        $aisles = $this->supermarketRepository->findById(id: 'supermarket-1')->aisles;
        $this->assertCount(expectedCount: 2, haystack: $aisles);
        $this->assertEquals(expected: 'Frutería', actual: $aisles[0]->name);
        $this->assertEquals(expected: 1, actual: $aisles[0]->position);
        $this->assertEquals(expected: 'Panadería', actual: $aisles[1]->name);
        $this->assertEquals(expected: 2, actual: $aisles[1]->position);
    }

    public function testItKeepsTheIdentityOfTheAislesWhenTheyAreReordered(): void
    {
        $this->givenSupermarket(id: 'supermarket-1', name: 'Mercadona');
        $this->whenAislesAre(names: ['Frutería', 'Panadería']);

        $created = $this->supermarketRepository->findById(id: 'supermarket-1')->aisles;
        $bakeryId = $created[1]->id;

        ($this->handler)(new UpdateSupermarketAislesCommand(
            supermarketId: 'supermarket-1',
            aisles: [
                new SupermarketAisleData(id: $bakeryId, name: 'Panadería', position: 1),
                new SupermarketAisleData(id: $created[0]->id, name: 'Frutería', position: 2),
            ],
            updatedByUserId: 'god-user-id',
        ));

        $aisles = $this->supermarketRepository->findById(id: 'supermarket-1')->aisles;
        $this->assertEquals(expected: $bakeryId, actual: $aisles[0]->id);
        $this->assertEquals(expected: 'Panadería', actual: $aisles[0]->name);
        $this->assertEquals(expected: 1, actual: $aisles[0]->position);
    }

    public function testItDropsTheAislesThatAreNoLongerSent(): void
    {
        $this->givenSupermarket(id: 'supermarket-1', name: 'Mercadona');
        $this->whenAislesAre(names: ['Frutería', 'Panadería']);

        $created = $this->supermarketRepository->findById(id: 'supermarket-1')->aisles;

        ($this->handler)(new UpdateSupermarketAislesCommand(
            supermarketId: 'supermarket-1',
            aisles: [new SupermarketAisleData(id: $created[0]->id, name: 'Frutería', position: 1)],
            updatedByUserId: 'god-user-id',
        ));

        $aisles = $this->supermarketRepository->findById(id: 'supermarket-1')->aisles;
        $this->assertCount(expectedCount: 1, haystack: $aisles);
        $this->assertEquals(expected: 'Frutería', actual: $aisles[0]->name);
    }

    public function testItFailsWhenTwoAislesShareTheSameName(): void
    {
        $this->givenSupermarket(id: 'supermarket-1', name: 'Mercadona');

        $this->expectException(exception: UpdateSupermarketAislesException::class);

        ($this->handler)(new UpdateSupermarketAislesCommand(
            supermarketId: 'supermarket-1',
            aisles: [
                new SupermarketAisleData(id: null, name: 'Frutería', position: 1),
                new SupermarketAisleData(id: null, name: 'frutería', position: 2),
            ],
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItFailsWhenTheSupermarketDoesNotExist(): void
    {
        $this->expectException(exception: UpdateSupermarketAislesException::class);

        ($this->handler)(new UpdateSupermarketAislesCommand(
            supermarketId: 'unknown-supermarket',
            aisles: [],
            updatedByUserId: 'god-user-id',
        ));
    }

    private function givenSupermarket(string $id, string $name): void
    {
        $this->supermarketRepository->save(supermarket: Supermarket::create(
            id: $id,
            name: $name,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        ));
    }

    /**
     * @param string[] $names
     */
    private function whenAislesAre(array $names): void
    {
        $aisles = [];

        foreach (array_values($names) as $index => $name) {
            $aisles[] = new SupermarketAisleData(id: null, name: $name, position: $index + 1);
        }

        ($this->handler)(new UpdateSupermarketAislesCommand(
            supermarketId: 'supermarket-1',
            aisles: $aisles,
            updatedByUserId: 'god-user-id',
        ));
    }
}
