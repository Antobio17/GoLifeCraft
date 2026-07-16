<?php

namespace App\Tests\Authorization\User\PasswordResetToken\Application\Command;

use Authorization\User\PasswordResetToken\Application\Command\RequestPasswordReset\RequestPasswordResetCommand;
use Authorization\User\PasswordResetToken\Application\Command\RequestPasswordReset\RequestPasswordResetCommandHandler;
use Authorization\User\PasswordResetToken\Domain\QueryModel\Dto\FindUserResult;
use Authorization\User\PasswordResetToken\Domain\Service\SendPasswordResetEmail;
use Authorization\User\PasswordResetToken\Infrastructure\Domain\Model\InMemory\InMemoryPasswordResetTokenRepository;
use Authorization\User\PasswordResetToken\Infrastructure\Domain\QueryModel\InMemory\InMemoryRequestPasswordResetNeedleDataQuery;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class RequestPasswordResetCommandHandlerTest extends TestCase
{
    private InMemoryPasswordResetTokenRepository $repository;
    private InMemoryRequestPasswordResetNeedleDataQuery $needleDataQuery;
    private object $sendPasswordResetEmail;
    private RequestPasswordResetCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryPasswordResetTokenRepository();
        $this->needleDataQuery = new InMemoryRequestPasswordResetNeedleDataQuery();
        $this->sendPasswordResetEmail = new class implements SendPasswordResetEmail {
            public int $calls = 0;

            public function send(string $email, string $name, string $languageCode, string $rawToken, \DateTime $requestedAt): void
            {
                ++$this->calls;
            }
        };

        $this->handler = new RequestPasswordResetCommandHandler(
            repository: $this->repository,
            needleDataQuery: $this->needleDataQuery,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
            sendPasswordResetEmail: $this->sendPasswordResetEmail,
            ttlMinutes: 60,
        );
    }

    public function testItSendsEmailWhenUserExists(): void
    {
        $this->needleDataQuery->add(new FindUserResult(
            id: 'user-1',
            username: 'jane@example.com',
            email: 'jane@example.com',
            name: 'Jane',
        ));

        ($this->handler)(new RequestPasswordResetCommand(username: 'jane@example.com'));

        $this->assertSame(expected: 1, actual: $this->sendPasswordResetEmail->calls);
    }

    public function testItSilentlyReturnsWhenUserDoesNotExist(): void
    {
        ($this->handler)(new RequestPasswordResetCommand(username: 'ghost@example.com'));

        $this->assertSame(expected: 0, actual: $this->sendPasswordResetEmail->calls);
    }
}
