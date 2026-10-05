<?php

namespace Nutrition\Pantry\Movement\Infrastructure\Application\Console;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\RecipeStock\Application\Command\RecalculateRecipeStockCommand;
use Nutrition\Pantry\Stock\Application\Command\RecalculateArticleStockCommand;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Messenger\MessageBusInterface;

final class RecalculateStockCommand extends Command
{
    private const string SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly Connection $writerTenantConnection,
        private readonly EntityManagerInterface $tenantEntityManager,
        private readonly MessageBusInterface $messageBus,
    ) {
        parent::__construct(name: 'app:pantry:recalculate-stock');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Recompute the stock of every article and recipe from the movements of its ledger, without writing any movement. Run it after the ledger was touched outside the application.')
            ->addOption(name: 'tenant', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Recalculate a single tenant database by name instead of discovering all GLC% tenants.', default: null)
            ->addOption(name: 'article', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Recalculate only this article id. Requires --tenant.', default: null);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $tenant = $input->getOption('tenant');
        $article = $input->getOption('article');

        if (null !== $article && null === $tenant) {
            $output->writeln(messages: '<error>--article needs --tenant.</error>');

            return Command::INVALID;
        }

        $databases = null !== $tenant
            ? [$tenant]
            : $this->writerTenantConnection->executeQuery("SHOW DATABASES LIKE 'GLC%'")->fetchFirstColumn();

        if ([] === $databases) {
            $output->writeln(messages: '<comment>No tenant databases found.</comment>');

            return Command::SUCCESS;
        }

        foreach ($databases as $dbname) {
            $this->recalculateTenant(dbname: $dbname, article: $article, output: $output);
        }

        return Command::SUCCESS;
    }

    private function recalculateTenant(string $dbname, ?string $article, OutputInterface $output): void
    {
        $this->switcher->switch(tenantId: $dbname);
        $this->tenantEntityManager->clear();

        if (null !== $article) {
            $this->recalculateArticle(articleId: $article);
            $output->writeln(messages: sprintf('<info>%s: article %s recalculated.</info>', $dbname, $article));

            return;
        }

        $articles = $this->references(kind: StockMovement::KIND_ARTICLE, table: 'article_stock', refColumn: 'article_id');
        $recipes = $this->references(kind: StockMovement::KIND_RECIPE, table: 'recipe_stock', refColumn: 'recipe_id');

        array_walk(array: $articles, callback: fn (string $articleId) => $this->recalculateArticle(articleId: $articleId));
        array_walk(array: $recipes, callback: fn (string $recipeId) => $this->recalculateRecipe(recipeId: $recipeId));

        $output->writeln(messages: sprintf(
            '<info>%s: %d articles and %d recipes recalculated.</info>',
            $dbname,
            count($articles),
            count($recipes),
        ));
    }

    private function recalculateArticle(string $articleId): void
    {
        $this->messageBus->dispatch(new RecalculateArticleStockCommand(
            articleId: $articleId,
            updatedByUserId: self::SYSTEM_USER_ID,
        ));
    }

    private function recalculateRecipe(string $recipeId): void
    {
        $this->messageBus->dispatch(new RecalculateRecipeStockCommand(
            recipeId: $recipeId,
            updatedByUserId: self::SYSTEM_USER_ID,
        ));
    }

    /**
     * @return string[]
     */
    private function references(string $kind, string $table, string $refColumn): array
    {
        $projected = $this->writerTenantConnection->createQueryBuilder()
            ->select(sprintf('s.%s', $refColumn))
            ->from(table: $table, alias: 's')
            ->executeQuery()
            ->fetchFirstColumn();

        $moved = $this->writerTenantConnection->createQueryBuilder()
            ->select('DISTINCT m.ref_id')
            ->from(table: 'stock_movement', alias: 'm')
            ->where('m.kind = :kind')
            ->setParameter(key: 'kind', value: $kind)
            ->executeQuery()
            ->fetchFirstColumn();

        return array_values(array: array_unique(array: array_map(
            callback: 'strval',
            array: [...$projected, ...$moved],
        )));
    }
}
