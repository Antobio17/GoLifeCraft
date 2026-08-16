<?php

namespace Economy\Finance\Transaction\Infrastructure\UI\API\Controller\Resolver;

use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\Request;

final class FinancePeriodResolver
{
    private const TIME_ZONE = 'Europe/Madrid';

    public static function today(): string
    {
        return self::now()->format(format: 'Y-m-d');
    }

    public static function resolveMonth(Request $request): string
    {
        $currentMonth = self::now()->format(format: 'Y-m');
        $month = RequestExtractor::getStringQueryParam(request: $request, param: 'month', default: $currentMonth);

        return 1 === preg_match(pattern: '/^\d{4}-\d{2}$/', subject: (string) $month) ? $month : $currentMonth;
    }

    public static function resolveDate(Request $request): ?string
    {
        $date = RequestExtractor::getStringQueryParam(request: $request, param: 'date');

        if (null === $date || '' === $date) {
            return null;
        }

        return 1 === preg_match(pattern: '/^\d{4}-\d{2}-\d{2}$/', subject: $date) ? $date : null;
    }

    private static function now(): \DateTime
    {
        return new \DateTime(datetime: 'now', timezone: new \DateTimeZone(timezone: self::TIME_ZONE));
    }
}
