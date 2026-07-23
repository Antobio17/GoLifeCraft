<?php

namespace Nutrition\Diary\Diary\Infrastructure\Application\Console;

use Doctrine\DBAL\Connection;
use Nutrition\Diary\Diary\Domain\Model\DiaryEntry;
use Nutrition\Recipe\Recipe\Domain\Service\RecipeNutritionCalculator;
use Nutrition\Recipe\Recipe\Infrastructure\Domain\QueryModel\Doctrine\DoctrineRecipeNutritionGraphProvider;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

final class BackfillDiaryMacrosCommand extends Command
{
    private const string DELETED_NAME = '(eliminado)';

    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly Connection $writerTenantConnection,
        private readonly DoctrineRecipeNutritionGraphProvider $graphProvider,
        private readonly RecipeNutritionCalculator $calculator,
    ) {
        parent::__construct(name: 'app:diary:backfill-macros');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Compute and store the macro snapshot on every existing diary entry across all tenant databases. Run once after adding the snapshot columns.')
            ->addOption(name: 'tenant', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Backfill a single tenant database by name instead of discovering all GLC% tenants.', default: null);
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $tenant = $input->getOption('tenant');
        $databases = null !== $tenant
            ? [$tenant]
            : $this->writerTenantConnection->executeQuery("SHOW DATABASES LIKE 'GLC%'")->fetchFirstColumn();

        if (empty($databases)) {
            $output->writeln(messages: '<comment>No tenant databases found.</comment>');

            return Command::SUCCESS;
        }

        foreach ($databases as $dbname) {
            $this->backfillTenant(dbname: $dbname, output: $output);
        }

        return Command::SUCCESS;
    }

    private function backfillTenant(string $dbname, OutputInterface $output): void
    {
        $this->switcher->switch(tenantId: $dbname);

        $entries = $this->writerTenantConnection->createQueryBuilder()
            ->select('e.id', 'e.kind', 'e.ref_id', 'e.quantity')
            ->from(table: 'diary_entry', alias: 'e')
            ->executeQuery()
            ->fetchAllAssociative();

        if ([] === $entries) {
            $output->writeln(messages: sprintf('<comment>%s: no diary entries.</comment>', $dbname));

            return;
        }

        $graph = $this->graphProvider->load();
        $updated = 0;

        foreach ($entries as $entry) {
            if (DiaryEntry::KIND_QUICK === $entry['kind']) {
                continue;
            }

            $isProduct = DiaryEntry::KIND_PRODUCT === $entry['kind'];
            $macros = $this->calculator->ingredientContribution(
                graph: $graph,
                kind: $entry['kind'],
                refId: $entry['ref_id'],
                quantity: (float) $entry['quantity'],
            );
            $name = $isProduct ? $graph->articleName(articleId: $entry['ref_id']) : $graph->recipeName(recipeId: $entry['ref_id']);
            $emoji = $isProduct ? $graph->articleEmoji(articleId: $entry['ref_id']) : $graph->recipeEmoji(recipeId: $entry['ref_id']);

            $this->writerTenantConnection->update(
                table: 'diary_entry',
                data: [
                    'snapshot_name' => $name ?? self::DELETED_NAME,
                    'snapshot_emoji' => $emoji,
                    'snapshot_calories' => $macros->calories,
                    'snapshot_protein' => $macros->protein,
                    'snapshot_fat' => $macros->fat,
                    'snapshot_carbs' => $macros->carbs,
                ],
                criteria: ['id' => $entry['id']],
            );
            ++$updated;
        }

        $output->writeln(messages: sprintf('<info>%s: %d diary entries backfilled.</info>', $dbname, $updated));
    }
}
