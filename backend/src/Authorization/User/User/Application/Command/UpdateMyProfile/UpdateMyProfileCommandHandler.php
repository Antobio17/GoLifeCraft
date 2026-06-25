<?php

namespace Authorization\User\User\Application\Command\UpdateMyProfile;

use Authorization\User\User\Domain\Exception\UpdateMyProfileException;
use Authorization\User\User\Domain\Model\UserRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class UpdateMyProfileCommandHandler
{
    public function __construct(
        private UserRepository $userRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(UpdateMyProfileCommand $command): void
    {
        $user = $this->userRepository->findById(id: $command->userSessionId);
        if (null === $user) {
            throw UpdateMyProfileException::notFound(userId: $command->userSessionId);
        }

        $user->updateProfile(
            name: $command->name,
            lastname: $command->lastname,
            email: $command->email,
            updatedByUserId: $command->userSessionId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->userRepository->save(user: $user);
        $this->domainEventCollectorService->register(aggregate: $user);
    }
}
