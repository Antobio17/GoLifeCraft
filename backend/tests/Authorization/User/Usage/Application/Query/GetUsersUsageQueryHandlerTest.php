<?php

namespace App\Tests\Authorization\User\Usage\Application\Query;

use Authorization\User\Usage\Application\Query\GetUsersUsage\GetUsersUsageQuery;
use Authorization\User\Usage\Application\Query\GetUsersUsage\GetUsersUsageQueryHandler;
use Authorization\User\Usage\Domain\Exception\GetUserUsageException;
use Authorization\User\Usage\Domain\QueryModel\Dto\GetUserUsageSummaryResult;
use Authorization\User\Usage\Infrastructure\Domain\QueryModel\InMemory\InMemoryGetUsersUsageNeedleDataQuery;
use Authorization\User\Usage\Infrastructure\UI\API\DataTransform\ApiGetUsersUsageDataTransform;
use Authorization\User\User\Domain\Model\User;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;

final class GetUsersUsageQueryHandlerTest extends TestCase
{
    private InMemoryGetUsersUsageNeedleDataQuery $needleDataQuery;
    private GetUsersUsageQueryHandler $handler;

    protected function setUp(): void
    {
        $this->needleDataQuery = new InMemoryGetUsersUsageNeedleDataQuery();
        $this->handler = new GetUsersUsageQueryHandler(
            needleDataQuery: $this->needleDataQuery,
            dataTransform: new ApiGetUsersUsageDataTransform(),
        );
    }

    public function testItDeniesAccessToNonAdminUsers(): void
    {
        $this->expectException(exception: GetUserUsageException::class);

        ($this->handler)(new GetUsersUsageQuery(userRole: User::ROLE_USER));
    }

    public function testItReturnsAnEmptyCollectionWithoutUsers(): void
    {
        /** @var QueryCollectionResult $result */
        $result = ($this->handler)(new GetUsersUsageQuery(userRole: User::ROLE_GOD));

        $this->assertSame(expected: [], actual: $result->items);
        $this->assertSame(expected: 0, actual: $result->total);
    }

    public function testItReturnsTheUsageSummaryOfEveryUser(): void
    {
        $this->needleDataQuery->addUser(userId: 'user-1', tenantId: 'tenant_1');
        $this->needleDataQuery->addUser(userId: 'user-2', tenantId: 'tenant_2');
        $this->needleDataQuery->addSummary(tenantId: 'tenant_1', summary: new GetUserUsageSummaryResult(
            id: 'user-1',
            provisioned: true,
            lastActivityAt: '2026-10-10T09:41:00+00:00',
            activeModules: ['nutrition', 'gym'],
            dailyActivity: [
                ['date' => '2026-10-09', 'events' => 3],
                ['date' => '2026-10-10', 'events' => 7],
            ],
        ));

        /** @var QueryCollectionResult $result */
        $result = ($this->handler)(new GetUsersUsageQuery(userRole: User::ROLE_GOD));

        /** @var GetUserUsageSummaryResult[] $summaries */
        $summaries = $result->items;

        $this->assertSame(expected: 2, actual: $result->total);
        $this->assertSame(expected: 'user-1', actual: $summaries[0]->id);
        $this->assertTrue(condition: $summaries[0]->provisioned);
        $this->assertSame(expected: ['nutrition', 'gym'], actual: $summaries[0]->activeModules);
        $this->assertSame(expected: 7, actual: $summaries[0]->dailyActivity[1]['events']);
        $this->assertSame(expected: 'user-2', actual: $summaries[1]->id);
        $this->assertFalse(condition: $summaries[1]->provisioned);
        $this->assertNull(actual: $summaries[1]->lastActivityAt);
    }
}
