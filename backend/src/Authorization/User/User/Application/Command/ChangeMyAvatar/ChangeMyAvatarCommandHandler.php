<?php

namespace Authorization\User\User\Application\Command\ChangeMyAvatar;

use Authorization\User\User\Domain\Exception\ChangeMyAvatarException;
use Authorization\User\User\Domain\Model\UserRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Shared\Tool\Tool\Domain\Service\ImageStorageService;

final readonly class ChangeMyAvatarCommandHandler
{
    private const string IMAGE_AGGREGATE = 'user';

    public function __construct(
        private UserRepository $userRepository,
        private ImageStorageService $imageStorageService,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(ChangeMyAvatarCommand $command): void
    {
        $user = $this->userRepository->findById(id: $command->userSessionId);

        if (null === $user) {
            throw ChangeMyAvatarException::notFound(userId: $command->userSessionId);
        }

        $this->imageStorageService->deleteAggregateImage(
            aggregate: self::IMAGE_AGGREGATE,
            aggregateId: $user->id,
            image: $user->avatar,
        );

        $user->changeAvatar(
            avatar: null === $command->imagePath ? null : $this->imageStorageService->storeAggregateImage(
                aggregate: self::IMAGE_AGGREGATE,
                aggregateId: $user->id,
                imagePath: $command->imagePath,
            ),
            updatedByUserId: $command->userSessionId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->userRepository->save(user: $user);
        $this->domainEventCollectorService->register(aggregate: $user);
    }
}
