<?php

namespace Authorization\User\User\Application\Command;

use Authorization\User\User\Domain\Exception\CreateUserException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Model\UserRepository;
use Authorization\User\User\Domain\QueryModel\CreateUserNeedleDataQuery;
use Authorization\User\User\Domain\Service\PasswordHasher;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CreateUserCommandHandler
{
    public function __construct(
        private CreateUserNeedleDataQuery $needleDataQuery,
        private UserRepository $userRepository,
        private PasswordHasher $passwordHasher,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CreateUserCommand $command): void
    {
        if (User::ROLE_USER === $command->createdByUserRole) {
            throw CreateUserException::accessDeniedForReadOnlyRole();
        }

        if ($this->needleDataQuery->userAlreadyExists(username: $command->username)) {
            throw CreateUserException::userAlreadyExists(username: $command->username);
        }

        $tenantId = $this->needleDataQuery->getTenantIdFromUserCreating(userId: $command->createdByUserId);
        if (null === $tenantId) {
            throw CreateUserException::createdByUserNotFound(userId: $command->createdByUserId);
        }

        $user = User::create(
            id: $this->userRepository->nextId(),
            username: $command->username,
            tenantId: $tenantId,
            email: $command->email,
            name: $command->name,
            lastname: $command->lastname,
            plainPassword: $command->plainPassword,
            role: $command->role,
            isActive: true,
            createdByUserId: $command->createdByUserId,
            passwordHasher: $this->passwordHasher,
            dateTimeGenerator: $this->dateTimeGenerator,
            canCreateFolder: $command->canCreateFolder,
            canDeleteFolder: $command->canDeleteFolder,
            canUploadFile: $command->canUploadFile,
            canDeleteFile: $command->canDeleteFile,
            canSignFile: $command->canSignFile,
            canRollbackSign: $command->canRollbackSign,
            canAccessUsers: $command->canAccessUsers,
        );

        $this->userRepository->save(user: $user);
        $this->domainEventCollectorService->register(aggregate: $user);
    }
}
