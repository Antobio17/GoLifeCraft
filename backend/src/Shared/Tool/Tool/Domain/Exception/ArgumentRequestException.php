<?php

namespace Shared\Tool\Tool\Domain\Exception;

use Shared\Shared\Shared\Domain\Exception\BaseException;

final class ArgumentRequestException extends BaseException
{
    public static function argumentIsRequired(string $argumentName): self
    {
        return new static(
            title: 'The argument is required.',
            keyTranslation: 'the.argument.is.required',
            details: ['argumentName' => $argumentName]
        );
    }

    public static function filterIsRequired(string $filterName): self
    {
        return new static(
            title: 'The filter is required.',
            keyTranslation: 'the.filter.is.required',
            details: ['filterName' => $filterName]
        );
    }

    public static function argumentMustBeInteger(string $argumentName): self
    {
        return new static(
            title: 'The argument must be integer.',
            keyTranslation: 'the.argument.must.be.integer',
            details: ['argumentName' => $argumentName]
        );
    }

    public static function argumentMustBeArray(string $argumentName): self
    {
        return new static(
            title: 'The argument must be array.',
            keyTranslation: 'the.argument.must.be.array',
            details: ['argumentName' => $argumentName]
        );
    }

    public static function argumentMustBeImage(string $argumentName): self
    {
        return new static(
            title: 'The argument must be an image.',
            keyTranslation: 'the.argument.must.be.image',
            details: ['argumentName' => $argumentName]
        );
    }

    public static function tooManyFiles(string $argumentName, int $maximum): self
    {
        return new static(
            title: 'Too many files were uploaded.',
            keyTranslation: 'too.many.files',
            details: ['argumentName' => $argumentName, 'maximum' => $maximum]
        );
    }
}
