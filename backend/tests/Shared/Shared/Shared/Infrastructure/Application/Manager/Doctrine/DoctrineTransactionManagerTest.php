<?php

namespace App\Tests\Shared\Shared\Shared\Infrastructure\Application\Manager\Doctrine;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManager;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Infrastructure\Application\Manager\Doctrine\DoctrineTransactionManager;

final class DoctrineTransactionManagerTest extends TestCase
{
    private EntityManager&MockObject $masterEntityManager;
    private EntityManager&MockObject $tenantEntityManager;
    private DoctrineTransactionManager $transactionManager;

    protected function setUp(): void
    {
        $this->masterEntityManager = $this->entityManager();
        $this->tenantEntityManager = $this->entityManager();
        $this->transactionManager = new DoctrineTransactionManager(
            masterEntityManager: $this->masterEntityManager,
            tenantEntityManager: $this->tenantEntityManager,
        );
    }

    public function testItOpensOneTransactionForTheWholeChain(): void
    {
        $this->masterEntityManager->expects($this->once())->method('beginTransaction');
        $this->tenantEntityManager->expects($this->once())->method('beginTransaction');

        $this->transactionManager->beginTransaction();
        $this->transactionManager->beginTransaction();
        $this->transactionManager->beginTransaction();

        $this->assertTrue(condition: $this->transactionManager->isTransactionActive());
    }

    public function testItDoesNotCommitUntilTheOutermostFlush(): void
    {
        $this->masterEntityManager->expects($this->never())->method('commit');
        $this->tenantEntityManager->expects($this->never())->method('commit');

        $this->transactionManager->beginTransaction();
        $this->transactionManager->beginTransaction();

        $this->transactionManager->flush();

        $this->assertTrue(condition: $this->transactionManager->isTransactionActive());
    }

    public function testItCommitsOnceTheOutermostFlushArrives(): void
    {
        $this->masterEntityManager->expects($this->once())->method('commit');
        $this->tenantEntityManager->expects($this->once())->method('commit');

        $this->transactionManager->beginTransaction();
        $this->transactionManager->beginTransaction();
        $this->transactionManager->flush();
        $this->transactionManager->flush();

        $this->assertFalse(condition: $this->transactionManager->isTransactionActive());
    }

    public function testANestedFailureRollsBackTheWholeChain(): void
    {
        $this->masterEntityManager->expects($this->once())->method('rollback');
        $this->tenantEntityManager->expects($this->once())->method('rollback');
        $this->masterEntityManager->expects($this->never())->method('commit');
        $this->tenantEntityManager->expects($this->never())->method('commit');

        $this->transactionManager->beginTransaction();
        $this->transactionManager->beginTransaction();

        $this->transactionManager->rollback();
        $this->transactionManager->flush();

        $this->assertFalse(condition: $this->transactionManager->isTransactionActive());
    }

    private function entityManager(): EntityManager&MockObject
    {
        $connection = $this->createMock(Connection::class);
        $connection->method('isTransactionActive')->willReturn(true);

        $entityManager = $this->createMock(EntityManager::class);
        $entityManager->method('getConnection')->willReturn($connection);

        return $entityManager;
    }
}
