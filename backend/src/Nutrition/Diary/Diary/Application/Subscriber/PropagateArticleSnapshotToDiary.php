<?php

namespace Nutrition\Diary\Diary\Application\Subscriber;

use Integration\Mcp\Server\Domain\Event\ModelWritten;
use Nutrition\Catalog\Article\Domain\Event\ArticleDeleted;
use Nutrition\Catalog\Article\Domain\Event\ArticleUpdated;
use Nutrition\Diary\Diary\Application\Command\ApplyDiaryEntrySnapshotCommand;
use Nutrition\Diary\Diary\Domain\QueryModel\FindArticleDiaryReactionNeedleDataQuery;
use Nutrition\Recipe\Recipe\Domain\QueryModel\Dto\MacroBreakdown;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Event\DomainEventSubscriber;
use Symfony\Component\Messenger\MessageBusInterface;

final readonly class PropagateArticleSnapshotToDiary implements DomainEventSubscriber
{
    private const string ALIAS_ARTICLE = 'article';
    private const string ALIAS_NUTRITION_FACTS = 'nutrition_facts';
    private const string DEFAULT_EMOJI = '🍽️';
    private const string DELETED_NAME = '(eliminado)';

    public function __construct(
        private MessageBusInterface $messageBus,
        private FindArticleDiaryReactionNeedleDataQuery $needle,
    ) {
    }

    public function __invoke(DomainEvent $event): void
    {
        if ($event instanceof ArticleUpdated) {
            $this->propagate(
                articleId: $event->aggregateId,
                name: $event->name,
                emoji: $event->emoji ?? self::DEFAULT_EMOJI,
                referenceAmount: $event->referenceAmount,
                raw: $this->macros(calories: $event->calories, protein: $event->protein, fat: $event->fat, carbs: $event->carbs),
            );

            return;
        }

        if ($event instanceof ArticleDeleted) {
            $this->propagate(
                articleId: $event->aggregateId,
                name: self::DELETED_NAME,
                emoji: self::DEFAULT_EMOJI,
                referenceAmount: 1.0,
                raw: MacroBreakdown::zero(),
            );

            return;
        }

        if ($event instanceof ModelWritten) {
            $this->handleModelWritten(event: $event);
        }
    }

    private function handleModelWritten(ModelWritten $event): void
    {
        if (self::ALIAS_ARTICLE === $event->entityAlias) {
            $nutrition = $this->needle->articleNutrition(articleId: $event->aggregateId);
            $this->propagate(
                articleId: $event->aggregateId,
                name: (string) ($event->entitySnapshot['name'] ?? ''),
                emoji: (string) ($event->entitySnapshot['emoji'] ?? self::DEFAULT_EMOJI),
                referenceAmount: (float) ($nutrition['referenceAmount'] ?? 1.0),
                raw: $this->macros(
                    calories: $nutrition['calories'] ?? 0.0,
                    protein: $nutrition['protein'] ?? 0.0,
                    fat: $nutrition['fat'] ?? 0.0,
                    carbs: $nutrition['carbs'] ?? 0.0,
                ),
            );

            return;
        }

        if (self::ALIAS_NUTRITION_FACTS !== $event->entityAlias) {
            return;
        }

        $article = $this->needle->articleIdentityByNutritionFacts(nutritionFactsId: $event->aggregateId);
        if (null === $article) {
            return;
        }

        $this->propagate(
            articleId: $article['id'],
            name: $article['name'],
            emoji: $article['emoji'],
            referenceAmount: (float) ($event->entitySnapshot['referenceAmount'] ?? 1.0),
            raw: $this->macros(
                calories: $event->entitySnapshot['calories'] ?? 0.0,
                protein: $event->entitySnapshot['protein'] ?? 0.0,
                fat: $event->entitySnapshot['fat'] ?? 0.0,
                carbs: $event->entitySnapshot['carbs'] ?? 0.0,
            ),
        );
    }

    private function propagate(string $articleId, string $name, string $emoji, float $referenceAmount, MacroBreakdown $raw): void
    {
        $perUnit = $referenceAmount > 0 ? $raw->scale(factor: 1 / $referenceAmount) : MacroBreakdown::zero();

        foreach ($this->needle->todayProductEntries(articleId: $articleId) as $entry) {
            $macros = $perUnit->scale(factor: $entry['quantity']);

            $this->messageBus->dispatch(new ApplyDiaryEntrySnapshotCommand(
                diaryEntryId: $entry['id'],
                name: $name,
                emoji: $emoji,
                calories: $macros->calories,
                protein: $macros->protein,
                fat: $macros->fat,
                carbs: $macros->carbs,
            ));
        }
    }

    private function macros(?float $calories, ?float $protein, ?float $fat, ?float $carbs): MacroBreakdown
    {
        return new MacroBreakdown(
            calories: (float) $calories,
            protein: (float) $protein,
            fat: (float) $fat,
            carbs: (float) $carbs,
        );
    }
}
