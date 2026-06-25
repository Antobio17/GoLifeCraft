<?php

namespace App\Tests\Authorization\User\User\Application\Command;

use Authorization\User\User\Application\Command\ChangeMyPassword\ChangeMyPasswordCommand;
use Authorization\User\User\Application\Command\ChangeMyPassword\ChangeMyPasswordCommandHandler;
use Authorization\User\User\Domain\Exception\ChangeMyPasswordException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use Authorization\User\User\Infrastructure\Domain\Service\InMemory\InMemoryPasswordHasher;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ChangeMyPasswordCommandHandlerTest extends TestCase
{
    private InMemoryUserRepository $repository;
    private InMemoryPasswordHasher $passwordHasher;
    private ChangeMyPasswordCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryUserRepository();
        $this->passwordHasher = new InMemoryPasswordHasher();
        $this->handler = new ChangeMyPasswordCommandHandler(
            userRepository: $this->repository,
            passwordHasher: $this->passwordHasher,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    private function buildUser(string $id, string $plainPassword): User
    {
        return new User(
            id: $id,
            username: 'john.doe',
            tenantId: 'tenant-1',
            email: 'john@example.com',
            name: 'John',
            lastname: 'Doe',
            password: 'hashed_'.$plainPassword,
            role: User::ROLE_CENTRAL_ADMIN,
            isActive: true,
            createdAt: new \DateTime(),
            updatedAt: new \DateTime(),
            createdByUserId: $id,
            updatedByUserId: $id,
            roles: [User::ROLE_CENTRAL_ADMIN],
        );
    }

    public function testItChangesPasswordSuccessfully(): void
    {
        $user = $this->buildUser(id: 'user-1', plainPassword: 'old_password');
        $this->repository->save(user: $user);

        ($this->handler)(new ChangeMyPasswordCommand(
            userSessionId: 'user-1',
            currentPassword: 'old_password',
            newPassword: 'NewPassword1!',
        ));

        $saved = $this->repository->findById(id: 'user-1');
        $this->assertNotNull(actual: $saved);
        $this->assertEquals(expected: 'hashed_NewPassword1!', actual: $saved->password);
    }

    public function testItThrowsExceptionWhenCurrentPasswordIsInvalid(): void
    {
        $user = $this->buildUser(id: 'user-1', plainPassword: 'correct_password');
        $this->repository->save(user: $user);

        $this->expectException(ChangeMyPasswordException::class);

        ($this->handler)(new ChangeMyPasswordCommand(
            userSessionId: 'user-1',
            currentPassword: 'wrong_password',
            newPassword: 'new_password',
        ));
    }

    public function testItThrowsExceptionWhenUserNotFound(): void
    {
        $this->expectException(ChangeMyPasswordException::class);

        ($this->handler)(new ChangeMyPasswordCommand(
            userSessionId: 'non-existent',
            currentPassword: 'any_password',
            newPassword: 'new_password',
        ));
    }
}
