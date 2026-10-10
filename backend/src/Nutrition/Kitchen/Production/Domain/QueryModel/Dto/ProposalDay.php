<?php

namespace Nutrition\Kitchen\Production\Domain\QueryModel\Dto;

final readonly class ProposalDay
{
    public const string STATUS_COVERED = 'covered';
    public const string STATUS_TO_COOK = 'toCook';
    public const string STATUS_EMPTY = 'empty';

    public function __construct(
        public string $date,
        public string $status,
        public float $demand,
        public float $deficit,
    ) {
    }
}
