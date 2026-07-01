<?php

namespace Integration\Mcp\Server\Infrastructure\Domain\Service\Sidecar;

use Symfony\Component\Yaml\Yaml;

final class YamlSidecarReader
{
    public function read(string $path): array
    {
        return Yaml::parseFile(filename: $path);
    }
}
