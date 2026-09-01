<?php

namespace App\Tests\Authorization\User\Usage\Application\Query;

use Authorization\User\Usage\Application\Query\GetUserUsage\GetUserUsageQuery;
use Authorization\User\Usage\Application\Query\GetUserUsage\GetUserUsageQueryHandler;
use Authorization\User\Usage\Domain\Exception\GetUserUsageException;
use Authorization\User\Usage\Domain\QueryModel\Dto\GetUserUsageResult;
use Authorization\User\Usage\Infrastructure\Domain\QueryModel\InMemory\InMemoryGetUserUsageNeedleDataQuery;
use Authorization\User\Usage\Infrastructure\UI\API\DataTransform\ApiGetUserUsageDataTransform;
use Authorization\User\User\Domain\Model\User;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;

final class GetUserUsageQueryHandlerTest extends TestCase
{
    private const string USER_ID = 'user-id-1';
    private const string TENANT_ID = 'tenant_1';

    private InMemoryGetUserUsageNeedleDataQuery $needleDataQuery;
    private GetUserUsageQueryHandler $handler;

    protected function setUp(): void
    {
        $this->needleDataQuery = new InMemoryGetUserUsageNeedleDataQuery();
        $this->handler = new GetUserUsageQueryHandler(
            needleDataQuery: $this->needleDataQuery,
            dataTransform: new ApiGetUserUsageDataTransform(),
        );
    }

    public function testItDeniesAccessToNonAdminUsers(): void
    {
        $this->needleDataQuery->addUser(userId: self::USER_ID, tenantId: self::TENANT_ID);

        $this->expectException(exception: GetUserUsageException::class);

        ($this->handler)(new GetUserUsageQuery(
            userId: self::USER_ID,
            userRole: User::ROLE_USER,
        ));
    }

    public function testItFailsWhenTheUserDoesNotExist(): void
    {
        $this->expectException(exception: GetUserUsageException::class);

        ($this->handler)(new GetUserUsageQuery(
            userId: 'unknown-user-id',
            userRole: User::ROLE_GOD,
        ));
    }

    public function testItReturnsNotProvisionedUsageWhenTheTenantHasNoSchema(): void
    {
        $this->needleDataQuery->addUser(userId: self::USER_ID, tenantId: self::TENANT_ID);

        /** @var QuerySingleResult $result */
        $result = ($this->handler)(new GetUserUsageQuery(
            userId: self::USER_ID,
            userRole: User::ROLE_GOD,
        ));

        /** @var GetUserUsageResult $usage */
        $usage = $result->item;

        $this->assertInstanceOf(expected: GetUserUsageResult::class, actual: $usage);
        $this->assertFalse(condition: $usage->provisioned);
        $this->assertSame(expected: self::TENANT_ID, actual: $usage->tenantId);
        $this->assertSame(expected: 0, actual: $usage->totalRecords);
        $this->assertNull(actual: $usage->lastActivityAt);
    }

    public function testItReturnsTheUsageOfTheTenant(): void
    {
        $this->needleDataQuery->addUser(userId: self::USER_ID, tenantId: self::TENANT_ID);
        $this->needleDataQuery->addUsage(tenantId: self::TENANT_ID, usage: new GetUserUsageResult(
            id: self::USER_ID,
            tenantId: self::TENANT_ID,
            provisioned: true,
            totalRecords: 120,
            totalEvents: 340,
            firstActivityAt: '2026-01-01T10:00:00+00:00',
            lastActivityAt: '2026-08-30T18:00:00+00:00',
            lastWorkoutAt: '2026-08-29T19:30:00+00:00',
            metrics: [
                ['metric' => 'articles', 'value' => 80],
                ['metric' => 'completedWorkouts', 'value' => 12],
            ],
            modules: [
                ['module' => 'nutrition', 'records' => 100, 'lastActivityAt' => '2026-08-30T18:00:00+00:00'],
                ['module' => 'gym', 'records' => 20, 'lastActivityAt' => '2026-08-29T19:30:00+00:00'],
            ],
            dailyActivity: [
                ['date' => '2026-08-30', 'events' => 4],
            ],
            monthlyActivity: [
                ['month' => '2026-08', 'events' => 40],
            ],
        ));

        /** @var QuerySingleResult $result */
        $result = ($this->handler)(new GetUserUsageQuery(
            userId: self::USER_ID,
            userRole: User::ROLE_GOD,
        ));

        /** @var GetUserUsageResult $usage */
        $usage = $result->item;

        $this->assertTrue(condition: $usage->provisioned);
        $this->assertSame(expected: self::USER_ID, actual: $usage->id);
        $this->assertSame(expected: 'UserUsage', actual: $usage->aggregateName);
        $this->assertSame(expected: 120, actual: $usage->totalRecords);
        $this->assertSame(expected: 340, actual: $usage->totalEvents);
        $this->assertSame(expected: '2026-08-29T19:30:00+00:00', actual: $usage->lastWorkoutAt);
        $this->assertCount(expectedCount: 2, haystack: $usage->metrics);
        $this->assertCount(expectedCount: 2, haystack: $usage->modules);
    }
}
