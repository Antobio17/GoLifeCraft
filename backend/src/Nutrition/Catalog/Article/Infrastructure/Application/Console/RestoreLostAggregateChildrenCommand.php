<?php

namespace Nutrition\Catalog\Article\Infrastructure\Application\Console;

use Doctrine\DBAL\Connection;
use Ramsey\Uuid\Uuid;
use Shared\Tenant\Tenant\Domain\Service\TenantConnectionSwitcher;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Assigning or clearing an image used to wipe the equivalences of an article and the ingredients and steps of a
 * recipe, because the repository mirrored an in-memory list that the load never filled. Those rows are gone, but
 * the domain event log kept the whole state of every article and recipe as of its last write, so the last event
 * that still carried children is enough to put them back.
 */
final class RestoreLostAggregateChildrenCommand extends Command
{
    private const array ARTICLE_EVENTS = [
        'golifecraft.nutrition.event.1.article.created',
        'golifecraft.nutrition.event.1.article.updated',
    ];

    private const array RECIPE_EVENTS = [
        'golifecraft.nutrition.event.1.recipe.created',
        'golifecraft.nutrition.event.1.recipe.updated',
    ];

    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly Connection $writerTenantConnection,
    ) {
        parent::__construct(name: 'app:catalog:restore-lost-children');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Rebuild the article equivalences and the recipe ingredients and steps that an image upload wiped, reading them back from the domain event log.')
            ->addOption(name: 'tenant', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Restore a single tenant database by name instead of discovering all GLC% tenants.', default: null)
            ->addOption(name: 'force', shortcut: null, mode: InputOption::VALUE_NONE, description: 'Actually write the rows back. Without it the command only reports what it would restore.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $tenant = $input->getOption('tenant');
        $force = (bool) $input->getOption('force');
        $databases = null !== $tenant
            ? [$tenant]
            : $this->writerTenantConnection->executeQuery("SHOW DATABASES LIKE 'GLC%'")->fetchFirstColumn();

        if (empty($databases)) {
            $output->writeln(messages: '<comment>No tenant databases found.</comment>');

            return Command::SUCCESS;
        }

        if (!$force) {
            $output->writeln(messages: '<comment>Dry run: no changes will be written. Add --force to apply them.</comment>');
        }

        foreach ($databases as $dbname) {
            $this->restoreTenant(dbname: $dbname, force: $force, output: $output);
        }

        return Command::SUCCESS;
    }

    private function restoreTenant(string $dbname, bool $force, OutputInterface $output): void
    {
        $this->switcher->switch(tenantId: $dbname);
        $output->writeln(messages: sprintf('<info>Tenant %s</info>', $dbname));

        $restored = $this->restoreArticles(force: $force, output: $output)
            + $this->restoreRecipes(force: $force, output: $output);

        if (0 === $restored) {
            $output->writeln(messages: '  <comment>nothing to restore</comment>');
        }
    }

    private function restoreArticles(bool $force, OutputInterface $output): int
    {
        $restored = 0;

        foreach ($this->childlessParents(table: 'article', childTable: 'article_equivalence', childColumn: 'article_id') as $articleId) {
            $payload = $this->lastPayloadCarrying(aggregateId: $articleId, eventNames: self::ARTICLE_EVENTS, key: 'equivalences');

            if (null === $payload) {
                continue;
            }

            $output->writeln(messages: sprintf('  article %s: %d equivalence(s)', $articleId, count($payload['equivalences'])));
            ++$restored;

            if (!$force) {
                continue;
            }

            $this->insertEquivalences(articleId: $articleId, payload: $payload);
        }

        return $restored;
    }

    private function restoreRecipes(bool $force, OutputInterface $output): int
    {
        $restored = 0;

        foreach ($this->childlessParents(table: 'recipe', childTable: 'recipe_ingredient', childColumn: 'recipe_id') as $recipeId) {
            $payload = $this->lastPayloadCarrying(aggregateId: $recipeId, eventNames: self::RECIPE_EVENTS, key: 'ingredients');

            if (null === $payload) {
                continue;
            }

            $output->writeln(messages: sprintf(
                '  recipe %s: %d ingredient(s), %d step(s)',
                $recipeId,
                count($payload['ingredients']),
                count($payload['steps'] ?? []),
            ));
            ++$restored;

            if (!$force) {
                continue;
            }

            $this->insertIngredients(recipeId: $recipeId, payload: $payload);
            $this->insertSteps(recipeId: $recipeId, payload: $payload);
        }

        return $restored;
    }

    /**
     * @return string[]
     */
    private function childlessParents(string $table, string $childTable, string $childColumn): array
    {
        return $this->writerTenantConnection->fetchFirstColumn(query: sprintf(
            'SELECT parent.id FROM %s parent WHERE NOT EXISTS (SELECT 1 FROM %s child WHERE child.%s = parent.id)',
            $table,
            $childTable,
            $childColumn,
        ));
    }

    /**
     * @param string[] $eventNames
     *
     * @return array<string, mixed>|null
     */
    private function lastPayloadCarrying(string $aggregateId, array $eventNames, string $key): ?array
    {
        $rows = $this->writerTenantConnection->fetchFirstColumn(
            query: sprintf(
                'SELECT payload FROM domain_event_log WHERE aggregate_id = ? AND event_name IN (%s) ORDER BY occurred_on DESC, recorded_at DESC',
                implode(',', array_fill(start_index: 0, count: count($eventNames), value: '?')),
            ),
            params: [$aggregateId, ...$eventNames],
        );

        foreach ($rows as $row) {
            $payload = json_decode(json: (string) $row, associative: true);

            if (!is_array($payload) || empty($payload[$key])) {
                continue;
            }

            return $payload;
        }

        return null;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function insertEquivalences(string $articleId, array $payload): void
    {
        $stamp = $this->stampOf(payload: $payload, parentTable: 'article', parentId: $articleId);

        foreach ($payload['equivalences'] as $index => $equivalence) {
            $this->writerTenantConnection->insert(table: 'article_equivalence', data: [
                'id' => Uuid::uuid4()->toString(),
                'version' => 1,
                'article_id' => $articleId,
                'unit' => $equivalence['unit'],
                'quantity' => $equivalence['quantity'],
                'position' => $equivalence['position'] ?? $index + 1,
                ...$stamp,
            ]);
        }
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function insertIngredients(string $recipeId, array $payload): void
    {
        $stamp = $this->stampOf(payload: $payload, parentTable: 'recipe', parentId: $recipeId);

        foreach ($payload['ingredients'] as $index => $ingredient) {
            $this->writerTenantConnection->insert(table: 'recipe_ingredient', data: [
                'id' => Uuid::uuid4()->toString(),
                'version' => 1,
                'recipe_id' => $recipeId,
                'kind' => $ingredient['kind'],
                'ref_id' => $ingredient['refId'],
                'quantity' => $ingredient['quantity'],
                'unit' => $ingredient['unit'],
                'position' => $ingredient['position'] ?? $index + 1,
                ...$stamp,
            ]);
        }
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function insertSteps(string $recipeId, array $payload): void
    {
        $stamp = $this->stampOf(payload: $payload, parentTable: 'recipe', parentId: $recipeId);

        foreach ($payload['steps'] ?? [] as $index => $step) {
            $this->writerTenantConnection->insert(table: 'recipe_step', data: [
                'id' => Uuid::uuid4()->toString(),
                'version' => 1,
                'recipe_id' => $recipeId,
                'position' => $step['position'] ?? $index + 1,
                'text' => $step['text'],
                'minutes' => $step['minutes'],
                ...$stamp,
            ]);
        }
    }

    /**
     * @param array<string, mixed> $payload
     *
     * @return array<string, string>
     */
    private function stampOf(array $payload, string $parentTable, string $parentId): array
    {
        $parent = $this->writerTenantConnection->fetchAssociative(
            query: sprintf('SELECT created_at, created_by_user_id FROM %s WHERE id = ?', $parentTable),
            params: [$parentId],
        );

        $userId = $payload['updatedByUserId'] ?? $payload['createdByUserId'] ?? $parent['created_by_user_id'];

        return [
            'created_at' => $parent['created_at'],
            'updated_at' => (new \DateTime())->format(format: 'Y-m-d H:i:s'),
            'created_by_user_id' => $userId,
            'updated_by_user_id' => $userId,
        ];
    }
}
