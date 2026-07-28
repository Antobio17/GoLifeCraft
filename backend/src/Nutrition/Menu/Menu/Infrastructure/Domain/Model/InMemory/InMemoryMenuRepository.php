<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\Model\InMemory;

use Nutrition\Menu\Menu\Domain\Model\Menu;
use Nutrition\Menu\Menu\Domain\Model\MenuRepository;

final class InMemoryMenuRepository implements MenuRepository
{
    private array $menus = [];

    public function nextId(): string
    {
        return 'menu-'.(count(value: $this->menus) + 1);
    }

    public function findById(string $id): ?Menu
    {
        foreach ($this->menus as $menu) {
            if ($menu->id === $id) {
                return $menu;
            }
        }

        return null;
    }

    public function save(Menu $menu): void
    {
        foreach ($this->menus as $key => $existing) {
            if ($existing->id === $menu->id) {
                $this->menus[$key] = $menu;

                return;
            }
        }

        $this->menus[] = $menu;
    }

    public function delete(Menu $menu): void
    {
        foreach ($this->menus as $key => $existing) {
            if ($existing->id === $menu->id) {
                unset($this->menus[$key]);
                break;
            }
        }
    }

    /**
     * @return Menu[]
     */
    public function all(): array
    {
        return array_values(array: $this->menus);
    }
}
