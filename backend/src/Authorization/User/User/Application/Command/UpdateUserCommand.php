<?php

namespace Authorization\User\User\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class UpdateUserCommand implements Command
{
    public function __construct(
        public string $userId,
        public string $username,
        public string $email,
        public string $name,
        public string $lastname,
        public bool $isActive,
        public string $role,
        public string $updatedByUserId,
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
        return 'golifecraft.authorization.command.1.user.update';
    }
}
