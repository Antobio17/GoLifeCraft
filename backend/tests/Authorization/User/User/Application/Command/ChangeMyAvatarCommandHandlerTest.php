<?php

namespace App\Tests\Authorization\User\User\Application\Command;

use Authorization\User\User\Application\Command\ChangeMyAvatar\ChangeMyAvatarCommand;
use Authorization\User\User\Application\Command\ChangeMyAvatar\ChangeMyAvatarCommandHandler;
use Authorization\User\User\Domain\Event\MyAvatarChanged;
use Authorization\User\User\Domain\Exception\ChangeMyAvatarException;
use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Infrastructure\Domain\Model\InMemory\InMemoryUserRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Fake\FakeImageStoreService;

final class ChangeMyAvatarCommandHandlerTest extends TestCase
{
    private InMemoryUserRepository $repository;
    private FakeImageStoreService $imageStorageService;
    private ChangeMyAvatarCommandHandler $handler;

    protected function setUp(): void
    {
        $this->repository = new InMemoryUserRepository();
        $this->imageStorageService = new FakeImageStoreService();
        $this->handler = new ChangeMyAvatarCommandHandler(
            userRepository: $this->repository,
            imageStorageService: $this->imageStorageService,
            domainEventCollectorService: new DomainEventCollectorService(),
            dateTimeGenerator: new DateTimeGenerator(),
        );

        $this->repository->save(user: new User(
            id: 'user-1',
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
            createdByUserId: 'user-1',
            updatedByUserId: 'user-1',
        ));
    }

    public function testItStoresTheAvatarUnderTheUser(): void
    {
        ($this->handler)(new ChangeMyAvatarCommand(
            userSessionId: 'user-1',
            imagePath: '/tmp/upload_1.jpg',
        ));

        $user = $this->repository->findById(id: 'user-1');

        $this->assertSame('upload_1.jpg', $user->avatar);
        $this->assertSame(
            ['aggregate' => 'user', 'aggregateId' => 'user-1', 'imagePath' => '/tmp/upload_1.jpg'],
            $this->imageStorageService->storedImages[0],
        );
    }

    public function testItRecordsTheAvatarChangeWithTheWholeUser(): void
    {
        ($this->handler)(new ChangeMyAvatarCommand(
            userSessionId: 'user-1',
            imagePath: '/tmp/upload_1.jpg',
        ));

        $events = $this->repository->findById(id: 'user-1')->pullDomainEvents();
        $event = end($events);

        $this->assertInstanceOf(MyAvatarChanged::class, $event);
        $this->assertSame('upload_1.jpg', $event->avatar);
        $this->assertSame('john@example.com', $event->email);
    }

    public function testItDropsTheStoredFileWhenTheAvatarIsReplaced(): void
    {
        ($this->handler)(new ChangeMyAvatarCommand(userSessionId: 'user-1', imagePath: '/tmp/upload_1.jpg'));
        ($this->handler)(new ChangeMyAvatarCommand(userSessionId: 'user-1', imagePath: '/tmp/upload_2.jpg'));

        $this->assertSame('upload_2.jpg', $this->repository->findById(id: 'user-1')->avatar);
        $this->assertSame(
            ['aggregate' => 'user', 'aggregateId' => 'user-1', 'image' => 'upload_1.jpg'],
            $this->imageStorageService->deletedImages[0],
        );
    }

    public function testItRemovesTheAvatarWhenNoFileIsSent(): void
    {
        ($this->handler)(new ChangeMyAvatarCommand(userSessionId: 'user-1', imagePath: '/tmp/upload_1.jpg'));
        ($this->handler)(new ChangeMyAvatarCommand(userSessionId: 'user-1', imagePath: null));

        $this->assertNull($this->repository->findById(id: 'user-1')->avatar);
        $this->assertCount(1, $this->imageStorageService->storedImages);
        $this->assertCount(1, $this->imageStorageService->deletedImages);
    }

    public function testItThrowsWhenTheUserDoesNotExist(): void
    {
        $this->expectException(ChangeMyAvatarException::class);

        ($this->handler)(new ChangeMyAvatarCommand(userSessionId: 'user-404', imagePath: '/tmp/upload_1.jpg'));
    }
}
