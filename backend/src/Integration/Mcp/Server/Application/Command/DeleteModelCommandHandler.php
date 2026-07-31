<?php

namespace Integration\Mcp\Server\Application\Command;

use Integration\Mcp\Server\Domain\Event\ModelDeleted;
use Integration\Mcp\Server\Domain\Exception\DeleteModelException;
use Integration\Mcp\Server\Domain\Exception\ModelNotExposedException;
use Integration\Mcp\Server\Domain\Model\GenericAggregate;
use Integration\Mcp\Server\Domain\Model\GenericModelRepository;
use Integration\Mcp\Server\Domain\QueryModel\Dto\CascadeDeleteDescriptor;
use Integration\Mcp\Server\Domain\QueryModel\Dto\ModelDescriptor;
use Integration\Mcp\Server\Domain\Service\GenericModelHydrator;
use Integration\Mcp\Server\Domain\Service\ModelMetadataProvider;
use Integration\Mcp\Server\Domain\Service\ModelPermissionChecker;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteModelCommandHandler
{
    public function __construct(
        private ModelMetadataProvider $metadataProvider,
        private ModelPermissionChecker $permissionChecker,
        private GenericModelHydrator $hydrator,
        private GenericModelRepository $repository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteModelCommand $command): void
    {
        $descriptor = $this->metadataProvider->describe(alias: $command->entityAlias);

        if (!$this->permissionChecker->canDelete(role: $command->role, descriptor: $descriptor)) {
            throw ModelNotExposedException::alias(alias: $command->entityAlias);
        }

        $entity = $this->repository->find(class: $descriptor->class, id: $command->id);

        if (null === $entity) {
            throw DeleteModelException::notFound(alias: $command->entityAlias, id: $command->id);
        }

        $entities = $this->collect(
            descriptor: $descriptor,
            entity: $entity,
            userSessionId: $command->userSessionId,
            now: $this->dateTimeGenerator->now(),
            rootId: $command->id,
        );

        $this->repository->deleteAll(entities: $entities);

        foreach ($entities as $deleted) {
            $this->domainEventCollectorService->register(aggregate: $deleted);
        }
    }

    /**
     * @return GenericAggregate[] children first, so the parent row always leaves last
     */
    private function collect(
        ModelDescriptor $descriptor,
        GenericAggregate $entity,
        string $userSessionId,
        \DateTime $now,
        string $rootId,
    ): array {
        $collected = [];

        foreach ($descriptor->cascadeDeletes as $cascade) {
            $childDescriptor = $this->metadataProvider->describe(alias: $cascade->resource);

            foreach ($this->childrenOf(cascade: $cascade, childDescriptor: $childDescriptor, entity: $entity) as $child) {
                $collected = array_merge($collected, $this->collect(
                    descriptor: $childDescriptor,
                    entity: $child,
                    userSessionId: $userSessionId,
                    now: $now,
                    rootId: $rootId,
                ));
            }
        }

        $entity->stampUpdate(userId: $userSessionId, now: $now);
        $entity->record(event: new ModelDeleted(
            aggregateId: $entity->id,
            occurredOn: $now,
            entityAlias: $descriptor->alias,
            rootId: $rootId,
            deletedByUserId: $userSessionId,
            entitySnapshot: $this->hydrator->snapshot(entity: $entity, descriptor: $descriptor),
        ));

        $collected[] = $entity;

        return $collected;
    }

    /**
     * @return GenericAggregate[]
     */
    private function childrenOf(
        CascadeDeleteDescriptor $cascade,
        ModelDescriptor $childDescriptor,
        GenericAggregate $entity,
    ): array {
        if (null !== $cascade->foreignField) {
            return $this->repository->findBy(
                class: $childDescriptor->class,
                field: $cascade->foreignField,
                value: $entity->id,
            );
        }

        $childId = $entity->{$cascade->localField} ?? null;

        if (null === $childId || '' === $childId) {
            return [];
        }

        $child = $this->repository->find(class: $childDescriptor->class, id: $childId);

        return null === $child ? [] : [$child];
    }
}
