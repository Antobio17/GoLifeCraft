<?php

namespace App\Tests\Nutrition\Menu\Menu\Application\Command;

use Nutrition\Menu\Menu\Application\Command\DeleteMenuCommand;
use Nutrition\Menu\Menu\Application\Command\DeleteMenuCommandHandler;
use Nutrition\Menu\Menu\Domain\Exception\DeleteMenuException;
use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Infrastructure\Domain\Model\InMemory\InMemoryMenuRepository;
use PHPUnit\Framework\TestCase;
use Shared\Shared\Shared\Domain\Service\DomainEventCollectorService;
use Shared\Tool\Tool\Domain\Service\DateTimeGenerator;

final class DeleteMenuCommandHandlerTest extends TestCase
{
    private InMemoryMenuRepository $menuRepository;
    private DomainEventCollectorService $domainEventCollectorService;
    private DeleteMenuCommandHandler $handler;

    protected function setUp(): void
    {
        $dateTimeGenerator = new DateTimeGenerator();
        $this->menuRepository = new InMemoryMenuRepository();
        $this->domainEventCollectorService = new DomainEventCollectorService();
        $this->handler = new DeleteMenuCommandHandler(
            menuRepository: $this->menuRepository,
            domainEventCollectorService: $this->domainEventCollectorService,
            dateTimeGenerator: $dateTimeGenerator,
        );

        $this->menuRepository->save(menu: Menu::create(
            id: 'menu-1',
            name: 'Día ligero',
            emoji: '🥗',
            note: '',
            type: Menu::TYPE_SINGLE,
            items: [],
            createdByUserId: 'god-user-id',
            dateTimeGenerator: $dateTimeGenerator,
        ));
    }

    public function testItDeletesTheMenu(): void
    {
        ($this->handler)(new DeleteMenuCommand(
            menuId: 'menu-1',
            deletedByUserId: 'god-user-id',
        ));

        $this->assertNull(actual: $this->menuRepository->findById(id: 'menu-1'));
        $this->assertNotEmpty(actual: $this->domainEventCollectorService->pullEvents());
    }

    public function testItFailsWhenTheMenuDoesNotExist(): void
    {
        $this->expectException(exception: DeleteMenuException::class);

        ($this->handler)(new DeleteMenuCommand(
            menuId: 'missing-menu',
            deletedByUserId: 'god-user-id',
        ));
    }
}
