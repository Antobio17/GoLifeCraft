<?php

namespace App\Tests\Authorization\User\Registration\Application\Command;

use Authorization\User\EmailVerificationToken\Domain\Service\SendVerificationEmail;
use Authorization\User\EmailVerificationToken\Infrastructure\Domain\Model\InMemory\InMemoryEmailVerificationTokenRepository;
use Authorization\User\Registration\Application\Command\RegisterUser\RegisterUserCommand;
use Authorization\User\Registration\Application\Command\RegisterUser\RegisterUserCommandHandler;
use Authorization\User\Registration\Domain\Exception\RegisterUserException;
use Authorization\User\Registration\Infrastructure\Domain\QueryModel\InMemory\InMemoryRegisterUserNeedleDataQuery;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use Authorization\User\User\Infrastructure\Domain\Service\InMemory\InMemoryPasswordHasher;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tenant\Tenant\Domain\Service\TenantIdentifierGenerator;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class RegisterUserCommandHandlerTest extends TestCase
{
    private InMemoryUserRepository $userRepository;
    private InMemoryEmailVerificationTokenRepository $tokenRepository;
    private InMemoryRegisterUserNeedleDataQuery $needleDataQuery;
    private object $sendVerificationEmail;
    private RegisterUserCommandHandler $handler;

    protected function setUp(): void
    {
        $this->userRepository = new InMemoryUserRepository();
        $this->tokenRepository = new InMemoryEmailVerificationTokenRepository();
        $this->needleDataQuery = new InMemoryRegisterUserNeedleDataQuery();
        $this->sendVerificationEmail = new class implements SendVerificationEmail {
            public int $calls = 0;
            public ?string $lastEmail = null;
            public ?string $lastRawToken = null;

            public function send(string $email, string $name, string $languageCode, string $rawToken): void
            {
                ++$this->calls;
                $this->lastEmail = $email;
                $this->lastRawToken = $rawToken;
            }
        };

        $tenantIdentifierGenerator = new class implements TenantIdentifierGenerator {
            public function next(): string
            {
                return 'GLC0000000001';
            }
        };

        $this->handler = new RegisterUserCommandHandler(
            userRepository: $this->userRepository,
            tokenRepository: $this->tokenRepository,
            needleDataQuery: $this->needleDataQuery,
            tenantIdentifierGenerator: $tenantIdentifierGenerator,
            sendVerificationEmail: $this->sendVerificationEmail,
            passwordHasher: new InMemoryPasswordHasher(),
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
            tokenTtlMinutes: 1440,
        );
    }

    public function testItRegistersUserInactiveUnverifiedWithReservedTenantAndSendsEmail(): void
    {
        ($this->handler)(new RegisterUserCommand(
            email: 'jane@example.com',
            password: 'StrongPass1!',
            name: 'Jane',
        ));

        $user = $this->userRepository->findByUsername(username: 'jane@example.com');
        $this->assertNotNull(actual: $user);
        $this->assertFalse(condition: $user->isActive);
        $this->assertFalse(condition: $user->emailVerified);
        $this->assertSame(expected: 'GLC0000000001', actual: $user->tenantId);
        $this->assertSame(expected: User::ROLE_GOD, actual: $user->role);
        $this->assertSame(expected: 'hashed_StrongPass1!', actual: $user->password);

        $this->assertSame(expected: 1, actual: $this->sendVerificationEmail->calls);
        $this->assertSame(expected: 'jane@example.com', actual: $this->sendVerificationEmail->lastEmail);
        $this->assertNotNull(actual: $this->sendVerificationEmail->lastRawToken);
    }

    public function testItThrowsWhenEmailAlreadyExists(): void
    {
        $this->needleDataQuery->add(username: 'jane@example.com');

        $this->expectException(RegisterUserException::class);

        ($this->handler)(new RegisterUserCommand(
            email: 'jane@example.com',
            password: 'StrongPass1!',
            name: 'Jane',
        ));
    }

    public function testItThrowsWhenPasswordIsWeak(): void
    {
        $this->expectException(RegisterUserException::class);

        ($this->handler)(new RegisterUserCommand(
            email: 'jane@example.com',
            password: 'weak',
            name: 'Jane',
        ));
    }
}
