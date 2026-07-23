<?php

namespace Nutrition\GlobalCatalog\Article\Application\Command;

use Nutrition\GlobalCatalog\Article\Domain\Exception\UpsertGlobalArticleException;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticle;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleRepository;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpsertGlobalArticleCommandHandler
{
    public function __construct(
        private GlobalArticleRepository $globalArticleRepository,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpsertGlobalArticleCommand $command): void
    {
        $globalArticle = $this->globalArticleRepository->findByBarcode(barcode: $command->barcode);

        if (null === $globalArticle && null === $command->nutrition) {
            throw UpsertGlobalArticleException::nutritionRequired(barcode: $command->barcode);
        }

        if (null === $globalArticle) {
            $globalArticle = GlobalArticle::create(
                id: $this->globalArticleRepository->nextId(),
                barcode: $command->barcode,
                name: $command->name,
                brand: $command->brand,
                categoryName: $command->categoryName,
                imageUrl: $command->imageUrl,
                quantity: $command->quantity,
                stores: $command->stores,
                pricing: $command->pricing,
                source: $command->source,
                nutrition: $command->nutrition,
                dateTimeGenerator: $this->dateTimeGenerator,
            );

            $this->globalArticleRepository->save(globalArticle: $globalArticle);

            return;
        }

        $globalArticle->apply(
            name: $command->name,
            brand: $command->brand,
            categoryName: $command->categoryName,
            imageUrl: $command->imageUrl,
            quantity: $command->quantity,
            stores: $command->stores,
            pricing: $command->pricing->isEmpty() ? $globalArticle->pricing() : $command->pricing,
            nutrition: $command->nutrition ?? $globalArticle->nutrition(),
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->globalArticleRepository->save(globalArticle: $globalArticle);
    }
}
