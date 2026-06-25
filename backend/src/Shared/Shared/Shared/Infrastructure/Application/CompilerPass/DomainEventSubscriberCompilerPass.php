<?php

namespace Shared\Shared\Shared\Infrastructure\Application\CompilerPass;

use Shared\Shared\Shared\Infrastructure\Application\Middleware\DomainEventMiddleware;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

final class DomainEventSubscriberCompilerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        if (!$container->hasDefinition(id: DomainEventMiddleware::class)) {
            return;
        }

        $subscribers = [];
        $taggedServices = $container->findTaggedServiceIds(name: 'domain_event_subscriber');

        foreach ($taggedServices as $serviceId => $tags) {
            foreach ($tags as $attributes) {
                if (!isset($attributes['event'])) {
                    continue;
                }

                $eventName = $attributes['event'];
                $subscribers[$eventName][] = new Reference(id: $serviceId);
            }
        }

        $definition = $container->getDefinition(id: DomainEventMiddleware::class);
        $definition->setArgument(key: '$subscribers', value: $subscribers);
    }
}
