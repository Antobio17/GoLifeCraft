<?php

namespace Nutrition\Shopping\Ticket\Domain\Service;

use Nutrition\Shopping\Ticket\Domain\Model\TicketLineName;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketArticleCandidate;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketLineMatch;

final class TicketLineMatcher
{
    private const float MINIMUM_SCORE = 0.6;
    private const float MINIMUM_MARGIN = 0.05;
    private const int SIGNIFICANT_TOKEN_LENGTH = 3;

    /**
     * @param TicketArticleCandidate[] $candidates
     */
    public function bestMatch(string $rawName, array $candidates): ?TicketLineMatch
    {
        $rawTokens = self::significantTokens(value: $rawName);

        if ([] === $rawTokens || [] === $candidates) {
            return null;
        }

        $normalizedRawName = TicketLineName::normalize(value: $rawName);
        $best = null;
        $runnerUpScore = 0.0;

        foreach ($candidates as $candidate) {
            $score = $this->score(
                normalizedRawName: $normalizedRawName,
                rawTokens: $rawTokens,
                candidate: $candidate,
            );

            if (null !== $best && $score <= $best->score) {
                $runnerUpScore = max($runnerUpScore, $score);

                continue;
            }

            if (null !== $best) {
                $runnerUpScore = max($runnerUpScore, $best->score);
            }

            $best = new TicketLineMatch(articleId: $candidate->articleId, score: $score);
        }

        if (null === $best || $best->score < self::MINIMUM_SCORE) {
            return null;
        }

        if ($best->score - $runnerUpScore < self::MINIMUM_MARGIN) {
            return null;
        }

        return $best;
    }

    /**
     * @param array<int, string> $rawTokens
     */
    private function score(string $normalizedRawName, array $rawTokens, TicketArticleCandidate $candidate): float
    {
        if ($normalizedRawName === TicketLineName::normalize(value: $candidate->name)) {
            return 1.0;
        }

        $candidateTokens = self::significantTokens(value: $candidate->searchableText());

        if ([] === $candidateTokens) {
            return 0.0;
        }

        $matchedRaw = self::countMatches(tokens: $rawTokens, against: $candidateTokens);
        $matchedCandidate = self::countMatches(tokens: $candidateTokens, against: $rawTokens);

        return ($matchedRaw / count($rawTokens)) * 0.8 + ($matchedCandidate / count($candidateTokens)) * 0.2;
    }

    /**
     * @param array<int, string> $tokens
     * @param array<int, string> $against
     */
    private static function countMatches(array $tokens, array $against): int
    {
        $matches = 0;

        foreach ($tokens as $token) {
            if (self::matchesAny(token: $token, against: $against)) {
                ++$matches;
            }
        }

        return $matches;
    }

    /**
     * @param array<int, string> $against
     */
    private static function matchesAny(string $token, array $against): bool
    {
        foreach ($against as $other) {
            if (str_starts_with(haystack: $other, needle: $token) || str_starts_with(haystack: $token, needle: $other)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array<int, string>
     */
    private static function significantTokens(string $value): array
    {
        $tokens = TicketLineName::tokenize(value: $value);

        $significant = array_values(array: array_filter(
            array: $tokens,
            callback: static fn (string $token): bool => mb_strlen(string: $token) >= self::SIGNIFICANT_TOKEN_LENGTH
                && 1 !== preg_match(pattern: '/^\d/', subject: $token),
        ));

        return [] === $significant ? $tokens : $significant;
    }
}
