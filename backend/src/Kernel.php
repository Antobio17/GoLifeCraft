<?php

use Shared\Shared\Shared\Infrastructure\Application\CompilerPass\DomainEventSubscriberCompilerPass;
use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\Config\Loader\LoaderInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;
use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    protected function configureRoutes(RoutingConfigurator $routes): void
    {
        $routes->import(
            resource: sprintf(
                '%s/src/*/*/*/Infrastructure/UI/*/routes.yaml',
                $this->getProjectDir()
            ),
            type: 'glob'
        );

        $routes->import(resource: '.', type: 'mcp');
    }

    protected function configureContainer(ContainerBuilder $container, LoaderInterface $loader): void
    {
        $loader->load(sprintf('%s/config/{packages}/*.yaml', $this->getProjectDir()), 'glob');
        $this->loadServicesHexagonalInfrastructure(loader: $loader);
    }

    protected function build(ContainerBuilder $container): void
    {
        $container->addCompilerPass(pass: new DomainEventSubscriberCompilerPass());
    }

    private function loadServicesHexagonalInfrastructure(LoaderInterface $loader): void
    {
        $finder = new Finder();
        $finder->files()->in(sprintf('%s/src', $this->getProjectDir()))
            ->name('repositories.yaml')
            ->name('controllers.yaml')
            ->name('queries.yaml')
            ->name('query_handlers.yaml')
            ->name('command_handlers.yaml')
            ->name('services.yaml')
            ->name('tools.yaml')
            ->name('listeners.yaml')
            ->name('managers.yaml')
            ->name('middlewares.yaml')
            ->name('commands.yaml')
            ->name('subscribers.yaml')
            ->path('Infrastructure');

        foreach ($finder as $file) {
            $loader->load($file->getRealPath());
        }
    }
}
