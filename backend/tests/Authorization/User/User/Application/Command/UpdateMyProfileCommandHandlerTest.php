<?php

namespace App\Tests\Authorization\User\User\Application\Command;

use Authorization\User\User\Application\Command\UpdateMyProfile\UpdateMyProfileCommand;
use Authorization\User\User\Application\Command\UpdateMyProfile\UpdateMyProfileCommandHandler;
use Authorization\User\User\Domain\Exception\UpdateMyProfileException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class UpdateMyProfileCommandHandlerTest extends TestCase
{
    private InMemoryUserRepository $repository;
    private UpdateMyProfileCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryUserRepository();
        $this->handler = new UpdateMyProfileCommandHandler(
            userRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    private function buildUser(string $id): User
    {
        return new User(
            id: $id,
            username: 'john.doe',
            tenantId: 'tenant-1',
            email: 'original@example.com',
            name: 'Original',
            lastname: 'Name',
            password: 'hashed',
            role: User::ROLE_USER,
            isActive: true,
            createdAt: new \DateTime(),
            updatedAt: new \DateTime(),
            createdByUserId: $id,
            updatedByUserId: $id,
            roles: [User::ROLE_USER],
        );
    }

    public function testItUpdatesProfileFields(): void
    {
        $user = $this->buildUser(id: 'user-1');
        $this->repository->save(user: $user);

        ($this->handler)(new UpdateMyProfileCommand(
            userSessionId: 'user-1',
            name: 'New Name',
            lastname: 'New Lastname',
        ));

        $saved = $this->repository->findById(id: 'user-1');
        $this->assertNotNull(actual: $saved);
        $this->assertEquals(expected: 'New Name', actual: $saved->name);
        $this->assertEquals(expected: 'New Lastname', actual: $saved->lastname);
    }

    public function testItDoesNotModifyEmail(): void
    {
        $user = $this->buildUser(id: 'user-1');
        $this->repository->save(user: $user);

        ($this->handler)(new UpdateMyProfileCommand(
            userSessionId: 'user-1',
            name: 'New Name',
            lastname: 'New Lastname',
        ));

        $saved = $this->repository->findById(id: 'user-1');
        $this->assertEquals(expected: 'original@example.com', actual: $saved->email);
    }

    public function testItDoesNotModifyRoleOrIsActive(): void
    {
        $user = $this->buildUser(id: 'user-1');
        $this->repository->save(user: $user);

        ($this->handler)(new UpdateMyProfileCommand(
            userSessionId: 'user-1',
            name: 'New Name',
            lastname: 'New Lastname',
        ));

        $saved = $this->repository->findById(id: 'user-1');
        $this->assertEquals(expected: User::ROLE_USER, actual: $saved->role);
        $this->assertTrue(condition: $saved->isActive);
    }

    public function testItThrowsExceptionWhenUserNotFound(): void
    {
        $this->expectException(UpdateMyProfileException::class);

        ($this->handler)(new UpdateMyProfileCommand(
            userSessionId: 'non-existent',
            name: 'Name',
            lastname: 'Lastname',
        ));
    }
}
