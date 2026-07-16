<?php

namespace Authorization\User\Registration\Application\Command\RegisterUser;

use Authorization\User\EmailVerificationToken\Domain\Model\EmailVerificationToken;
use Authorization\User\EmailVerificationToken\Domain\Model\EmailVerificationTokenRepository;
use Authorization\User\EmailVerificationToken\Domain\Service\SendVerificationEmail;
use Authorization\User\Registration\Domain\Exception\RegisterUserException;
use Authorization\User\Registration\Domain\QueryModel\RegisterUserNeedleDataQuery;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Model\UserRepository;
use Authorization\User\User\Domain\Service\PasswordHasher;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tenant\Tenant\Domain\Service\TenantIdentifierGenerator;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RegisterUserCommandHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private EmailVerificationTokenRepository $tokenRepository,
        private RegisterUserNeedleDataQuery $needleDataQuery,
        private TenantIdentifierGenerator $tenantIdentifierGenerator,
        private SendVerificationEmail $sendVerificationEmail,
        private PasswordHasher $passwordHasher,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
        private int $tokenTtlMinutes,
    ) {
    }

    public function __invoke(RegisterUserCommand $command): void
    {
        if (!preg_match(pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/', subject: $command->password)) {
            throw RegisterUserException::weakPassword();
        }

        if ($this->needleDataQuery->userAlreadyExists(username: $command->email)) {
            throw RegisterUserException::emailAlreadyExists(email: $command->email);
        }

        $tenantId = $this->tenantIdentifierGenerator->next();

        $user = User::register(
            id: $this->userRepository->nextId(),
            username: $command->email,
            tenantId: $tenantId,
            email: $command->email,
            name: $command->name,
            lastname: '',
            plainPassword: $command->password,
            role: User::ROLE_GOD,
            passwordHasher: $this->passwordHasher,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->userRepository->save(user: $user);

        $rawToken = bin2hex(string: random_bytes(length: 32));
        $token = EmailVerificationToken::create(
            id: $this->tokenRepository->nextId(),
            userId: $user->id,
            rawToken: $rawToken,
            now: $this->dateTimeGenerator->now(),
            ttlMinutes: $this->tokenTtlMinutes,
        );

        $this->sendVerificationEmail->send(
            email: $user->email,
            name: $user->name,
            languageCode: 'es',
            rawToken: $rawToken,
        );

        $this->tokenRepository->save(token: $token);
        $this->domainEventCollectorService->register(aggregate: $user);
        $this->domainEventCollectorService->register(aggregate: $token);
    }
}
