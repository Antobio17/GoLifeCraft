<?php

namespace App\Tests\Nutrition\Shopping\Shopping\Application\Command;

use Nutrition\Shopping\Shopping\Application\Command\DeleteShoppingListItemCommand;
use Nutrition\Shopping\Shopping\Application\Command\DeleteShoppingListItemCommandHandler;
use Nutrition\Shopping\Shopping\Domain\Exception\DeleteShoppingListItemException;
use Nutrition\Shopping\Shopping\Domain\Model\ShoppingListItem;
use Nutrition\Shopping\Shopping\Infrastructure\Domain\Model\InMemory\InMemoryShoppingListItemRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteShoppingListItemCommandHandlerTest extends TestCase
{
    private InMemoryShoppingListItemRepository $repository;
    private DeleteShoppingListItemCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryShoppingListItemRepository();
        $this->handler = new DeleteShoppingListItemCommandHandler(
            shoppingListItemRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItDeletesItem(): void
    {
        $item = ShoppingListItem::create(
            id: 'item-1',
            articleId: 'article-1',
            quantity: 1,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $this->repository->save(shoppingListItem: $item);

        ($this->handler)(new DeleteShoppingListItemCommand(
            shoppingListItemId: 'item-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->repository->findById(id: 'item-1'));
    }

    public function testItThrowsWhenItemNotFound(): void
    {
        $this->expectException(exception: DeleteShoppingListItemException::class);

        ($this->handler)(new DeleteShoppingListItemCommand(
            shoppingListItemId: 'missing',
            deletedByUserId: 'god-user-id',
        ));
    }
}
