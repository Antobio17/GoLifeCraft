<?php

namespace Shared\Tool\Tool\Infrastructure\UI\API\Controller;

use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\RateLimiter\RateLimiterFactory;

final readonly class CspReportController
{
    private const int MAX_BODY_BYTES = 8192;

    private const array ALLOWED_CONTENT_TYPES = [
        'application/csp-report',
        'application/reports+json',
        'application/json',
    ];

    private const array LEGACY_SAFE_FIELDS = [
        'document-uri',
        'referrer',
        'violated-directive',
        'effective-directive',
        'original-policy',
        'disposition',
        'blocked-uri',
        'status-code',
        'script-sample',
        'source-file',
        'line-number',
        'column-number',
    ];

    private const array REPORTING_API_SAFE_BODY_FIELDS = [
        'documentURL',
        'referrer',
        'blockedURL',
        'effectiveDirective',
        'originalPolicy',
        'disposition',
        'statusCode',
        'sample',
        'sourceFile',
        'lineNumber',
        'columnNumber',
    ];

    public function __construct(
        private LoggerInterface $logger,
        private RateLimiterFactory $cspReportLimiter,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $limit = $this->cspReportLimiter->create(key: $request->getClientIp() ?? 'unknown')->consume();

        if (!$limit->isAccepted()) {
            return new JsonResponse(data: null, status: Response::HTTP_TOO_MANY_REQUESTS);
        }

        if (!$this->hasAllowedContentType(request: $request)) {
            return new JsonResponse(data: null, status: Response::HTTP_UNSUPPORTED_MEDIA_TYPE);
        }

        $rawBody = $request->getContent();

        if (strlen(string: $rawBody) > self::MAX_BODY_BYTES) {
            return new JsonResponse(data: null, status: Response::HTTP_REQUEST_ENTITY_TOO_LARGE);
        }

        $payload = json_decode(json: $rawBody, associative: true);

        if (!is_array(value: $payload)) {
            return new JsonResponse(data: null, status: Response::HTTP_BAD_REQUEST);
        }

        $reports = $this->extractReports(payload: $payload);

        if ([] === $reports) {
            return new JsonResponse(data: null, status: Response::HTTP_BAD_REQUEST);
        }

        foreach ($reports as $report) {
            $this->logger->info(message: 'CSP violation report', context: $report);
        }

        return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
    }

    private function hasAllowedContentType(Request $request): bool
    {
        $contentType = strtolower(string: (string) $request->headers->get(key: 'Content-Type'));

        if ('' === $contentType) {
            return false;
        }

        $contentType = trim(string: explode(separator: ';', string: $contentType)[0]);

        return in_array(needle: $contentType, haystack: self::ALLOWED_CONTENT_TYPES, strict: true);
    }

    private function extractReports(array $payload): array
    {
        if (isset($payload['csp-report']) && is_array(value: $payload['csp-report'])) {
            return [$this->whitelist(data: $payload['csp-report'], fields: self::LEGACY_SAFE_FIELDS)];
        }

        if (!array_is_list(array: $payload)) {
            return [];
        }

        $reports = [];

        foreach ($payload as $entry) {
            if (!is_array(value: $entry) || 'csp-violation' !== ($entry['type'] ?? null)) {
                continue;
            }

            $body = is_array(value: $entry['body'] ?? null) ? $entry['body'] : [];
            $reports[] = $this->whitelist(data: $body, fields: self::REPORTING_API_SAFE_BODY_FIELDS);
        }

        return $reports;
    }

    private function whitelist(array $data, array $fields): array
    {
        $clean = [];

        foreach ($fields as $field) {
            if (!array_key_exists(key: $field, array: $data)) {
                continue;
            }

            $value = $data[$field];

            if (is_scalar(value: $value)) {
                $clean[$field] = is_string(value: $value) ? mb_substr(string: $value, start: 0, length: 512) : $value;
            }
        }

        return $clean;
    }
}
