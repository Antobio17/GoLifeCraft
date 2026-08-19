<?php

namespace App\Tests\Nutrition\Shopping\Shopping\Application\Command;

use Nutrition\Shopping\Shopping\Application\Command\AddShoppingListItemCommand;
use Nutrition\Shopping\Shopping\Application\Command\AddShoppingListItemCommandHandler;
use Nutrition\Shopping\Shopping\Domain\Exception\AddShoppingListItemException;
use Nutrition\Shopping\Shopping\Infrastructure\Domain\Model\InMemory\InMemoryShoppingListItemRepository;
use Nutrition\Shopping\Shopping\Infrastructure\Domain\QueryModel\InMemory\InMemoryAddShoppingListItemNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class AddShoppingListItemCommandHandlerTest extends TestCase
{
    private InMemoryShoppingListItemRepository $repository;

    protected function setUp(): void
    {
        $this->repository = new InMemoryShoppingListItemRepository();
    }

    public function testItAddsArticleToShoppingList(): void
    {
        $handler = $this->buildHandler(existingArticleIds: ['article-1']);

        ($handler)(new AddShoppingListItemCommand(
            articleId: 'article-1',
            customName: null,
            quantity: 2,
            baseQuantity: 750.0,
            createdByUserId: 'god-user-id',
        ));

        $item = $this->repository->findById(id: 'shopping-list-item-1');

        $this->assertNotNull(actual: $item);
        $this->assertSame(expected: 'article-1', actual: $item->articleId);
        $this->assertNull(actual: $item->customName);
        $this->assertSame(expected: 2, actual: $item->quantity);
        $this->assertSame(expected: 750.0, actual: $item->baseQuantity);
        $this->assertFalse(condition: $item->checked);
    }

    public function testItThrowsWhenArticleDoesNotExist(): void
    {
        $this->expectException(exception: AddShoppingListItemException::class);

        $handler = $this->buildHandler(existingArticleIds: []);

        ($handler)(new AddShoppingListItemCommand(
            articleId: 'ghost-article',
            customName: null,
            quantity: 1,
            baseQuantity: null,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItAccumulatesPacksAndNeedWhenArticleAlreadyInList(): void
    {
        $handler = $this->buildHandler(existingArticleIds: ['article-1']);

        ($handler)(new AddShoppingListItemCommand(
            articleId: 'article-1',
            customName: null,
            quantity: 2,
            baseQuantity: 750.0,
            createdByUserId: 'god-user-id',
        ));

        ($handler)(new AddShoppingListItemCommand(
            articleId: 'article-1',
            customName: null,
            quantity: 3,
            baseQuantity: 1250.0,
            createdByUserId: 'god-user-id',
        ));

        $item = $this->repository->findByArticleId(articleId: 'article-1');

        $this->assertNotNull(actual: $item);
        $this->assertSame(expected: 5, actual: $item->quantity);
        $this->assertSame(expected: 2000.0, actual: $item->baseQuantity);
    }

    public function testItThrowsWhenQuantityIsNotPositive(): void
    {
        $this->expectException(exception: AddShoppingListItemException::class);

        $handler = $this->buildHandler(existingArticleIds: ['article-1']);

        ($handler)(new AddShoppingListItemCommand(
            articleId: 'article-1',
            customName: null,
            quantity: 0,
            baseQuantity: null,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItAddsCustomItemWithoutArticle(): void
    {
        $handler = $this->buildHandler(existingArticleIds: []);

        ($handler)(new AddShoppingListItemCommand(
            articleId: null,
            customName: '  Papel   de cocina ',
            quantity: 2,
            baseQuantity: null,
            createdByUserId: 'god-user-id',
        ));

        $item = $this->repository->findById(id: 'shopping-list-item-1');

        $this->assertNotNull(actual: $item);
        $this->assertNull(actual: $item->articleId);
        $this->assertSame(expected: 'Papel de cocina', actual: $item->customName);
        $this->assertSame(expected: 2, actual: $item->quantity);
        $this->assertNull(actual: $item->baseQuantity);
        $this->assertFalse(condition: $item->checked);
    }

    public function testItAccumulatesQuantityWhenCustomNameAlreadyInList(): void
    {
        $handler = $this->buildHandler(existingArticleIds: []);

        ($handler)(new AddShoppingListItemCommand(
            articleId: null,
            customName: 'Papel de cocina',
            quantity: 1,
            baseQuantity: null,
            createdByUserId: 'god-user-id',
        ));

        ($handler)(new AddShoppingListItemCommand(
            articleId: null,
            customName: 'papel de COCINA',
            quantity: 3,
            baseQuantity: null,
            createdByUserId: 'god-user-id',
        ));

        $item = $this->repository->findByCustomName(customName: 'Papel de cocina');

        $this->assertNotNull(actual: $item);
        $this->assertSame(expected: 'shopping-list-item-1', actual: $item->id);
        $this->assertSame(expected: 4, actual: $item->quantity);
    }

    public function testItThrowsWhenCustomNameIsBlank(): void
    {
        $this->expectException(exception: AddShoppingListItemException::class);

        $handler = $this->buildHandler(existingArticleIds: []);

        ($handler)(new AddShoppingListItemCommand(
            articleId: null,
            customName: '   ',
            quantity: 1,
            baseQuantity: null,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenNeitherArticleNorCustomNameIsGiven(): void
    {
        $this->expectException(exception: AddShoppingListItemException::class);

        $handler = $this->buildHandler(existingArticleIds: []);

        ($handler)(new AddShoppingListItemCommand(
            articleId: null,
            customName: null,
            quantity: 1,
            baseQuantity: null,
            createdByUserId: 'god-user-id',
        ));
    }

    /**
     * @param string[] $existingArticleIds
     */
    private function buildHandler(array $existingArticleIds): AddShoppingListItemCommandHandler
    {
        return new AddShoppingListItemCommandHandler(
            shoppingListItemRepository: $this->repository,
            needleDataQuery: new InMemoryAddShoppingListItemNeedleDataQuery(
                existingArticleIds: $existingArticleIds,
            ),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }
}
