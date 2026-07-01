<?php

namespace Integration\Mcp\Server\Application\Command;

use Shared\Shared\Shared\Application\Command\Command;

final readonly class WriteModelCommand implements Command
{
    public function __construct(
        public string $entityAlias,
        public array $data,
        public ?string $id,
        public string $userSessionId,
        public string $role,
    ) {
    }

    public static function getName(): string
    {
        return 'golifecraft.mcp.command.1.model.write';
    }
}
