<?php

namespace App\Tests\Authorization\User\User\Application\Command;

use Authorization\User\User\Application\Command\ImpersonateUser\ImpersonateUserCommand;
use Authorization\User\User\Application\Command\ImpersonateUser\ImpersonateUserCommandHandler;
use Authorization\User\User\Domain\Event\UserImpersonated;
use Authorization\User\User\Domain\Exception\ImpersonateUserException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ImpersonateUserCommandHandlerTest extends TestCase
{
    private InMemoryUserRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private ImpersonateUserCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryUserRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new ImpersonateUserCommandHandler(
            userRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
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

    public function testItRecordsTheImpersonationOfAnActiveUser(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1', isActive: true));

        ($this->handler)(new ImpersonateUserCommand(
            userId: 'user-1',
            userSessionId: 'admin-1',
            userRole: User::ROLE_GOD,
        ));

        $events = $this->domainEventCollectorService->pullEvents();

        $this->assertCount(expectedCount: 1, haystack: $events);
        $this->assertInstanceOf(expected: UserImpersonated::class, actual: $events[0]);
        $this->assertSame(expected: 'user-1', actual: $events[0]->aggregateId);
        $this->assertSame(expected: 'admin-1', actual: $events[0]->impersonatorUserId);
        $this->assertSame(expected: 'GLC0000000009', actual: $events[0]->tenantId);
    }

    public function testItDeniesImpersonationToNonGodUsers(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1', isActive: true));

        $this->expectException(ImpersonateUserException::class);

        ($this->handler)(new ImpersonateUserCommand(
            userId: 'user-1',
            userSessionId: 'admin-1',
            userRole: User::ROLE_USER,
        ));
    }

    public function testItPreventsImpersonatingYourself(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'admin-1', isActive: true));

        $this->expectException(ImpersonateUserException::class);

        ($this->handler)(new ImpersonateUserCommand(
            userId: 'admin-1',
            userSessionId: 'admin-1',
            userRole: User::ROLE_GOD,
        ));
    }

    public function testItThrowsWhenUserNotFound(): void
    {
        $this->expectException(ImpersonateUserException::class);

        ($this->handler)(new ImpersonateUserCommand(
            userId: 'missing',
            userSessionId: 'admin-1',
            userRole: User::ROLE_GOD,
        ));
    }

    public function testItThrowsWhenUserHasNoAccessGranted(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1', isActive: false));

        $this->expectException(ImpersonateUserException::class);

        ($this->handler)(new ImpersonateUserCommand(
            userId: 'user-1',
            userSessionId: 'admin-1',
            userRole: User::ROLE_GOD,
        ));
    }
}
