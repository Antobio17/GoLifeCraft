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
            quantity: 2,
            baseQuantity: 750.0,
            createdByUserId: 'god-user-id',
        ));

        $item = $this->repository->findById(id: 'shopping-list-item-1');

        $this->assertNotNull(actual: $item);
        $this->assertSame(expected: 'article-1', actual: $item->articleId);
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
            quantity: 2,
            baseQuantity: 750.0,
            createdByUserId: 'god-user-id',
        ));

        ($handler)(new AddShoppingListItemCommand(
            articleId: 'article-1',
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
            quantity: 0,
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
