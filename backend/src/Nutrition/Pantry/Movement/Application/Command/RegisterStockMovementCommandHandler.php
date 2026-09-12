<?php

namespace Nutrition\Pantry\Movement\Application\Command;

use Nutrition\Pantry\Movement\Domain\Model\StockMovement;
use Nutrition\Pantry\Movement\Domain\Model\StockMovementRepository;
use Nutrition\Pantry\Movement\Domain\QueryModel\RegisterStockMovementNeedleDataQuery;
use Nutrition\Pantry\Movement\Domain\Service\StockMovementUnitConverter;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class RegisterStockMovementCommandHandler
{
    public function __construct(
        private StockMovementRepository $stockMovementRepository,
        private RegisterStockMovementNeedleDataQuery $needleDataQuery,
        private StockMovementUnitConverter $unitConverter,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(RegisterStockMovementCommand $command): void
    {
        if ([] === $command->entries) {
            return;
        }

        if (!$this->needleDataQuery->referenceExists(kind: $command->kind, refId: $command->refId)) {
            return;
        }

        $quantity = $this->inBaseUnits(command: $command);
        $effectiveAt = new \DateTime(datetime: $command->effectiveAt);

        $movement = $this->stockMovementRepository->findBySource(
            kind: $command->kind,
            refId: $command->refId,
            sourceKind: $command->sourceKind,
            sourceId: $command->sourceId,
        );

        if (null === $movement) {
            $movement = StockMovement::register(
                id: $this->stockMovementRepository->nextId(),
                kind: $command->kind,
                refId: $command->refId,
                type: $command->type,
                effectiveAt: $effectiveAt,
                quantity: $quantity,
                originalQuantity: $this->declaredQuantity(command: $command),
                originalUnit: $this->declaredUnit(command: $command),
                sourceKind: $command->sourceKind,
                sourceId: $command->sourceId,
                registeredByUserId: $command->registeredByUserId,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->stockMovementRepository->save(stockMovement: $movement);
            $this->domainEventCollectorService->register(aggregate: $movement);

            return;
        }

        $movement->restate(
            effectiveAt: $effectiveAt,
            quantity: $quantity,
            originalQuantity: $this->declaredQuantity(command: $command),
            originalUnit: $this->declaredUnit(command: $command),
            updatedByUserId: $command->registeredByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->stockMovementRepository->save(stockMovement: $movement);
        $this->domainEventCollectorService->register(aggregate: $movement);
    }

    private function inBaseUnits(RegisterStockMovementCommand $command): float
    {
        $total = 0.0;

        foreach ($command->entries as $entry) {
            $total += $this->entryInBaseUnits(
                kind: $command->kind,
                refId: $command->refId,
                quantity: (float) $entry['quantity'],
                unit: $entry['unit'] ?? null,
            );
        }

        return $total;
    }

    private function entryInBaseUnits(string $kind, string $refId, float $quantity, ?string $unit): float
    {
        if (StockMovement::KIND_ARTICLE !== $kind) {
            return $quantity;
        }

        return $this->unitConverter->toBaseUnits(articleId: $refId, quantity: $quantity, unit: $unit);
    }

    private function declaredQuantity(RegisterStockMovementCommand $command): float
    {
        return array_sum(array: array_map(
            callback: static fn (array $entry): float => (float) $entry['quantity'],
            array: $command->entries,
        ));
    }

    private function declaredUnit(RegisterStockMovementCommand $command): ?string
    {
        $units = array_unique(array: array_map(
            callback: static fn (array $entry): ?string => $entry['unit'] ?? null,
            array: $command->entries,
        ));

        return 1 === count($units) ? reset($units) : null;
    }
}
