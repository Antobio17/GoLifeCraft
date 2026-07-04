<?php

namespace Nutrition\Catalog\Category\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetCategoryException extends BaseException
{
    public static function notFound(string $categoryId): self
    {
        return new static(
            title: 'Category not found.',
            keyTranslation: 'category.not.found',
            details: ['id' => $categoryId]
        );
    }
}
