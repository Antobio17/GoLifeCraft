<?php

namespace App\Tests\Authorization\User\EmailVerificationToken\Application\Command;

use Authorization\User\EmailVerificationToken\Application\Command\ConfirmEmailVerification\ConfirmEmailVerificationCommand;
use Authorization\User\EmailVerificationToken\Application\Command\ConfirmEmailVerification\ConfirmEmailVerificationCommandHandler;
use Authorization\User\EmailVerificationToken\Domain\Exception\ConfirmEmailVerificationException;
use Authorization\User\EmailVerificationToken\Domain\Model\EmailVerificationToken;
use Authorization\User\EmailVerificationToken\Infrastructure\Domain\Model\InMemory\InMemoryEmailVerificationTokenRepository;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ConfirmEmailVerificationCommandHandlerTest extends TestCase
{
    private InMemoryEmailVerificationTokenRepository $tokenRepository;
    private InMemoryUserRepository $userRepository;
    private ConfirmEmailVerificationCommandHandler $handler;

    protected function setUp(): void
    {
        $this->tokenRepository = new InMemoryEmailVerificationTokenRepository();
        $this->userRepository = new InMemoryUserRepository();
        $this->handler = new ConfirmEmailVerificationCommandHandler(
            repository: $this->tokenRepository,
            userRepository: $this->userRepository,
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
            password: 'hashed_pass',
            role: User::ROLE_GOD,
            isActive: false,
            createdAt: new \DateTime(),
            updatedAt: new \DateTime(),
            createdByUserId: $id,
            updatedByUserId: $id,
            emailVerified: false,
        );
    }

    public function testItVerifiesEmailButKeepsUserInactive(): void
    {
        $user = $this->buildUser(id: 'user-1');
        $this->userRepository->save(user: $user);

        $token = EmailVerificationToken::create(
            id: 'token-1',
            userId: 'user-1',
            rawToken: 'raw-token-value',
            now: new \DateTime(),
            ttlMinutes: 1440,
        );
        $this->tokenRepository->save(token: $token);

        ($this->handler)(new ConfirmEmailVerificationCommand(rawToken: 'raw-token-value'));

        $saved = $this->userRepository->findById(id: 'user-1');
        $this->assertNotNull(actual: $saved);
        $this->assertTrue(condition: $saved->emailVerified);
        $this->assertFalse(condition: $saved->isActive);
    }

    public function testItThrowsWhenTokenInvalid(): void
    {
        $this->expectException(ConfirmEmailVerificationException::class);

        ($this->handler)(new ConfirmEmailVerificationCommand(rawToken: 'unknown-token'));
    }

    public function testItThrowsWhenTokenExpired(): void
    {
        $user = $this->buildUser(id: 'user-1');
        $this->userRepository->save(user: $user);

        $token = EmailVerificationToken::create(
            id: 'token-1',
            userId: 'user-1',
            rawToken: 'raw-token-value',
            now: (new DateTimeGenerator())->now()->modify(modifier: '-2 days'),
            ttlMinutes: 60,
        );
        $this->tokenRepository->save(token: $token);

        $this->expectException(ConfirmEmailVerificationException::class);

        ($this->handler)(new ConfirmEmailVerificationCommand(rawToken: 'raw-token-value'));
    }
}
