<?php

namespace Nutrition\Catalog\Supermarket\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class GetSupermarketException extends BaseException
{
    public static function notFound(string $supermarketId): self
    {
        return new static(
            title: 'Supermarket not found.',
            keyTranslation: 'supermarket.not.found',
            details: ['id' => $supermarketId]
        );
    }
}
