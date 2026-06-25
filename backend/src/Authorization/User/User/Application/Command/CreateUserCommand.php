<?php

namespace Authorization\User\User\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class CreateUserCommand implements Command
{
    public function __construct(
        public string $username,
        public string $email,
        public string $name,
        public string $lastname,
        public string $plainPassword,
        public string $role,
        public string $createdByUserId,
        public string $createdByUserRole,
        public bool $canCreateFolder = false,
        public bool $canDeleteFolder = false,
        public bool $canUploadFile = false,
        public bool $canDeleteFile = false,
        public bool $canSignFile = false,
        public bool $canRollbackSign = false,
        public bool $canAccessUsers = false,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.authorization.command.1.user.create';
    }
}
