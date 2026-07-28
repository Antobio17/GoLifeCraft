<?php

namespace Nutrition\Menu\Menu\Domain\Model;

interface MenuRepository
{
    public function nextId(): string;

    public function findById(string $id): ?Menu;

    public function save(Menu $menu): void;

    public function delete(Menu $menu): void;
}
