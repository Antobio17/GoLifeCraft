<?php

namespace Authorization\User\User\Application\Command;

use Authorization\User\User\Domain\Exception\UpdateUserException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Model\UserRepository;
use Authorization\User\User\Domain\QueryModel\UpdateUserNeedleDataQuery;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateUserCommandHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private UpdateUserNeedleDataQuery $needleDataQuery,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateUserCommand $command): void
    {
        if (User::ROLE_USER === $this->needleDataQuery->getUserRole(userId: $command->updatedByUserId)) {
            throw UpdateUserException::accessDeniedForReadOnlyRole();
        }

        $user = $this->userRepository->findById(id: $command->userId);
        if (null === $user) {
            throw UpdateUserException::userNotFound(userId: $command->userId);
        }

        if (User::ROLE_GOD === $user->role) {
            throw UpdateUserException::cannotEditGodUser();
        }

        $isRoleChanging = $user->role !== $command->role;
        $arePermissionsChanging =
            $user->canCreateFolder !== $command->canCreateFolder
            || $user->canDeleteFolder !== $command->canDeleteFolder
            || $user->canUploadFile !== $command->canUploadFile
            || $user->canDeleteFile !== $command->canDeleteFile
            || $user->canSignFile !== $command->canSignFile
            || $user->canRollbackSign !== $command->canRollbackSign
            || $user->canAccessUsers !== $command->canAccessUsers;
        if (
            $user->username === $command->username
            && $user->email === $command->email
            && $user->name === $command->name
            && $user->lastname === $command->lastname
            && $user->isActive === $command->isActive
            && !$isRoleChanging
            && !$arePermissionsChanging
        ) {
            return;
        }

        if (
            $isRoleChanging
            && (
                !in_array(
                    needle: $this->needleDataQuery->getUserRole(userId: $command->updatedByUserId),
                    haystack: [User::ROLE_GOD],
                    strict: true,
                )
            || User::ROLE_GOD === $command->role
            )
        ) {
            throw UpdateUserException::accessDeniedToChangeRole();
        }

        if (
            $user->username !== $command->username
            && $this->needleDataQuery->usernameAlreadyExists(
                username: $command->username,
                excludeUserId: $command->userId,
            )
        ) {
            throw UpdateUserException::usernameAlreadyExists(username: $command->username);
        }

        $user->update(
            username: $command->username,
            email: $command->email,
            name: $command->name,
            lastname: $command->lastname,
            role: $command->role,
            isActive: $command->isActive,
            updatedByUserId: $command->updatedByUserId,
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
