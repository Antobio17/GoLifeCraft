<?php

namespace App\Tests\Authorization\User\PasswordResetToken\Application\Command;

use Authorization\User\PasswordResetToken\Application\Command\ConfirmPasswordReset\ConfirmPasswordResetCommand;
use Authorization\User\PasswordResetToken\Application\Command\ConfirmPasswordReset\ConfirmPasswordResetCommandHandler;
use Authorization\User\PasswordResetToken\Domain\Exception\ConfirmPasswordResetException;
use Authorization\User\PasswordResetToken\Domain\Model\PasswordResetToken;
use Authorization\User\PasswordResetToken\Infrastructure\Domain\Model\InMemory\InMemoryPasswordResetTokenRepository;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use Authorization\User\User\Infrastructure\Domain\Service\InMemory\InMemoryPasswordHasher;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ConfirmPasswordResetCommandHandlerTest extends TestCase
{
    private InMemoryPasswordResetTokenRepository $repository;
    private InMemoryUserRepository $userRepository;
    private ConfirmPasswordResetCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryPasswordResetTokenRepository();
        $this->userRepository = new InMemoryUserRepository();
        $this->handler = new ConfirmPasswordResetCommandHandler(
            repository: $this->repository,
            userRepository: $this->userRepository,
            passwordHasher: new InMemoryPasswordHasher(),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    private function buildUser(string $id): User
    {
        return new User(
            id: $id,
            username: 'jane@example.com',
            tenantId: 'GLC0000000001',
            email: 'jane@example.com',
            name: 'Jane',
            lastname: '',
            password: 'hashed_old',
            role: User::ROLE_GOD,
            isActive: true,
            createdAt: new \DateTime(),
            updatedAt: new \DateTime(),
            createdByUserId: $id,
            updatedByUserId: $id,
        );
    }

    public function testItResetsPasswordWithValidToken(): void
    {
        $user = $this->buildUser(id: 'user-1');
        $this->userRepository->save(user: $user);

        $token = PasswordResetToken::create(
            id: 'token-1',
            userId: 'user-1',
            rawToken: 'raw-token-value',
            now: new \DateTime(),
            ttlMinutes: 60,
        );
        $this->repository->save(token: $token);

        ($this->handler)(new ConfirmPasswordResetCommand(
            rawToken: 'raw-token-value',
            newPassword: 'NewStrong1!',
        ));

        $saved = $this->userRepository->findById(id: 'user-1');
        $this->assertSame(expected: 'hashed_NewStrong1!', actual: $saved->password);
    }

    public function testItThrowsWhenPasswordIsWeak(): void
    {
        $this->expectException(ConfirmPasswordResetException::class);

        ($this->handler)(new ConfirmPasswordResetCommand(
            rawToken: 'raw-token-value',
            newPassword: 'weak',
        ));
    }

    public function testItThrowsWhenTokenInvalid(): void
    {
        $this->expectException(ConfirmPasswordResetException::class);

        ($this->handler)(new ConfirmPasswordResetCommand(
            rawToken: 'unknown-token',
            newPassword: 'NewStrong1!',
        ));
    }

    public function testItThrowsWhenTokenExpired(): void
    {
        $user = $this->buildUser(id: 'user-1');
        $this->userRepository->save(user: $user);

        $token = PasswordResetToken::create(
            id: 'token-1',
            userId: 'user-1',
            rawToken: 'raw-token-value',
            now: (new DateTimeGenerator())->now()->modify(modifier: '-2 hours'),
            ttlMinutes: 60,
        );
        $this->repository->save(token: $token);

        $this->expectException(ConfirmPasswordResetException::class);

        ($this->handler)(new ConfirmPasswordResetCommand(
            rawToken: 'raw-token-value',
            newPassword: 'NewStrong1!',
        ));
    }
}
