<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\Search;

use Doctrine\DBAL\Query\QueryBuilder;

final class SearchFilter
{
    private const IGNORED_CHARACTERS = [
        ' ', '-', '_', '.', ',', ';', ':', "'", '’', '"', '/', '\\', '(', ')', '[', ']', '&', '+', '%', '*', '·', '!', '?',
    ];

    /**
     * @param array<int, string> $columns
     */
    public static function apply(QueryBuilder $queryBuilder, ?string $needle, array $columns): void
    {
        $tokens = self::tokenize(needle: $needle);

        if ([] === $tokens || [] === $columns) {
            return;
        }

        $expressions = array_map(
            callback: static fn (string $column): string => self::normalize(column: $column),
            array: $columns,
        );

        foreach ($tokens as $index => $token) {
            $parameter = 'search'.$index;

            $conditions = array_map(
                callback: static fn (string $expression): string => sprintf('%s LIKE :%s', $expression, $parameter),
                array: $expressions,
            );

            $queryBuilder
                ->andWhere('('.implode(separator: ' OR ', array: $conditions).')')
                ->setParameter(key: $parameter, value: '%'.$token.'%');
        }
    }

    /**
     * @return array<int, string>
     */
    public static function tokenize(?string $needle): array
    {
        if (null === $needle) {
            return [];
        }

        $cleaned = (string) preg_replace(pattern: '/[^\p{L}\p{N}]+/u', replacement: ' ', subject: $needle);

        return array_values(array: array_filter(
            array: explode(separator: ' ', string: trim(string: $cleaned)),
            callback: static fn (string $token): bool => '' !== $token,
        ));
    }

    private static function normalize(string $column): string
    {
        $expression = $column;

        foreach (self::IGNORED_CHARACTERS as $character) {
            $expression = sprintf(
                "REPLACE(%s, '%s', '')",
                $expression,
                str_replace(search: ['\\', "'"], replace: ['\\\\', "''"], subject: $character),
            );
        }

        return $expression;
    }
}
