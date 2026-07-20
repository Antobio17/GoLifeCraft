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
        $handler = $this->buildHandler(
            existingArticleIds: ['article-1'],
            articleIdsInList: [],
        );

        ($handler)(new AddShoppingListItemCommand(
            articleId: 'article-1',
            quantity: 2,
            createdByUserId: 'god-user-id',
        ));

        $item = $this->repository->findById(id: 'shopping-list-item-1');

        $this->assertNotNull(actual: $item);
        $this->assertSame(expected: 'article-1', actual: $item->articleId);
        $this->assertSame(expected: 2, actual: $item->quantity);
        $this->assertFalse(condition: $item->checked);
    }

    public function testItThrowsWhenArticleDoesNotExist(): void
    {
        $this->expectException(exception: AddShoppingListItemException::class);

        $handler = $this->buildHandler(existingArticleIds: [], articleIdsInList: []);

        ($handler)(new AddShoppingListItemCommand(
            articleId: 'ghost-article',
            quantity: 1,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenArticleAlreadyInList(): void
    {
        $this->expectException(exception: AddShoppingListItemException::class);

        $handler = $this->buildHandler(
            existingArticleIds: ['article-1'],
            articleIdsInList: ['article-1'],
        );

        ($handler)(new AddShoppingListItemCommand(
            articleId: 'article-1',
            quantity: 1,
            createdByUserId: 'god-user-id',
        ));
    }

    public function testItThrowsWhenQuantityIsNotPositive(): void
    {
        $this->expectException(exception: AddShoppingListItemException::class);

        $handler = $this->buildHandler(
            existingArticleIds: ['article-1'],
            articleIdsInList: [],
        );

        ($handler)(new AddShoppingListItemCommand(
            articleId: 'article-1',
            quantity: 0,
            createdByUserId: 'god-user-id',
        ));
    }

    /**
     * @param string[] $existingArticleIds
     * @param string[] $articleIdsInList
     */
    private function buildHandler(array $existingArticleIds, array $articleIdsInList): AddShoppingListItemCommandHandler
    {
        return new AddShoppingListItemCommandHandler(
            shoppingListItemRepository: $this->repository,
            needleDataQuery: new InMemoryAddShoppingListItemNeedleDataQuery(
                existingArticleIds: $existingArticleIds,
                articleIdsInList: $articleIdsInList,
            ),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }
}
