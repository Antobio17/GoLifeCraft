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
    private DomainEventCollectorService $domainEventCollectorService;
    private ChangeMyVisualPreferenceCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryUserRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new ChangeMyVisualPreferenceCommandHandler(
            userRepository: $this->repository,
            domainEventCollectorService: $this->domainEventCollectorService,
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
            surfaces: ['diary'],
            mode: User::VISUAL_MODE_ICON,
        ));

        $preferences = $this->repository->findById(id: 'user-1')?->resolvedVisualPreferences();

        self::assertSame(User::VISUAL_MODE_ICON, $preferences['diary']);
        self::assertSame(User::VISUAL_MODE_IMAGE, $preferences['menu']);
    }

    public function testItChangesEverySurfaceInOneGo(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1'));

        ($this->handler)(new ChangeMyVisualPreferenceCommand(
            userSessionId: 'user-1',
            surfaces: User::VISUAL_SURFACES,
            mode: User::VISUAL_MODE_ICON,
        ));

        self::assertSame(
            array_fill_keys(keys: User::VISUAL_SURFACES, value: User::VISUAL_MODE_ICON),
            $this->repository->findById(id: 'user-1')?->resolvedVisualPreferences(),
        );
    }

    public function testItRecordsASingleEventForTheWholeBatch(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1'));

        ($this->handler)(new ChangeMyVisualPreferenceCommand(
            userSessionId: 'user-1',
            surfaces: ['diary', 'menu'],
            mode: User::VISUAL_MODE_ICON,
        ));

        $events = $this->domainEventCollectorService->pullEvents();

        self::assertCount(1, $events);
        self::assertSame(['diary', 'menu'], $events[0]->surfaces);
        self::assertSame(User::VISUAL_MODE_ICON, $events[0]->visualPreferences['menu']);
    }

    public function testItRejectsAnUnknownSurface(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1'));

        $this->expectException(ChangeMyVisualPreferenceException::class);

        ($this->handler)(new ChangeMyVisualPreferenceCommand(
            userSessionId: 'user-1',
            surfaces: ['diary', 'unknown'],
            mode: User::VISUAL_MODE_ICON,
        ));
    }

    public function testItRejectsAnEmptySurfaceList(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1'));

        $this->expectException(ChangeMyVisualPreferenceException::class);

        ($this->handler)(new ChangeMyVisualPreferenceCommand(
            userSessionId: 'user-1',
            surfaces: [],
            mode: User::VISUAL_MODE_ICON,
        ));
    }

    public function testItRejectsAnUnknownMode(): void
    {
        $this->repository->save(user: $this->buildUser(id: 'user-1'));

        $this->expectException(ChangeMyVisualPreferenceException::class);

        ($this->handler)(new ChangeMyVisualPreferenceCommand(
            userSessionId: 'user-1',
            surfaces: ['diary'],
            mode: 'sticker',
        ));
    }

    public function testItFailsWhenTheUserDoesNotExist(): void
    {
        $this->expectException(ChangeMyVisualPreferenceException::class);

        ($this->handler)(new ChangeMyVisualPreferenceCommand(
            userSessionId: 'missing',
            surfaces: ['diary'],
            mode: User::VISUAL_MODE_ICON,
        ));
    }
}
