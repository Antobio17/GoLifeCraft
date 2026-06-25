<?php

namespace App\Tests\Shared\Shared\DomainEventLog\Application\Query;

use Authorization\User\User\Domain\Model\User;
use PHPUnit\Framework\TestCase;
use Shared\Shared\DomainEventLog\Application\Query\GetDomainEventLogsQuery;
use Shared\Shared\DomainEventLog\Application\Query\GetDomainEventLogsQueryHandler;
use Shared\Shared\DomainEventLog\Domain\Exception\GetDomainEventLogException;
use Shared\Shared\DomainEventLog\Domain\QueryModel\Dto\GetDomainEventLogsResult;
use Shared\Shared\DomainEventLog\Infrastructure\Domain\QueryModel\InMemory\InMemoryGetDomainEventLogsNeedleDataQuery;
use Shared\Shared\DomainEventLog\Infrastructure\UI\API\DataTransform\ApiGetDomainEventLogsDataTransform;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class GetDomainEventLogsQueryHandlerTest extends TestCase
{
    private InMemoryGetDomainEventLogsNeedleDataQuery $needleDataQuery;
    private GetDomainEventLogsQueryHandler $handler;

    protected function setUp(): void
    {
        $this->needleDataQuery = new InMemoryGetDomainEventLogsNeedleDataQuery();
        $this->handler = new GetDomainEventLogsQueryHandler(
            needleDataQuery: $this->needleDataQuery,
            dataTransform: new ApiGetDomainEventLogsDataTransform(),
        );
    }

    public function testItReturnsEmptyCollectionWhenNoLogs(): void
    {
        $query = new GetDomainEventLogsQuery(
            userRole: User::ROLE_GOD,
            page: 1,
            pageSize: 10,
        );

        /** @var QueryCollectionResult $result */
        $result = ($this->handler)($query);

        $this->assertInstanceOf(expected: QueryCollectionResult::class, actual: $result);
        $this->assertCount(expectedCount: 0, haystack: $result->items);
        $this->assertSame(expected: 0, actual: $result->total);
    }

    public function testItReturnsAllLogsWithPagination(): void
    {
        $user = InMemoryGetDomainEventLogsNeedleDataQuery::buildDefaultUserResult();

        for ($i = 1; $i <= 5; ++$i) {
            $this->needleDataQuery->addResult(result: new GetDomainEventLogsResult(
                id: 'log-id-'.$i,
                aggregateName: 'DomainEventLog',
                eventName: 'golifecraft.shared.event.1.foo.created',
                aggregateId: 'aggregate-id-'.$i,
                payload: ['createdByUserId' => 'user-id-1'],
                occurredOn: '2026-01-0'.$i.'T10:00:00+00:00',
                recordedAt: '2026-01-0'.$i.'T10:00:01+00:00',
                user: $user,
            ));
        }

        $query = new GetDomainEventLogsQuery(
            userRole: User::ROLE_GOD,
            page: 1,
            pageSize: 3,
        );

        /** @var QueryCollectionResult $result */
        $result = ($this->handler)($query);

        $this->assertCount(expectedCount: 3, haystack: $result->items);
        $this->assertSame(expected: 5, actual: $result->total);
        $this->assertSame(expected: 1, actual: $result->pageNumber);
        $this->assertSame(expected: 3, actual: $result->pageSize);
    }

    public function testItFiltersLogsByEventName(): void
    {
        $user = InMemoryGetDomainEventLogsNeedleDataQuery::buildDefaultUserResult();

        $this->needleDataQuery->addResult(result: new GetDomainEventLogsResult(
            id: 'log-id-1',
            aggregateName: 'DomainEventLog',
            eventName: 'golifecraft.shared.event.1.foo.created',
            aggregateId: 'aggregate-id-1',
            payload: ['createdByUserId' => 'user-id-1'],
            occurredOn: '2026-01-01T10:00:00+00:00',
            recordedAt: '2026-01-01T10:00:01+00:00',
            user: $user,
        ));

        $this->needleDataQuery->addResult(result: new GetDomainEventLogsResult(
            id: 'log-id-2',
            aggregateName: 'DomainEventLog',
            eventName: 'golifecraft.shared.event.1.bar.updated',
            aggregateId: 'aggregate-id-2',
            payload: ['createdByUserId' => 'user-id-1'],
            occurredOn: '2026-01-02T10:00:00+00:00',
            recordedAt: '2026-01-02T10:00:01+00:00',
            user: $user,
        ));

        $query = new GetDomainEventLogsQuery(
            userRole: User::ROLE_GOD,
            page: 1,
            pageSize: 10,
            filterEventName: 'golifecraft.shared.event.1.foo.created',
        );

        /** @var QueryCollectionResult $result */
        $result = ($this->handler)($query);

        $this->assertCount(expectedCount: 1, haystack: $result->items);
        $this->assertSame(expected: 1, actual: $result->total);

        /** @var GetDomainEventLogsResult $item */
        $item = $result->items[0];
        $this->assertSame(expected: 'golifecraft.shared.event.1.foo.created', actual: $item->eventName);
    }

    public function testItFiltersLogsByDateRange(): void
    {
        $user = InMemoryGetDomainEventLogsNeedleDataQuery::buildDefaultUserResult();

        $this->needleDataQuery->addResult(result: new GetDomainEventLogsResult(
            id: 'log-id-1',
            aggregateName: 'DomainEventLog',
            eventName: 'golifecraft.shared.event.1.foo.created',
            aggregateId: 'aggregate-id-1',
            payload: ['createdByUserId' => 'user-id-1'],
            occurredOn: '2026-01-01T10:00:00+00:00',
            recordedAt: '2026-01-01T10:00:01+00:00',
            user: $user,
        ));

        $this->needleDataQuery->addResult(result: new GetDomainEventLogsResult(
            id: 'log-id-2',
            aggregateName: 'DomainEventLog',
            eventName: 'golifecraft.shared.event.1.bar.updated',
            aggregateId: 'aggregate-id-2',
            payload: ['createdByUserId' => 'user-id-1'],
            occurredOn: '2026-01-15T10:00:00+00:00',
            recordedAt: '2026-01-15T10:00:01+00:00',
            user: $user,
        ));

        $this->needleDataQuery->addResult(result: new GetDomainEventLogsResult(
            id: 'log-id-3',
            aggregateName: 'DomainEventLog',
            eventName: 'golifecraft.shared.event.1.baz.deleted',
            aggregateId: 'aggregate-id-3',
            payload: ['createdByUserId' => 'user-id-1'],
            occurredOn: '2026-02-01T10:00:00+00:00',
            recordedAt: '2026-02-01T10:00:01+00:00',
            user: $user,
        ));

        $query = new GetDomainEventLogsQuery(
            userRole: User::ROLE_GOD,
            page: 1,
            pageSize: 10,
            filterDateFrom: '2026-01-05T00:00:00+00:00',
            filterDateTo: '2026-01-31T23:59:59+00:00',
        );

        /** @var QueryCollectionResult $result */
        $result = ($this->handler)($query);

        $this->assertCount(expectedCount: 1, haystack: $result->items);
        $this->assertSame(expected: 1, actual: $result->total);

        /** @var GetDomainEventLogsResult $item */
        $item = $result->items[0];
        $this->assertSame(expected: 'log-id-2', actual: $item->id);
    }

    public function testItResolvesUserInResult(): void
    {
        $user = InMemoryGetDomainEventLogsNeedleDataQuery::buildDefaultUserResult();

        $this->needleDataQuery->addResult(result: new GetDomainEventLogsResult(
            id: 'log-id-1',
            aggregateName: 'DomainEventLog',
            eventName: 'golifecraft.shared.event.1.foo.created',
            aggregateId: 'aggregate-id-1',
            payload: ['createdByUserId' => 'user-id-1'],
            occurredOn: '2026-01-01T10:00:00+00:00',
            recordedAt: '2026-01-01T10:00:01+00:00',
            user: $user,
        ));

        $query = new GetDomainEventLogsQuery(
            userRole: User::ROLE_GOD,
            page: 1,
            pageSize: 10,
        );

        /** @var QueryCollectionResult $result */
        $result = ($this->handler)($query);

        /** @var GetDomainEventLogsResult $item */
        $item = $result->items[0];
        $this->assertSame(expected: 'user-id-1', actual: $item->user->id);
        $this->assertSame(expected: 'testuser', actual: $item->user->username);
        $this->assertSame(expected: 'Test', actual: $item->user->name);
        $this->assertSame(expected: 'User', actual: $item->user->lastname);
    }

    public function testItThrowsExceptionWhenRoleIsReadOnly(): void
    {
        $query = new GetDomainEventLogsQuery(
            userRole: User::ROLE_USER,
            page: 1,
            pageSize: 10,
        );

        $this->expectException(exception: GetDomainEventLogException::class);
        $this->expectExceptionMessage(message: 'Access denied: read-only users cannot read domain event logs.');

        ($this->handler)($query);
    }
}
