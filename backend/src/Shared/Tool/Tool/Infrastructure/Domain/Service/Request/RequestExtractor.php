<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\Request;

use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Symfony\Component\HttpFoundation\Request;

final class RequestExtractor
{
    private static function assertFieldRequired(array $data, string $fieldName, bool $required): void
    {
        if ($required && !isset($data[$fieldName])) {
            throw ArgumentRequestException::argumentIsRequired(argumentName: $fieldName);
        }
    }

    private static function getRequestData(Request $request): array
    {
        $formData = $request->request->all();
        if (!empty($formData)) {
            return $formData;
        }

        $content = $request->getContent();
        if (empty($content)) {
            return [];
        }

        $jsonData = json_decode(json: $content, associative: true);
        if (is_array(value: $jsonData)) {
            return $jsonData;
        }

        return [];
    }

    public static function getStringRequestValue(
        Request $request,
        string $fieldName,
        bool $required = true,
    ): ?string {
        $data = self::getRequestData(request: $request);
        self::assertFieldRequired(data: $data, fieldName: $fieldName, required: $required);

        return $data[$fieldName] ?? null;
    }

    public static function getNullableStringRequestValue(
        Request $request,
        string $fieldName,
    ): ?string {
        $data = self::getRequestData(request: $request);

        if (!array_key_exists($fieldName, $data)) {
            return null;
        }

        $value = $data[$fieldName];

        if (null === $value || '' === $value) {
            return null;
        }

        return (string) $value;
    }

    public static function getBooleanRequestValue(
        Request $request,
        string $fieldName,
        bool $required = true,
        bool $nullable = true,
    ): ?bool {
        $data = self::getRequestData(request: $request);
        self::assertFieldRequired(data: $data, fieldName: $fieldName, required: $required);

        $value = $data[$fieldName] ?? null;

        if ($nullable && null === $value) {
            return null;
        }

        if (!$nullable && null === $value) {
            return false;
        }

        return filter_var(value: $value, filter: FILTER_VALIDATE_BOOLEAN);
    }

    public static function getArrayRequestValue(
        Request $request,
        string $fieldName,
        bool $required = true,
    ): ?array {
        $data = self::getRequestData(request: $request);
        self::assertFieldRequired(data: $data, fieldName: $fieldName, required: $required);

        $value = $data[$fieldName] ?? null;

        if (null === $value) {
            return null;
        }

        if (is_string(value: $value)) {
            $value = json_decode(json: $value, associative: true);
        }

        if (!is_array(value: $value)) {
            throw ArgumentRequestException::argumentMustBeArray(
                argumentName: $fieldName
            );
        }

        return $value;
    }

    public static function getIntQueryParam(
        Request $request,
        string $param,
        int $default = 0,
    ): int {
        $value = $request->query->get(key: $param, default: $default);

        if (!is_numeric(value: $value)) {
            throw ArgumentRequestException::argumentMustBeInteger(
                argumentName: $param
            );
        }

        return (int) $value;
    }

    public static function getPageSize(Request $request): int
    {
        $queryParams = $request->query->all();
        $pageSize = null;

        if (isset($queryParams['page']) && is_array(value: $queryParams['page'])) {
            $pageSize = $queryParams['page']['size'] ?? null;
        }

        if (null === $pageSize) {
            return self::getIntQueryParam(
                request: $request,
                param: 'pageSize',
                default: 10
            );
        }

        if (!is_numeric(value: $pageSize)) {
            throw ArgumentRequestException::argumentMustBeInteger(
                argumentName: 'page[size]'
            );
        }

        return (int) $pageSize;
    }

    public static function getPageNumber(Request $request): int
    {
        $queryParams = $request->query->all();
        $pageNumber = null;

        if (isset($queryParams['page']) && is_array(value: $queryParams['page'])) {
            $pageNumber = $queryParams['page']['number'] ?? null;
        }

        if (null === $pageNumber) {
            return self::getIntQueryParam(
                request: $request,
                param: 'pageNumber',
                default: 1
            );
        }

        if (!is_numeric(value: $pageNumber)) {
            throw ArgumentRequestException::argumentMustBeInteger(
                argumentName: 'page[number]'
            );
        }

        return (int) $pageNumber;
    }

    public static function getStringQueryParam(
        Request $request,
        string $param,
        ?string $default = null,
    ): ?string {
        return $request->query->get(key: $param, default: $default);
    }

    public static function getFilterParam(
        Request $request,
        string $filterName,
        ?string $default = null,
        bool $required = false,
    ): ?string {
        $queryParams = $request->query->all();
        $filters = [];

        if (isset($queryParams['filter']) && is_array(value: $queryParams['filter'])) {
            $filters = $queryParams['filter'];
        }

        if ($required && null === $filters[$filterName] ?? null) {
            throw ArgumentRequestException::filterIsRequired(
                filterName: $filterName,
            );
        }

        return $filters[$filterName] ?? $default;
    }

    public static function getBooleanFilterParam(
        Request $request,
        string $filterName,
        ?bool $default = null,
        bool $required = false,
    ): ?bool {
        $queryParams = $request->query->all();
        $filters = [];

        if (isset($queryParams['filter']) && is_array(value: $queryParams['filter'])) {
            $filters = $queryParams['filter'];
        }

        if ($required && !isset($filters[$filterName])) {
            throw ArgumentRequestException::filterIsRequired(
                filterName: $filterName,
            );
        }

        if (!isset($filters[$filterName])) {
            return $default;
        }

        return filter_var(
            value: $filters[$filterName],
            filter: FILTER_VALIDATE_BOOLEAN,
            options: FILTER_NULL_ON_FAILURE
        );
    }

    public static function getOrderByParam(Request $request, ?string $default = null): ?string
    {
        return self::getStringQueryParam(
            request: $request,
            param: 'orderBy',
            default: $default
        );
    }

    public static function getIntRequestValue(
        Request $request,
        string $fieldName,
        bool $required = true,
    ): ?int {
        $data = self::getRequestData(request: $request);
        self::assertFieldRequired(data: $data, fieldName: $fieldName, required: $required);

        $value = $data[$fieldName] ?? null;

        if (null === $value) {
            return null;
        }

        if (!is_numeric(value: $value)) {
            throw ArgumentRequestException::argumentMustBeInteger(
                argumentName: $fieldName
            );
        }

        return (int) $value;
    }

    public static function getFloatRequestValue(
        Request $request,
        string $fieldName,
        bool $required = true,
    ): ?float {
        $data = self::getRequestData(request: $request);
        self::assertFieldRequired(data: $data, fieldName: $fieldName, required: $required);

        $value = $data[$fieldName] ?? null;

        if (null === $value) {
            return null;
        }

        if (!is_numeric(value: $value)) {
            throw ArgumentRequestException::argumentMustBeInteger(
                argumentName: $fieldName
            );
        }

        return (float) $value;
    }

    public static function getDateTimeRequestValue(
        Request $request,
        string $fieldName,
        bool $required = true,
    ): ?\DateTime {
        $data = self::getRequestData(request: $request);
        self::assertFieldRequired(data: $data, fieldName: $fieldName, required: $required);

        $value = $data[$fieldName] ?? null;

        if (null === $value) {
            return null;
        }

        try {
            return new \DateTime(datetime: $value);
        } catch (\Exception $e) {
            throw ArgumentRequestException::argumentIsRequired(
                argumentName: $fieldName
            );
        }
    }

    public static function getFilePathRequestValue(
        Request $request,
        string $fieldName,
        bool $required = true,
    ): ?string {
        $image = $request->files->get(key: $fieldName);

        if ($required && null === $image) {
            throw ArgumentRequestException::argumentIsRequired(
                argumentName: $fieldName
            );
        }

        if (null === $image) {
            return null;
        }

        $tmpPath = sprintf('%s/%s.%s', sys_get_temp_dir(), uniqid(prefix: 'upload_', more_entropy: true), $image->guessExtension());

        if (!copy(from: $image->getRealPath(), to: $tmpPath)) {
            throw new \RuntimeException('Failed to copy uploaded file to temp directory.');
        }

        return $tmpPath;
    }

    public static function getUploadedFile(Request $request): FileUploadedResult
    {
        $uploadedFile = $request->files->get('file');

        if (null === $uploadedFile) {
            throw ArgumentRequestException::argumentIsRequired(argumentName: 'file');
        }

        return new FileUploadedResult(
            name: pathinfo(path: $uploadedFile->getClientOriginalName(), flags: PATHINFO_FILENAME),
            extension: $uploadedFile->getClientOriginalExtension(),
            mimeType: $uploadedFile->getMimeType() ?? $uploadedFile->getClientMimeType(),
            size: (float) $uploadedFile->getSize(),
            tempPath: $uploadedFile->getPathname(),
        );
    }

    public static function getUserSessionId(Request $request): ?string
    {
        return $request->attributes->get(key: 'userSessionId');
    }

    public static function getUserRole(Request $request): ?string
    {
        return $request->attributes->get(key: 'userRole');
    }

    public static function getUserCanCreateFolder(Request $request): bool
    {
        return (bool) $request->attributes->get(key: 'userCanCreateFolder', default: false);
    }

    public static function getUserCanDeleteFolder(Request $request): bool
    {
        return (bool) $request->attributes->get(key: 'userCanDeleteFolder', default: false);
    }

    public static function getUserCanUploadFile(Request $request): bool
    {
        return (bool) $request->attributes->get(key: 'userCanUploadFile', default: false);
    }

    public static function getUserCanDeleteFile(Request $request): bool
    {
        return (bool) $request->attributes->get(key: 'userCanDeleteFile', default: false);
    }

    public static function getUserCanSignFile(Request $request): bool
    {
        return (bool) $request->attributes->get(key: 'userCanSignFile', default: false);
    }

    public static function getUserCanRollbackSign(Request $request): bool
    {
        return (bool) $request->attributes->get(key: 'userCanRollbackSign', default: false);
    }

    public static function getTenantSessionId(Request $request): ?string
    {
        return $request->attributes->get(key: 'tenantSessionId');
    }

    public static function getCenterSessionId(Request $request): ?string
    {
        return $request->attributes->get(key: 'centerSessionId');
    }
}
