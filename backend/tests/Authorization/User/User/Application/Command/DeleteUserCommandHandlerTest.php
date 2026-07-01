<?php

namespace App\Tests\Authorization\User\User\Application\Command;

use Authorization\User\User\Application\Command\DeleteUserCommand;
use Authorization\User\User\Application\Command\DeleteUserCommandHandler;
use Authorization\User\User\Domain\Exception\DeleteUserException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use Authorization\User\User\Infrastructure\Domain\Service\InMemory\InMemoryPasswordHasher;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteUserCommandHandlerTest extends TestCase
{
    private InMemoryUserRepository $repository;
    private DomainEventCollectorService $domainEventCollectorService;
    private DateTimeGenerator $dateTimeGenerator;
    private DeleteUserCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryUserRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->handler = new DeleteUserCommandHandler(
            userRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator
        );
    }

    public function testItDeletesUserSuccessfullyByThemselves(): void
    {
        $user = User::create(
            id: 'user-1',
            username: 'john.doe',
            tenantId: 'tenant-1',
            email: 'john.doe@example.com',
            name: 'John',
            lastname: 'Doe',
            plainPassword: 'secret123',
            isActive: true,
            createdByUserId: 'admin-user-id',
            role: User::ROLE_USER,
            passwordHasher: new InMemoryPasswordHasher(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->repository->save(user: $user);

        $command = new DeleteUserCommand(
            userId: 'user-1',
            deletedByUserId: 'user-1',
            deletedByUserRole: User::ROLE_GOD,
        );

        ($this->handler)($command);

        $deletedUser = $this->repository->findById(id: 'user-1');
        $this->assertNull(actual: $deletedUser);
    }

    public function testItDeletesUserSuccessfullyBySuperAdmin(): void
    {
        $user = User::create(
            id: 'user-1',
            username: 'john.doe',
            tenantId: 'tenant-1',
            email: 'john.doe@example.com',
            name: 'John',
            lastname: 'Doe',
            plainPassword: 'secret123',
            isActive: true,
            createdByUserId: 'admin-user-id',
            role: User::ROLE_USER,
            passwordHasher: new InMemoryPasswordHasher(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->repository->save(user: $user);

        $command = new DeleteUserCommand(
            userId: 'user-1',
            deletedByUserId: 'super-admin-id',
            deletedByUserRole: User::ROLE_GOD,
        );

        ($this->handler)($command);

        $deletedUser = $this->repository->findById(id: 'user-1');
        $this->assertNull(actual: $deletedUser);
    }

    public function testItDeletesUserSuccessfullyByAdmin(): void
    {
        $user = User::create(
            id: 'user-1',
            username: 'john.doe',
            tenantId: 'tenant-1',
            email: 'john.doe@example.com',
            name: 'John',
            lastname: 'Doe',
            plainPassword: 'secret123',
            isActive: true,
            createdByUserId: 'admin-user-id',
            role: User::ROLE_USER,
            passwordHasher: new InMemoryPasswordHasher(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->repository->save(user: $user);

        $command = new DeleteUserCommand(
            userId: 'user-1',
            deletedByUserId: 'admin-id',
            deletedByUserRole: User::ROLE_GOD,
        );

        ($this->handler)($command);

        $deletedUser = $this->repository->findById(id: 'user-1');
        $this->assertNull(actual: $deletedUser);
    }

    public function testItThrowsExceptionWhenUserNotFound(): void
    {
        $command = new DeleteUserCommand(
            userId: 'non-existent-user',
            deletedByUserId: 'super-admin-id',
            deletedByUserRole: User::ROLE_GOD,
        );

        $this->expectException(exception: DeleteUserException::class);
        $this->expectExceptionMessage(message: 'User with this ID does not exist.');

        ($this->handler)($command);
    }

    public function testItThrowsExceptionWhenDeletingGodUser(): void
    {
        $godUser = new User(
            id: 'god-user-1',
            username: 'god.user',
            tenantId: 'tenant-1',
            email: 'god@example.com',
            name: 'God',
            lastname: 'User',
            password: 'hashed',
            role: User::ROLE_GOD,
            isActive: true,
            createdAt: new \DateTime(),
            updatedAt: new \DateTime(),
            createdByUserId: 'system',
            updatedByUserId: 'system',
            roles: [User::ROLE_GOD],
        );
        $this->repository->save(user: $godUser);

        $command = new DeleteUserCommand(
            userId: 'god-user-1',
            deletedByUserId: 'admin-id',
            deletedByUserRole: User::ROLE_GOD,
        );

        $this->expectException(exception: DeleteUserException::class);
        $this->expectExceptionMessage(message: 'Cannot delete a user with ROLE_GOD.');

        ($this->handler)($command);
    }

    public function testItThrowsExceptionWhenDeletedByRoleIsReadOnly(): void
    {
        $command = new DeleteUserCommand(
            userId: 'user-1',
            deletedByUserId: 'reader-id',
            deletedByUserRole: User::ROLE_USER,
        );

        $this->expectException(exception: DeleteUserException::class);
        $this->expectExceptionMessage(message: 'Access denied: read-only users cannot delete users.');

        ($this->handler)($command);
    }
}
