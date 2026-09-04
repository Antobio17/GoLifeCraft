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
 * the domain event log kept the whole state of every article and recipe as of its last write.
 *
 * The wipe leaves a signature worth reading precisely, because the current rows always win: a parent whose table
 * is empty while its LAST create/update event still carried children lost them after that write, which is the bug
 * and nothing else. A parent whose last write carried none was emptied on purpose, or was re-saved from a form
 * that had already lost them; either way the event log no longer knows the answer, so those are only reported.
 * Anything already restored by hand has rows again and is never touched. That also makes the command idempotent.
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

    private int $ambiguous = 0;

    public function __construct(
        private readonly TenantConnectionSwitcher $switcher,
        private readonly Connection $writerTenantConnection,
    ) {
        parent::__construct(name: 'app:catalog:restore-lost-children');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Rebuild the article equivalences and the recipe ingredients and steps that an image upload wiped, reading them back from the domain event log. Never overwrites what is already there.')
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

        if ($this->ambiguous > 0) {
            $output->writeln(messages: sprintf(
                '<comment>%d parent(s) left untouched because their last write already carried nothing. Check those by hand.</comment>',
                $this->ambiguous,
            ));
        }

        return Command::SUCCESS;
    }

    private function restoreTenant(string $dbname, bool $force, OutputInterface $output): void
    {
        $this->switcher->switch(tenantId: $dbname);
        $output->writeln(messages: sprintf('<info>Tenant %s</info>', $dbname));

        $restored = $this->restoreEquivalences(force: $force, output: $output)
            + $this->restoreIngredients(force: $force, output: $output)
            + $this->restoreSteps(force: $force, output: $output);

        if (0 === $restored) {
            $output->writeln(messages: '  <comment>nothing to restore</comment>');
        }
    }

    private function restoreEquivalences(bool $force, OutputInterface $output): int
    {
        $restored = 0;

        foreach ($this->childlessParents(table: 'article', childTable: 'article_equivalence', childColumn: 'article_id') as $articleId) {
            $payload = $this->lostChildrenOf(aggregateId: $articleId, eventNames: self::ARTICLE_EVENTS, key: 'equivalences', label: 'article', output: $output);

            if (null === $payload) {
                continue;
            }

            $output->writeln(messages: sprintf(
                '  article %s: %d equivalence(s) [%s]',
                $articleId,
                count($payload['equivalences']),
                implode(', ', array_map(
                    callback: static fn (array $line): string => sprintf('%s=%s', $line['unit'], $line['quantity']),
                    array: $payload['equivalences'],
                )),
            ));
            ++$restored;

            if (!$force) {
                continue;
            }

            $this->insertEquivalences(articleId: $articleId, payload: $payload);
        }

        return $restored;
    }

    private function restoreIngredients(bool $force, OutputInterface $output): int
    {
        $restored = 0;

        foreach ($this->childlessParents(table: 'recipe', childTable: 'recipe_ingredient', childColumn: 'recipe_id') as $recipeId) {
            $payload = $this->lostChildrenOf(aggregateId: $recipeId, eventNames: self::RECIPE_EVENTS, key: 'ingredients', label: 'recipe', output: $output);

            if (null === $payload) {
                continue;
            }

            $output->writeln(messages: sprintf('  recipe %s: %d ingredient(s)', $recipeId, count($payload['ingredients'])));
            ++$restored;

            if (!$force) {
                continue;
            }

            $this->insertIngredients(recipeId: $recipeId, payload: $payload);
        }

        return $restored;
    }

    private function restoreSteps(bool $force, OutputInterface $output): int
    {
        $restored = 0;

        foreach ($this->childlessParents(table: 'recipe', childTable: 'recipe_step', childColumn: 'recipe_id') as $recipeId) {
            $payload = $this->lostChildrenOf(aggregateId: $recipeId, eventNames: self::RECIPE_EVENTS, key: 'steps', label: 'recipe', output: $output);

            if (null === $payload) {
                continue;
            }

            $output->writeln(messages: sprintf('  recipe %s: %d step(s)', $recipeId, count($payload['steps'])));
            ++$restored;

            if (!$force) {
                continue;
            }

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
     * @return array<string, mixed>|null the last written state, when it still carried children that are gone now
     */
    private function lostChildrenOf(string $aggregateId, array $eventNames, string $key, string $label, OutputInterface $output): ?array
    {
        $payload = $this->lastWrittenState(aggregateId: $aggregateId, eventNames: $eventNames);

        if (null === $payload) {
            return null;
        }

        if (!empty($payload[$key])) {
            return $payload;
        }

        if (!$this->everCarried(aggregateId: $aggregateId, eventNames: $eventNames, key: $key)) {
            return null;
        }

        $output->writeln(messages: sprintf(
            '  <comment>%s %s: skipped, its last write already carried no %s</comment>',
            $label,
            $aggregateId,
            $key,
        ));
        ++$this->ambiguous;

        return null;
    }

    /**
     * @param string[] $eventNames
     *
     * @return array<string, mixed>|null
     */
    private function lastWrittenState(string $aggregateId, array $eventNames): ?array
    {
        $row = $this->writerTenantConnection->fetchOne(
            query: sprintf(
                'SELECT payload FROM domain_event_log WHERE aggregate_id = ? AND event_name IN (%s) ORDER BY occurred_on DESC, recorded_at DESC LIMIT 1',
                $this->placeholdersFor(eventNames: $eventNames),
            ),
            params: [$aggregateId, ...$eventNames],
        );

        $payload = json_decode(json: (string) $row, associative: true);

        return is_array($payload) ? $payload : null;
    }

    /**
     * @param string[] $eventNames
     */
    private function everCarried(string $aggregateId, array $eventNames, string $key): bool
    {
        $rows = $this->writerTenantConnection->fetchFirstColumn(
            query: sprintf(
                'SELECT payload FROM domain_event_log WHERE aggregate_id = ? AND event_name IN (%s)',
                $this->placeholdersFor(eventNames: $eventNames),
            ),
            params: [$aggregateId, ...$eventNames],
        );

        foreach ($rows as $row) {
            $payload = json_decode(json: (string) $row, associative: true);

            if (is_array($payload) && !empty($payload[$key])) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param string[] $eventNames
     */
    private function placeholdersFor(array $eventNames): string
    {
        return implode(',', array_fill(start_index: 0, count: count($eventNames), value: '?'));
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

        foreach ($payload['steps'] as $index => $step) {
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
