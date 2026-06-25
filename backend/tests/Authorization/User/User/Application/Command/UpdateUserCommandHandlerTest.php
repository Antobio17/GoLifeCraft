<?php

namespace App\Tests\Authorization\User\User\Application\Command;

use Authorization\User\User\Application\Command\UpdateUserCommand;
use Authorization\User\User\Application\Command\UpdateUserCommandHandler;
use Authorization\User\User\Domain\Exception\UpdateUserException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use Authorization\User\User\Infrastructure\Domain\QueryModel\InMemory\InMemoryUpdateUserNeedleDataQuery;
use Authorization\User\User\Infrastructure\Domain\Service\InMemory\InMemoryPasswordHasher;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateUserCommandHandlerTest extends TestCase
{
    private InMemoryUserRepository $repository;
    private InMemoryUpdateUserNeedleDataQuery $needleDataQuery;
    private DomainEventCollectorService $domainEventCollectorService;
    private DateTimeGenerator $dateTimeGenerator;
    private UpdateUserCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryUserRepository();
        $this->needleDataQuery = new InMemoryUpdateUserNeedleDataQuery();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->handler = new UpdateUserCommandHandler(
            userRepository: $this->repository,
            needleDataQuery: $this->needleDataQuery,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator
        );
    }

    public function testItUpdatesUserSuccessfullyByGodUserWithoutRoleChange(): void
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
            role: User::ROLE_CENTRAL_ADMIN,
            passwordHasher: new InMemoryPasswordHasher(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->repository->save(user: $user);
        $this->needleDataQuery->addUserRole(userId: 'god-user-id', role: User::ROLE_GOD);

        $command = new UpdateUserCommand(
            userId: 'user-1',
            username: 'john.doe',
            email: 'john.updated@example.com',
            name: 'John Updated',
            lastname: 'Doe Updated',
            isActive: false,
            role: User::ROLE_CENTRAL_ADMIN,
            updatedByUserId: 'god-user-id',
        );

        ($this->handler)($command);

        $updatedUser = $this->repository->findById(id: 'user-1');
        $this->assertNotNull(actual: $updatedUser);
        $this->assertEquals(expected: 'john.updated@example.com', actual: $updatedUser->email);
        $this->assertEquals(expected: 'John Updated', actual: $updatedUser->name);
        $this->assertEquals(expected: 'Doe Updated', actual: $updatedUser->lastname);
        $this->assertFalse(condition: $updatedUser->isActive);
        $this->assertEquals(expected: 'god-user-id', actual: $updatedUser->updatedByUserId);
        $this->assertEquals(expected: User::ROLE_CENTRAL_ADMIN, actual: $updatedUser->role);
    }

    public function testItUpdatesUserSuccessfullyByThemselves(): void
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
            role: User::ROLE_CENTRAL_ADMIN,
            passwordHasher: new InMemoryPasswordHasher(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->repository->save(user: $user);
        $this->needleDataQuery->addUserRole(userId: 'user-1', role: User::ROLE_CENTRAL_ADMIN);

        $command = new UpdateUserCommand(
            userId: 'user-1',
            username: 'john.doe',
            email: 'john.self-updated@example.com',
            name: 'John Self',
            lastname: 'Updated',
            isActive: true,
            role: User::ROLE_CENTRAL_ADMIN,
            updatedByUserId: 'user-1',
        );

        ($this->handler)($command);

        $updatedUser = $this->repository->findById(id: 'user-1');
        $this->assertNotNull(actual: $updatedUser);
        $this->assertEquals(expected: 'john.self-updated@example.com', actual: $updatedUser->email);
        $this->assertEquals(expected: 'John Self', actual: $updatedUser->name);
    }

    public function testItThrowsExceptionWhenUserNotFound(): void
    {
        $command = new UpdateUserCommand(
            userId: 'non-existent-user',
            username: 'test.user',
            email: 'test@example.com',
            name: 'Test',
            lastname: 'User',
            isActive: true,
            role: User::ROLE_CENTRAL_ADMIN,
            updatedByUserId: 'super-admin-id',
        );

        $this->expectException(exception: UpdateUserException::class);
        $this->expectExceptionMessage(message: 'User with this ID does not exist.');

        ($this->handler)($command);
    }

    public function testItThrowsExceptionWhenGodUserTriesToChangeOwnRole(): void
    {
        $user = new User(
            id: 'god-user-id',
            username: 'god.user',
            tenantId: 'tenant-1',
            email: 'god@example.com',
            name: 'God',
            lastname: 'User',
            password: 'hashed_password',
            role: User::ROLE_GOD,
            isActive: true,
            createdAt: new \DateTime(),
            updatedAt: new \DateTime(),
            createdByUserId: 'system',
            updatedByUserId: 'system',
            roles: [User::ROLE_GOD]
        );
        $this->repository->save(user: $user);
        $this->needleDataQuery->addUserRole(userId: 'god-user-id', role: User::ROLE_GOD);

        $command = new UpdateUserCommand(
            userId: 'god-user-id',
            username: 'god.user',
            email: 'god@example.com',
            name: 'God',
            lastname: 'User',
            isActive: true,
            role: User::ROLE_CENTRAL_ADMIN,
            updatedByUserId: 'god-user-id',
        );

        $this->expectException(exception: UpdateUserException::class);
        $this->expectExceptionMessage(message: 'Cannot edit a GOD user.');

        ($this->handler)($command);
    }

    public function testItDoesNotChangeRoleWhenRoleIsTheSame(): void
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
            role: User::ROLE_CENTRAL_ADMIN,
            passwordHasher: new InMemoryPasswordHasher(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->repository->save(user: $user);
        $this->needleDataQuery->addUserRole(userId: 'user-1', role: User::ROLE_CENTRAL_ADMIN);

        $command = new UpdateUserCommand(
            userId: 'user-1',
            username: 'john.doe',
            email: 'john.updated@example.com',
            name: 'John Updated',
            lastname: 'Doe',
            isActive: true,
            role: User::ROLE_CENTRAL_ADMIN,
            updatedByUserId: 'user-1',
        );

        ($this->handler)($command);

        $updatedUser = $this->repository->findById(id: 'user-1');
        $this->assertNotNull(actual: $updatedUser);
        $this->assertEquals(expected: User::ROLE_CENTRAL_ADMIN, actual: $updatedUser->role);
    }

    public function testItUpdatesUsernameSuccessfully(): void
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
            role: User::ROLE_CENTRAL_ADMIN,
            passwordHasher: new InMemoryPasswordHasher(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->repository->save(user: $user);
        $this->needleDataQuery->addUserRole(userId: 'user-1', role: User::ROLE_CENTRAL_ADMIN);

        $command = new UpdateUserCommand(
            userId: 'user-1',
            username: 'john.renamed',
            email: 'john.doe@example.com',
            name: 'John',
            lastname: 'Doe',
            isActive: true,
            role: User::ROLE_CENTRAL_ADMIN,
            updatedByUserId: 'user-1',
        );

        ($this->handler)($command);

        $updatedUser = $this->repository->findById(id: 'user-1');
        $this->assertNotNull(actual: $updatedUser);
        $this->assertEquals(expected: 'john.renamed', actual: $updatedUser->username);
    }

    public function testItThrowsExceptionWhenUpdaterRoleIsReadOnly(): void
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
            role: User::ROLE_CENTRAL_ADMIN,
            passwordHasher: new InMemoryPasswordHasher(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->repository->save(user: $user);
        $this->needleDataQuery->addUserRole(userId: 'reader-id', role: User::ROLE_USER);

        $command = new UpdateUserCommand(
            userId: 'user-1',
            username: 'john.renamed',
            email: 'john.doe@example.com',
            name: 'John',
            lastname: 'Doe',
            isActive: true,
            role: User::ROLE_CENTRAL_ADMIN,
            updatedByUserId: 'reader-id',
        );

        $this->expectException(exception: UpdateUserException::class);
        $this->expectExceptionMessage(message: 'Access denied: read-only users cannot update users.');

        ($this->handler)($command);
    }

    public function testItThrowsExceptionWhenUsernameAlreadyExists(): void
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
            role: User::ROLE_CENTRAL_ADMIN,
            passwordHasher: new InMemoryPasswordHasher(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );
        $this->repository->save(user: $user);
        $this->needleDataQuery->addUserRole(userId: 'user-1', role: User::ROLE_CENTRAL_ADMIN);
        $this->needleDataQuery->addExistingUsername(username: 'jane.doe', userId: 'user-2');

        $command = new UpdateUserCommand(
            userId: 'user-1',
            username: 'jane.doe',
            email: 'john.doe@example.com',
            name: 'John',
            lastname: 'Doe',
            isActive: true,
            role: User::ROLE_CENTRAL_ADMIN,
            updatedByUserId: 'user-1',
        );

        $this->expectException(exception: UpdateUserException::class);
        $this->expectExceptionMessage(message: 'User with this username already exists.');

        ($this->handler)($command);
    }
}
