<?php

namespace App\Tests\Authorization\User\User\Application\Command;

use Authorization\User\User\Application\Command\CreateUserCommand;
use Authorization\User\User\Application\Command\CreateUserCommandHandler;
use Authorization\User\User\Domain\Exception\CreateUserException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use Authorization\User\User\Infrastructure\Domain\QueryModel\InMemory\InMemoryCreateUserNeedleDataQuery;
use Authorization\User\User\Infrastructure\Domain\Service\InMemory\InMemoryPasswordHasher;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class CreateUserCommandHandlerTest extends TestCase
{
    private InMemoryUserRepository $repository;
    private InMemoryCreateUserNeedleDataQuery $needleDataQuery;
    private InMemoryPasswordHasher $passwordHasher;
    private DomainEventCollectorService $domainEventCollectorService;
    private DateTimeGenerator $dateTimeGenerator;
    private CreateUserCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryUserRepository();
        $this->needleDataQuery = new InMemoryCreateUserNeedleDataQuery();
        $this->passwordHasher = new InMemoryPasswordHasher();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->dateTimeGenerator = new DateTimeGenerator();
        $this->handler = new CreateUserCommandHandler(
            needleDataQuery: $this->needleDataQuery,
            userRepository: $this->repository,
            passwordHasher: $this->passwordHasher,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $this->dateTimeGenerator
        );
    }

    public function testItCreatesAUserSuccessfully(): void
    {
        $this->needleDataQuery->addUserWithTenant(userId: 'admin-user-id', tenantId: 'tenant-1');

        $command = new CreateUserCommand(
            username: 'john.doe',
            email: 'john.doe@example.com',
            name: 'John',
            lastname: 'Doe',
            plainPassword: 'secret123',
            role: User::ROLE_USER,
            createdByUserId: 'admin-user-id',
            createdByUserRole: User::ROLE_GOD,
        );

        ($this->handler)($command);

        $this->assertEquals(expected: '2', actual: $this->repository->nextId());
        $createdUser = $this->repository->findByUsername(username: 'john.doe');
        $this->assertNotNull(actual: $createdUser);
        $this->assertEquals(expected: 'john.doe', actual: $createdUser->username);
        $this->assertEquals(expected: 'hashed_secret123', actual: $createdUser->password);
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItThrowsExceptionWhenUsernameAlreadyExists(): void
    {
        $this->needleDataQuery->addExistingUsername(username: 'john.doe');
        $this->needleDataQuery->addUserWithTenant(userId: 'admin-user-id', tenantId: 'tenant-1');

        $command = new CreateUserCommand(
            username: 'john.doe',
            email: 'john.doe@example.com',
            name: 'John',
            lastname: 'Doe',
            plainPassword: 'secret123',
            role: User::ROLE_USER,
            createdByUserId: 'admin-user-id',
            createdByUserRole: User::ROLE_GOD,
        );

        $this->expectException(exception: CreateUserException::class);
        $this->expectExceptionMessage(message: 'User with this username already exists.');

        ($this->handler)($command);
    }

    public function testItThrowsExceptionWhenCreatedByUserNotFound(): void
    {
        $command = new CreateUserCommand(
            username: 'john.doe',
            email: 'john.doe@example.com',
            name: 'John',
            lastname: 'Doe',
            plainPassword: 'secret123',
            role: User::ROLE_USER,
            createdByUserId: 'non-existent-user',
            createdByUserRole: User::ROLE_GOD,
        );

        $this->expectException(exception: CreateUserException::class);
        $this->expectExceptionMessage(message: 'Creating user with this ID does not exist.');

        ($this->handler)($command);
    }

    public function testItThrowsExceptionWhenRoleIsGod(): void
    {
        $this->needleDataQuery->addUserWithTenant(userId: 'admin-user-id', tenantId: 'tenant-1');

        $command = new CreateUserCommand(
            username: 'john.doe',
            email: 'john.doe@example.com',
            name: 'John',
            lastname: 'Doe',
            plainPassword: 'secret123',
            role: User::ROLE_GOD,
            createdByUserId: 'admin-user-id',
            createdByUserRole: User::ROLE_GOD,
        );

        $this->expectException(exception: CreateUserException::class);
        $this->expectExceptionMessage(message: 'Cannot create a user with GOD role.');

        ($this->handler)($command);
    }

    public function testItThrowsExceptionWhenCreatedByRoleIsReadOnly(): void
    {
        $command = new CreateUserCommand(
            username: 'john.doe',
            email: 'john.doe@example.com',
            name: 'John',
            lastname: 'Doe',
            plainPassword: 'secret123',
            role: User::ROLE_USER,
            createdByUserId: 'reader-user-id',
            createdByUserRole: User::ROLE_USER,
        );

        $this->expectException(exception: CreateUserException::class);
        $this->expectExceptionMessage(message: 'Access denied: read-only users cannot create users.');

        ($this->handler)($command);
    }
}
