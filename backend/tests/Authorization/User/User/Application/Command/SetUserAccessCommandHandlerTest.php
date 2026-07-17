<?php

namespace App\Tests\Authorization\User\User\Application\Command;

use Authorization\User\User\Application\Command\SetUserAccess\SetUserAccessCommand;
use Authorization\User\User\Application\Command\SetUserAccess\SetUserAccessCommandHandler;
use Authorization\User\User\Domain\Exception\SetUserAccessException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class SetUserAccessCommandHandlerTest extends TestCase
{
    private InMemoryUserRepository $repository;
    private SetUserAccessCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryUserRepository();
        $this->handler = new SetUserAccessCommandHandler(
            userRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    private function buildUser(string $id, bool $isActive): User
    {
        return new User(
            id: $id,
            username: 'john.doe',
            tenantId: 'GLC0000000009',
            email: 'john@example.com',
            name: 'John',
            lastname: 'Doe',
            password: 'hashed',
            role: User::ROLE_USER,
            isActive: $isActive,
            createdAt: new \DateTime(),
            updatedAt: new \DateTime(),
            createdByUserId: $id,
            updatedByUserId: $id,
            roles: [User::ROLE_USER],
        );
    }

    public function testItGrantsAccessToAnInactiveUser(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1', isActive: false));

        ($this->handler)(new SetUserAccessCommand(
            userId: 'user-1',
            isActive: true,
            userSessionId: 'admin-1',
            userRole: User::ROLE_GOD,
        ));

        $this->assertTrue(condition: $this->repository->findById(id: 'user-1')->isActive);
    }

    public function testItRevokesAccessFromAnActiveUser(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1', isActive: true));

        ($this->handler)(new SetUserAccessCommand(
            userId: 'user-1',
            isActive: false,
            userSessionId: 'admin-1',
            userRole: User::ROLE_GOD,
        ));

        $this->assertFalse(condition: $this->repository->findById(id: 'user-1')->isActive);
    }

    public function testItDeniesAccessToNonGodUsers(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1', isActive: false));

        $this->expectException(SetUserAccessException::class);

        ($this->handler)(new SetUserAccessCommand(
            userId: 'user-1',
            isActive: true,
            userSessionId: 'admin-1',
            userRole: User::ROLE_USER,
        ));
    }

    public function testItPreventsChangingOwnAccess(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'admin-1', isActive: true));

        $this->expectException(SetUserAccessException::class);

        ($this->handler)(new SetUserAccessCommand(
            userId: 'admin-1',
            isActive: false,
            userSessionId: 'admin-1',
            userRole: User::ROLE_GOD,
        ));
    }

    public function testItThrowsWhenUserNotFound(): void
    {
        $this->expectException(SetUserAccessException::class);

        ($this->handler)(new SetUserAccessCommand(
            userId: 'missing',
            isActive: true,
            userSessionId: 'admin-1',
            userRole: User::ROLE_GOD,
        ));
    }
}
