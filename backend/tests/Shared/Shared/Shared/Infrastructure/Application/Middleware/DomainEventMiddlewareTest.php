<?php

namespace App\Tests\Shared\Shared\Shared\Infrastructure\Application\Middleware;

use PHPUnit\Framework\TestCase;
use Shared\Shared\DomainEventLog\Domain\Model\DomainEventLog;
use Shared\Shared\DomainEventLog\Domain\Model\DomainEventLogRepository;
use Shared\Shared\Shared\Application\Manager\TransactionManager;
use Shared\Shared\Shared\Domain\Event\DomainEvent;
use Shared\Shared\Shared\Domain\Model\Aggregate;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Shared\Shared\Infrastructure\Application\Middleware\DomainEventMiddleware;
use Shared\Tenant\Tenant\Domain\Service\TenantContext;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\Middleware\MiddlewareInterface;
use Symfony\Component\Messenger\Middleware\StackInterface;

final class DomainEventMiddlewareTest extends TestCase
{
    private DomainEventMiddlewareTestTrace $trace;
    private DomainEventCollectorService $domainEventCollector;

    protected function setUp(): void
    {
        $this->trace = new DomainEventMiddlewareTestTrace();
        $this->domainEventCollector = new DomainEventCollectorService();
    }

    public function testItFlushesPendingChangesBeforeNotifyingSubscribers(): void
    {
        $event = new DomainEventMiddlewareTestEvent(aggregateId: 'aggregate-1', occurredOn: new \DateTime());
        $this->registerAggregate(event: $event);

        $middleware = $this->middleware(subscribers: [
            $event->getName() => [fn (DomainEvent $notified): null => $this->trace->record(step: 'subscriber')],
        ]);

        $middleware->handle(envelope: new Envelope(message: new \stdClass()), stack: $this->stack());

        $this->assertSame(expected: ['log', 'flushChanges', 'subscriber'], actual: $this->trace->steps);
    }

    public function testItDoesNotFlushWhenTheHandlerRecordedNoEvents(): void
    {
        $middleware = $this->middleware(subscribers: []);

        $middleware->handle(envelope: new Envelope(message: new \stdClass()), stack: $this->stack());

        $this->assertSame(expected: [], actual: $this->trace->steps);
    }

    /**
     * @param array<string, array<int, callable>> $subscribers
     */
    private function middleware(array $subscribers): DomainEventMiddleware
    {
        return new DomainEventMiddleware(
            domainEventCollector: $this->domainEventCollector,
            domainEventLogRepository: new DomainEventMiddlewareTestLogRepository(trace: $this->trace),
            transactionManager: new DomainEventMiddlewareTestTransactionManager(trace: $this->trace),
            dateTimeGenerator: new DateTimeGenerator(),
            tenantContext: new DomainEventMiddlewareTestTenantContext(),
            subscribers: $subscribers,
        );
    }

    private function registerAggregate(DomainEvent $event): void
    {
        $aggregate = new DomainEventMiddlewareTestAggregate();
        $aggregate->record(event: $event);

        $this->domainEventCollector->register(aggregate: $aggregate);
    }

    private function stack(): StackInterface
    {
        $middleware = new class implements MiddlewareInterface {
            public function handle(Envelope $envelope, StackInterface $stack): Envelope
            {
                return $envelope;
            }
        };

        return new class($middleware) implements StackInterface {
            public function __construct(private readonly MiddlewareInterface $middleware)
            {
            }

            public function next(): MiddlewareInterface
            {
                return $this->middleware;
            }
        };
    }
}

final class DomainEventMiddlewareTestTrace
{
    /** @var array<int, string> */
    public array $steps = [];

    public function record(string $step): null
    {
        $this->steps[] = $step;

        return null;
    }
}

final class DomainEventMiddlewareTestAggregate extends Aggregate
{
}

final readonly class DomainEventMiddlewareTestEvent extends DomainEvent
{
    public function getName(): string
    {
        return 'golifecraft.shared.event.1.test.recorded';
    }
}

final readonly class DomainEventMiddlewareTestTransactionManager implements TransactionManager
{
    public function __construct(private DomainEventMiddlewareTestTrace $trace)
    {
    }

    public function isTransactionActive(): bool
    {
        return true;
    }

    public function beginTransaction(): void
    {
    }

    public function flushChanges(): void
    {
        $this->trace->record(step: 'flushChanges');
    }

    public function flush(): void
    {
        $this->trace->record(step: 'flush');
    }

    public function rollback(): void
    {
    }
}

final readonly class DomainEventMiddlewareTestLogRepository implements DomainEventLogRepository
{
    public function __construct(private DomainEventMiddlewareTestTrace $trace)
    {
    }

    public function nextId(): string
    {
        return 'log-1';
    }

    public function save(DomainEventLog $domainEventLog): void
    {
        $this->trace->record(step: 'log');
    }
}

final readonly class DomainEventMiddlewareTestTenantContext implements TenantContext
{
    public function set(string $tenantId): void
    {
    }

    public function get(): ?string
    {
        return 'tenant-1';
    }

    public function isResolved(): bool
    {
        return true;
    }
}
