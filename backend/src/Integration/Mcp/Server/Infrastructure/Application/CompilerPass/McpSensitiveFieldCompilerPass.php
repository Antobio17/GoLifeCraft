<?php

namespace Integration\Mcp\Server\Infrastructure\Application\CompilerPass;

use Symfony\Component\Config\Resource\FileResource;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Exception\LogicException;
use Symfony\Component\Yaml\Yaml;

final class McpSensitiveFieldCompilerPass implements CompilerPassInterface
{
    private const string RESOURCES_PARAMETER = 'mcp.resources';

    private const array SENSITIVE_WORDS = [
        'password', 'passwd', 'pwd', 'secret', 'secrets', 'token', 'tokens',
        'credential', 'credentials', 'hash', 'hashed', 'cipher',
        'apikey', 'privatekey',
    ];

    private const string WORD_BOUNDARY = '/(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|[^a-zA-Z0-9]+/';

    public function process(ContainerBuilder $container): void
    {
        if (!$container->hasParameter(self::RESOURCES_PARAMETER)) {
            return;
        }

        /** @var array<string, array{sidecar: string}> $resources */
        $resources = $container->getParameterBag()->resolveValue($container->getParameter(self::RESOURCES_PARAMETER));

        foreach ($resources as $alias => $resource) {
            $this->guardSidecar(alias: $alias, path: $resource['sidecar'], container: $container);
        }
    }

    private function guardSidecar(string $alias, string $path, ContainerBuilder $container): void
    {
        $container->addResource(new FileResource($path));

        $sidecar = Yaml::parseFile(filename: $path);

        foreach (array_keys($sidecar['fields'] ?? []) as $field) {
            $word = $this->sensitiveWordIn(name: (string) $field);

            if (null === $word) {
                continue;
            }

            throw new LogicException(sprintf(
                'The MCP sidecar "%s" exposes the field "%s" of resource "%s", whose name contains the sensitive word "%s". Remove the field from the sidecar: what an MCP client can read, it can read in full.',
                $path,
                $field,
                $alias,
                $word,
            ));
        }
    }

    private function sensitiveWordIn(string $name): ?string
    {
        $words = array_map(
            static fn (string $word): string => strtolower($word),
            array_filter(preg_split(self::WORD_BOUNDARY, $name) ?: []),
        );

        foreach ($words as $word) {
            if (in_array($word, self::SENSITIVE_WORDS, true)) {
                return $word;
            }
        }

        return null;
    }
}
