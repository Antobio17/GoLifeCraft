<?php

namespace App\Tests\Authorization\User\User\Application\Command;

use Authorization\User\User\Application\Command\ChangeMyVisualPreference\ChangeMyVisualPreferenceCommand;
use Authorization\User\User\Application\Command\ChangeMyVisualPreference\ChangeMyVisualPreferenceCommandHandler;
use Authorization\User\User\Domain\Exception\ChangeMyVisualPreferenceException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class ChangeMyVisualPreferenceCommandHandlerTest extends TestCase
{
    private InMemoryUserRepository $repository;
    private ChangeMyVisualPreferenceCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryUserRepository();
        $this->handler = new ChangeMyVisualPreferenceCommandHandler(
            userRepository: $this->repository,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );
    }

    private function buildUser(string $id): User
    {
        return new User(
            id: $id,
            username: 'john.doe',
            tenantId: 'tenant-1',
            email: 'john@example.com',
            name: 'John',
            lastname: 'Doe',
            password: 'hashed',
            role: User::ROLE_USER,
            isActive: true,
            createdAt: new \DateTime(),
            updatedAt: new \DateTime(),
            createdByUserId: $id,
            updatedByUserId: $id,
        );
    }

    public function testItDefaultsEverySurfaceToImages(): void
    {
        $user = $this->buildUser(id: 'user-1');

        self::assertSame(
            array_fill_keys(keys: User::VISUAL_SURFACES, value: User::VISUAL_MODE_IMAGE),
            $user->resolvedVisualPreferences(),
        );
    }

    public function testItChangesOneSurfaceAndLeavesTheRestOnImages(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1'));

        ($this->handler)(new ChangeMyVisualPreferenceCommand(
            userSessionId: 'user-1',
            surface: 'diary',
            mode: User::VISUAL_MODE_ICON,
        ));

        $preferences = $this->repository->findById(id: 'user-1')?->resolvedVisualPreferences();

        self::assertSame(User::VISUAL_MODE_ICON, $preferences['diary']);
        self::assertSame(User::VISUAL_MODE_IMAGE, $preferences['menu']);
    }

    public function testItRejectsAnUnknownSurface(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1'));

        $this->expectException(ChangeMyVisualPreferenceException::class);

        ($this->handler)(new ChangeMyVisualPreferenceCommand(
            userSessionId: 'user-1',
            surface: 'unknown',
            mode: User::VISUAL_MODE_ICON,
        ));
    }

    public function testItRejectsAnUnknownMode(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1'));

        $this->expectException(ChangeMyVisualPreferenceException::class);

        ($this->handler)(new ChangeMyVisualPreferenceCommand(
            userSessionId: 'user-1',
            surface: 'diary',
            mode: 'sticker',
        ));
    }

    public function testItFailsWhenTheUserDoesNotExist(): void
    {
        $this->expectException(ChangeMyVisualPreferenceException::class);

        ($this->handler)(new ChangeMyVisualPreferenceCommand(
            userSessionId: 'missing',
            surface: 'diary',
            mode: User::VISUAL_MODE_ICON,
        ));
    }
}
