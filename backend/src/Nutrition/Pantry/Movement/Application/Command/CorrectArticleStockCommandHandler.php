<?php

namespace Nutrition\Pantry\Movement\Application\Command;

use Nutrition\Pantry\Movement\Domain\Exception\CorrectArticleStockException;
use Nutrition\Pantry\Movement\Domain\Model\StockCorrection;
use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Model\StockMovementRepository;
use Nutrition\Pantry\Movement\Domain\QueryModel\CorrectArticleStockNeedleDataQuery;
use Nutrition\Pantry\Movement\Domain\Service\StockMovementUnitConverter;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class CorrectArticleStockCommandHandler
{
    public function __construct(
        private StockMovementRepository $stockMovementRepository,
        private CorrectArticleStockNeedleDataQuery $needleDataQuery,
        private StockMovementUnitConverter $unitConverter,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(CorrectArticleStockCommand $command): void
    {
        $reference = $this->needleDataQuery->findArticleReference(articleId: $command->articleId);

        if (null === $reference) {
            throw CorrectArticleStockException::articleNotFound(articleId: $command->articleId);
        }

        $correction = StockCorrection::fromKind(
            kind: $command->kind,
            quantity: $command->quantity,
            unit: $command->unit,
            level: $command->level,
        );

        $declaredQuantity = $correction->declaredQuantity(reference: $reference);
        $declaredUnit = $correction->declaredUnit(reference: $reference);

        $movementId = $this->stockMovementRepository->nextId();

        $movement = StockMovement::register(
            id: $movementId,
            kind: StockMovement::KIND_ARTICLE,
            refId: $command->articleId,
            type: StockMovement::TYPE_COUNT,
            effectiveAt: $this->effectiveAt(command: $command),
            quantity: $this->unitConverter->toBaseUnits(
                articleId: $command->articleId,
                quantity: $declaredQuantity,
                unit: $declaredUnit,
            ),
            originalQuantity: $declaredQuantity,
            originalUnit: $declaredUnit,
            sourceKind: StockMovement::SOURCE_MANUAL,
            sourceId: $movementId,
            confidence: $correction->confidence,
            registeredByUserId: $command->correctedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->stockMovementRepository->save(stockMovement: $movement);
        $this->domainEventCollectorService->register(aggregate: $movement);
    }

    private function effectiveAt(CorrectArticleStockCommand $command): \DateTime
    {
        if (null === $command->effectiveAt || '' === $command->effectiveAt) {
            return $this->dateTimeGenerator->now();
        }

        return new \DateTime(datetime: StockMovement::countMomentOf(
            countedOn: $command->effectiveAt,
            closesTheDay: true,
        ));
    }
}
