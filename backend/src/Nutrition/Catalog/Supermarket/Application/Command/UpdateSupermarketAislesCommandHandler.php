<?php

namespace Nutrition\Catalog\Supermarket\Application\Command;

use Nutrition\Catalog\Supermarket\Domain\Exception\UpdateSupermarketAislesException;
use Nutrition\Catalog\Supermarket\Domain\Model\SupermarketRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateSupermarketAislesCommandHandler
{
    public function __construct(
        private SupermarketRepository $supermarketRepository,
        private SupermarketAisleAssembler $aisleAssembler,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateSupermarketAislesCommand $command): void
    {
        $supermarket = $this->supermarketRepository->findById(id: $command->supermarketId);
        if (null === $supermarket) {
            throw UpdateSupermarketAislesException::supermarketNotFound(supermarketId: $command->supermarketId);
        }

        $supermarket->updateAisles(
            aisles: $this->aisleAssembler->assemble(
                supermarket: $supermarket,
                aisles: $command->aisles,
                userId: $command->updatedByUserId,
            ),
            updatedByUserId: $command->updatedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->supermarketRepository->save(supermarket: $supermarket);
        $this->domainEventCollectorService->register(aggregate: $supermarket);
    }
}
