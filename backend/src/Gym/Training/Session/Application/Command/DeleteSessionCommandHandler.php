<?php

namespace Gym\Training\Session\Application\Command;

use Gym\Training\Session\Domain\Exception\DeleteSessionException;
use Gym\Training\Session\Domain\Model\SessionRepository;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final readonly class DeleteSessionCommandHandler
{
    public function __construct(
        private SessionRepository $sessionRepository,
        private DomainEventCollectorService $domainEventCollectorService,
        private DateTimeGenerator $dateTimeGenerator,
    ) {
    }

    public function __invoke(DeleteSessionCommand $command): void
    {
        $session = $this->sessionRepository->findById(id: $command->sessionId);
        if (null === $session) {
            throw DeleteSessionException::sessionNotFound(sessionId: $command->sessionId);
        }

        $session->delete(
            deletedByUserId: $command->deletedByUserId,
            dateTimeGenerator: $this->dateTimeGenerator,
        );

        $this->sessionRepository->delete(session: $session);
        $this->domainEventCollectorService->register(aggregate: $session);
    }
}
