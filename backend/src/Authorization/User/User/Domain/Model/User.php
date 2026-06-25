<?php

namespace Authorization\User\User\Domain\Model;

use Authorization\User\User\Domain\Event\UserCreated;
use Authorization\User\User\Domain\Event\UserDeleted;
use Authorization\User\User\Domain\Event\UserUpdated;
use Authorization\User\User\Domain\Exception\CreateUserException;
use Authorization\User\User\Domain\Exception\DeleteUserException;
use Authorization\User\User\Domain\Exception\UpdateUserException;
use Authorization\User\User\Domain\Service\PasswordHasher;
use Shared\Shared\Shared\Domain\Model\Aggregate;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class User extends Aggregate implements UserInterface, PasswordAuthenticatedUserInterface
{
    public const string ROLE_GOD = 'ROLE_GOD';
    public const string ROLE_USER = 'ROLE_USER';

    public const array ROLE_HERARCHY = [
        self::ROLE_GOD,
        self::ROLE_USER,
    ];

    private int $version;

    public function __construct(
        public readonly string $id,
        public string $username,
        public readonly string $tenantId,
        public string $email,
        public string $name,
        public string $lastname,
        public string $password,
        public string $role,
        public bool $isActive,
        public readonly \DateTime $createdAt,
        public \DateTime $updatedAt,
        public readonly string $createdByUserId,
        public string $updatedByUserId,
        public array $roles = [],
        public bool $canCreateFolder = false,
        public bool $canDeleteFolder = false,
        public bool $canUploadFile = false,
        public bool $canDeleteFile = false,
        public bool $canSignFile = false,
        public bool $canRollbackSign = false,
        public bool $canAccessUsers = false,
    ) {
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function getRoles(): array
    {
        return $this->roles;
    }

    public function getUserIdentifier(): string
    {
        return $this->id;
    }

    public function eraseCredentials(): void
    {
    }

    public static function create(
        string $id,
        string $username,
        string $tenantId,
        string $email,
        string $name,
        string $lastname,
        string $plainPassword,
        string $role,
        bool $isActive,
        string $createdByUserId,
        PasswordHasher $passwordHasher,
        DateTimeGenerator $dateTimeGenerator,
        bool $canCreateFolder = false,
        bool $canDeleteFolder = false,
        bool $canUploadFile = false,
        bool $canDeleteFile = false,
        bool $canSignFile = false,
        bool $canRollbackSign = false,
        bool $canAccessUsers = false,
    ): self {
        if (self::ROLE_GOD === $role) {
            throw CreateUserException::cannotCreateUserWithGodRole();
        }

        if (!self::isAvailableRole(role: $role)) {
            throw CreateUserException::roleIsNotAvailable(
                role: $role,
                availableRoles: self::getAvailableRoles()
            );
        }

        $effectivePermissions = self::ROLE_USER === $role
            ? [false, false, false, false, false, false, false]
            : [$canCreateFolder, $canDeleteFolder, $canUploadFile, $canDeleteFile, $canSignFile, $canRollbackSign, $canAccessUsers];

        $now = $dateTimeGenerator->now();

        $user = new self(
            id: $id,
            username: $username,
            tenantId: $tenantId,
            email: $email,
            name: $name,
            lastname: $lastname,
            password: $plainPassword,
            role: $role,
            isActive: $isActive,
            createdAt: $now,
            updatedAt: $now,
            createdByUserId: $createdByUserId,
            updatedByUserId: $createdByUserId,
            roles: [$role],
            canCreateFolder: $effectivePermissions[0],
            canDeleteFolder: $effectivePermissions[1],
            canUploadFile: $effectivePermissions[2],
            canDeleteFile: $effectivePermissions[3],
            canSignFile: $effectivePermissions[4],
            canRollbackSign: $effectivePermissions[5],
            canAccessUsers: $effectivePermissions[6],
        );

        $user->password = $passwordHasher->hash(user: $user, plainPassword: $plainPassword);

        $user->record(
            event: new UserCreated(
                aggregateId: $id,
                occurredOn: $now,
                tenantId: $tenantId,
                username: $username,
                email: $email,
                name: $name,
                lastname: $lastname,
                role: $role,
                isActive: $isActive,
                createdAt: $now,
                updatedAt: $now,
                createdByUserId: $createdByUserId,
                updatedByUserId: $createdByUserId,
                canCreateFolder: $user->canCreateFolder,
                canDeleteFolder: $user->canDeleteFolder,
                canUploadFile: $user->canUploadFile,
                canDeleteFile: $user->canDeleteFile,
                canSignFile: $user->canSignFile,
                canRollbackSign: $user->canRollbackSign,
                canAccessUsers: $user->canAccessUsers,
            )
        );

        return $user;
    }

    public function update(
        string $username,
        string $email,
        string $name,
        string $lastname,
        string $role,
        bool $isActive,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
        bool $canCreateFolder = false,
        bool $canDeleteFolder = false,
        bool $canUploadFile = false,
        bool $canDeleteFile = false,
        bool $canSignFile = false,
        bool $canRollbackSign = false,
        bool $canAccessUsers = false,
    ): void {
        if (self::ROLE_GOD === $role) {
            throw UpdateUserException::cannotUpdateUserToGodRole();
        }

        if (
            $role !== $this->role
            && $this->id === $updatedByUserId
        ) {
            throw UpdateUserException::cannotChangeSelfRole();
        }

        if (!in_array(needle: $role, haystack: self::getAvailableRoles(), strict: true)) {
            throw UpdateUserException::newRoleIsNotAvailable(
                role: $role,
                availableRoles: self::getAvailableRoles()
            );
        }

        $now = $dateTimeGenerator->now();

        $isReadOnlyRole = self::ROLE_USER === $role;

        $this->username = $username;
        $this->email = $email;
        $this->name = $name;
        $this->lastname = $lastname;
        $this->isActive = $isActive;
        $this->role = $role;
        $this->roles = [$role];
        $this->updatedByUserId = $updatedByUserId;
        $this->updatedAt = $now;
        $this->canCreateFolder = $isReadOnlyRole ? false : $canCreateFolder;
        $this->canDeleteFolder = $isReadOnlyRole ? false : $canDeleteFolder;
        $this->canUploadFile = $isReadOnlyRole ? false : $canUploadFile;
        $this->canDeleteFile = $isReadOnlyRole ? false : $canDeleteFile;
        $this->canSignFile = $isReadOnlyRole ? false : $canSignFile;
        $this->canRollbackSign = $isReadOnlyRole ? false : $canRollbackSign;
        $this->canAccessUsers = $isReadOnlyRole ? false : $canAccessUsers;

        $this->record(
            event: new UserUpdated(
                aggregateId: $this->id,
                occurredOn: $now,
                username: $username,
                email: $email,
                name: $name,
                lastname: $lastname,
                isActive: $isActive,
                updatedAt: $now,
                updatedByUserId: $updatedByUserId,
                role: $role,
                canCreateFolder: $this->canCreateFolder,
                canDeleteFolder: $this->canDeleteFolder,
                canUploadFile: $this->canUploadFile,
                canDeleteFile: $this->canDeleteFile,
                canSignFile: $this->canSignFile,
                canRollbackSign: $this->canRollbackSign,
                canAccessUsers: $this->canAccessUsers,
            )
        );
    }

    public function updateProfile(
        string $name,
        string $lastname,
        string $email,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->name = $name;
        $this->lastname = $lastname;
        $this->email = $email;
        $this->updatedByUserId = $updatedByUserId;
        $this->updatedAt = $now;

        $this->record(
            event: new UserUpdated(
                aggregateId: $this->id,
                occurredOn: $now,
                username: $this->username,
                email: $email,
                name: $name,
                lastname: $lastname,
                isActive: $this->isActive,
                updatedAt: $now,
                updatedByUserId: $updatedByUserId,
                role: $this->role,
                canCreateFolder: $this->canCreateFolder,
                canDeleteFolder: $this->canDeleteFolder,
                canUploadFile: $this->canUploadFile,
                canDeleteFile: $this->canDeleteFile,
                canSignFile: $this->canSignFile,
                canRollbackSign: $this->canRollbackSign,
                canAccessUsers: $this->canAccessUsers,
            )
        );
    }

    public function changePassword(
        string $hashedPassword,
        string $updatedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        $now = $dateTimeGenerator->now();

        $this->password = $hashedPassword;
        $this->updatedByUserId = $updatedByUserId;
        $this->updatedAt = $now;

        $this->record(
            event: new UserUpdated(
                aggregateId: $this->id,
                occurredOn: $now,
                username: $this->username,
                email: $this->email,
                name: $this->name,
                lastname: $this->lastname,
                isActive: $this->isActive,
                updatedAt: $now,
                updatedByUserId: $updatedByUserId,
                role: $this->role,
                canCreateFolder: $this->canCreateFolder,
                canDeleteFolder: $this->canDeleteFolder,
                canUploadFile: $this->canUploadFile,
                canDeleteFile: $this->canDeleteFile,
                canSignFile: $this->canSignFile,
                canRollbackSign: $this->canRollbackSign,
                canAccessUsers: $this->canAccessUsers,
            )
        );
    }

    public function delete(
        string $deletedByUserId,
        DateTimeGenerator $dateTimeGenerator,
    ): void {
        if (self::ROLE_GOD === $this->role) {
            throw DeleteUserException::cannotDeleteGodUser();
        }

        $now = $dateTimeGenerator->now();

        $this->record(
            event: new UserDeleted(
                aggregateId: $this->id,
                occurredOn: $now,
                deletedByUserId: $deletedByUserId
            )
        );
    }

    public static function isAvailableRole(string $role): bool
    {
        return in_array(
            needle: $role,
            haystack: self::getAvailableRoles(),
            strict: true
        );
    }

    public static function getAvailableRoles(): array
    {
        return [
            self::ROLE_USER,
        ];
    }
}
