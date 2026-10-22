<?php

namespace Nutrition\GlobalCatalog\Article\Application\Command;

use Authorization\User\User\Domain\Model\User;
use Nutrition\GlobalCatalog\Article\Domain\Exception\UpdateGlobalArticleAccessException;
use Nutrition\GlobalCatalog\Article\Domain\Exception\UpdateGlobalArticleException;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleNutrition;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticlePricing;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateGlobalArticleCommandHandler
{
    public function __construct(
        private GlobalArticleRepository $globalArticleRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateGlobalArticleCommand $command): void
    {
        if (User::ROLE_GOD !== $command->userRole) {
            throw UpdateGlobalArticleAccessException::forbidden(userRole: $command->userRole);
        }

        $globalArticle = $this->globalArticleRepository->findById(id: $command->globalArticleId);

        if (null === $globalArticle) {
            throw UpdateGlobalArticleException::notFound(globalArticleId: $command->globalArticleId);
        }

        $globalArticle->correct(
            name: $command->name,
            brand: $command->brand,
            categoryName: $command->categoryName,
            quantity: $command->quantity,
            pricing: new GlobalArticlePricing(
                price: $command->price,
                bulkPrice: $globalArticle->bulkPrice,
                referencePrice: $command->referencePrice,
                referenceFormat: $command->referenceFormat,
                previousPrice: $command->previousPrice,
            ),
            nutrition: new GlobalArticleNutrition(
                referenceAmount: $globalArticle->referenceAmount,
                calories: $command->calories,
                protein: $command->protein,
                carbs: $command->carbs,
                sugars: $command->sugars,
                fat: $command->fat,
                saturatedFat: $command->saturatedFat,
                fiber: $command->fiber,
                salt: $command->salt,
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->globalArticleRepository->save(globalArticle: $globalArticle);
        $this->domainEventCollectorService->register(aggregate: $globalArticle);
    }
}
