<?php

namespace App\Tests\Nutrition\Shopping\Shopping\Application\Command;

use Nutrition\Shopping\Shopping\Application\Command\UpdateShoppingListItemCommand;
use Nutrition\Shopping\Shopping\Application\Command\UpdateShoppingListItemCommandHandler;
use Nutrition\Shopping\Shopping\Domain\Exception\UpdateShoppingListItemException;
use Nutrition\Shopping\Shopping\Domain\Model\ShoppingListItem;
use Nutrition\Shopping\Shopping\Infrastructure\Domain\Model\InMemory\InMemoryShoppingListItemRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateShoppingListItemCommandHandlerTest extends TestCase
{
    private InMemoryShoppingListItemRepository $repository;
    private UpdateShoppingListItemCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryShoppingListItemRepository();
        $this->handler = new UpdateShoppingListItemCommandHandler(
            shoppingListItemRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    public function testItUpdatesQuantityAndCheckedState(): void
    {
        $item = ShoppingListItem::create(
            id: 'item-1',
            articleId: 'article-1',
            quantity: 1,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $this->repository->save(shoppingListItem: $item);

        ($this->handler)(new UpdateShoppingListItemCommand(
            shoppingListItemId: 'item-1',
            quantity: 4,
            checked: true,
            updatedByUserId: 'god-user-id',
        ));

        $updated = $this->repository->findById(id: 'item-1');

        $this->assertSame(expected: 4, actual: $updated->quantity);
        $this->assertTrue(condition: $updated->checked);
    }

    public function testItThrowsWhenItemNotFound(): void
    {
        $this->expectException(exception: UpdateShoppingListItemException::class);

        ($this->handler)(new UpdateShoppingListItemCommand(
            shoppingListItemId: 'missing',
            quantity: 2,
            checked: false,
            updatedByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenQuantityIsNotPositive(): void
    {
        $item = ShoppingListItem::create(
            id: 'item-1',
            articleId: 'article-1',
            quantity: 1,
            createdByUserId: 'god-user-id',
            dateTimeGenerator: new DateTimeGenerator(),
        );
        $this->repository->save(shoppingListItem: $item);

        $this->expectException(exception: UpdateShoppingListItemException::class);

        ($this->handler)(new UpdateShoppingListItemCommand(
            shoppingListItemId: 'item-1',
            quantity: 0,
            checked: false,
            updatedByUserId: 'god-user-id',
        ));
    }
}
