<?php

namespace Shared\Shared\Shared\Infrastructure\Application\Middleware;

use Shared\Shared\DomainEventLog\Domain\Model\DomainEventLog;
use Shared\Shared\DomainEventLog\Domain\Model\DomainEventLogRepository;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\Middleware\MiddlewareInterface;
use Symfony\Component\Messenger\Middleware\StackInterface;

final readonly class DomainEventMiddleware implements MiddlewareInterface
{
    public function __construct(
        private DomainEventCollectorService $domainEventCollector,
        private DomainEventLogRepository $domainEventLogRepository,
        private DateTimeGenerator $dateTimeGenerator,
        private array $subscribers,
    ) {
    }

    public function handle(Envelope $envelope, StackInterface $stack): Envelope
    {
        $envelope = $stack->next()->handle(envelope: $envelope, stack: $stack);

        $events = $this->domainEventCollector->pullEvents();
        foreach ($events as $event) {
            $this->logEvent(event: $event);

            $eventName = $event->getName();
            if (!isset($this->subscribers[$eventName])) {
                continue;
            }

            foreach ($this->subscribers[$eventName] as $subscriber) {
                $subscriber($event);
            }
        }

        return $envelope;
    }

    private function logEvent(DomainEvent $event): void
    {
        $domainEventLog = new DomainEventLog(
            id: $this->domainEventLogRepository->nextId(),
            eventName: $event->getName(),
            aggregateId: $event->aggregateId,
            payload: json_encode(value: $this->extractPayload(event: $event)),
            occurredOn: $event->occurredOn,
            recordedAt: $this->dateTimeGenerator->now(),
        );

        $this->domainEventLogRepository->save(domainEventLog: $domainEventLog);
    }

    private function extractPayload(DomainEvent $event): array
    {
        $reflection = new \ReflectionClass(objectOrClass: $event);
        $payload = [];

        foreach ($reflection->getProperties() as $property) {
            $value = $property->getValue(object: $event);

            if ($value instanceof \DateTime) {
                $value = $value->format(format: \DateTime::ATOM);
            }

            $payload[$property->getName()] = $value;
        }

        return $payload;
    }
}
