<?php

namespace Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse;

use Shared\Shared\Shared\Domain\Exception\BaseException;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryAggregateResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryCollectionResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryIncludedResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QueryRelationshipResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\QuerySingleResult;
use Shared\Shared\Shared\Domain\QueryModel\Dto\WithQueryMeta;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;

final class JsonResponseBuilder
{
    public static function buildSingleResponse(
        QuerySingleResult $querySingleResult,
    ): JsonResponse {
        if (null === $querySingleResult->item) {
            return new JsonResponse(data: [
                'data' => null,
                'included' => [],
            ], status: Response::HTTP_OK);
        }

        return new JsonResponse(data: [
            'data' => [
                'id' => $querySingleResult->item->id,
                'type' => $querySingleResult->item->aggregateName,
                'attributes' => self::getAttributes(dto: $querySingleResult->item),
                'relationships' => self::getRelationships(
                    relationships: $querySingleResult->item->relationships,
                ),
            ],
            'included' => self::getIncluded(included: $querySingleResult->included),
        ], status: Response::HTTP_OK);
    }

    public static function buildCollectionResponse(
        QueryCollectionResult $queryCollectionResult,
    ): JsonResponse {
        $data = [];

        foreach ($queryCollectionResult->items as $item) {
            $data[] = [
                'id' => $item->id,
                'type' => $item->aggregateName,
                'attributes' => self::getAttributes(dto: $item),
                'relationships' => self::getRelationships(relationships: $item->relationships),
            ];
        }

        $meta = [
            'pageNumber' => $queryCollectionResult->pageNumber,
            'pageSize' => $queryCollectionResult->pageSize,
            'total' => $queryCollectionResult->total,
        ];

        if ($queryCollectionResult instanceof WithQueryMeta) {
            $meta = array_merge($meta, $queryCollectionResult->getQueryMeta());
        }

        return new JsonResponse(data: [
            'meta' => $meta,
            'data' => $data,
            'included' => self::getIncluded(included: $queryCollectionResult->included),
        ], status: Response::HTTP_OK);
    }

    public static function buildResponseFromBaseException(
        BaseException $exception,
        ?int $status = null,
    ): JsonResponse {
        $status ??= Response::HTTP_BAD_REQUEST;
        $payload = [
            'errors' => [
                [
                    'status' => $status,
                    'title' => $exception->title,
                    'keyTranslation' => $exception->keyTranslation,
                    'details' => $exception->details,
                ],
            ],
        ];

        return new JsonResponse(data: $payload, status: $status);
    }

    public static function buildResponseFromBaseHandlerFailedException(
        HandlerFailedException $exception,
        array $exceptionStatusMap,
    ): JsonResponse {
        foreach ($exception->getNestedExceptions() as $nested) {
            foreach ($exceptionStatusMap as $class => $status) {
                if ($nested instanceof $class) {
                    return self::buildResponseFromBaseException(
                        exception: $nested,
                        status: $status
                    );
                }
            }
        }

        return new JsonResponse(
            data: ['errors' => [[
                'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'title' => $exception->getMessage(),
                'keyTranslation' => 'handler.failed.exception',
                'details' => [],
            ]]],
            status: Response::HTTP_INTERNAL_SERVER_ERROR
        );
    }

    public static function getAttributes(
        QueryAggregateResult|QueryRelationshipResult|QueryIncludedResult $dto,
    ): array {
        $reflection = new \ReflectionClass(objectOrClass: $dto);
        $properties = $reflection->getProperties(filter: \ReflectionProperty::IS_PUBLIC);
        $result = [];

        foreach ($properties as $property) {
            if (
                !$property->isPublic()
                || $property->isStatic()
                || 'id' === $property->getName()
                || 'aggregateName' === $property->getName()
                || 'relationships' === $property->getName()
                || 'relationshipName' === $property->getName()
            ) {
                continue;
            }

            if ($property->getValue($dto) instanceof \DateTime) {
                $date = (clone $property->getValue($dto))->setTimezone(new \DateTimeZone('Europe/Madrid'));
                $result[$property->getName()] = $date->format(format: \DateTime::ATOM);
                continue;
            }

            $result[$property->getName()] = $property->getValue($dto);
        }

        return $result;
    }

    /**
     * @param QueryRelationshipResult[] $relationships
     */
    private static function getRelationships(array $relationships): array
    {
        $result = [];

        foreach ($relationships as $relationship) {
            $relationshipKey = $relationship->relationshipName ?? $relationship->aggregateName;

            $result[$relationshipKey] = [
                'data' => [
                    'id' => $relationship->id,
                    'type' => $relationship->aggregateName,
                    'attributes' => self::getAttributes(dto: $relationship),
                ],
            ];
        }

        return $result;
    }

    /**
     * @param QueryIncludedResult[] $included
     */
    private static function getIncluded(array $included): array
    {
        $result = [];

        foreach ($included as $item) {
            $result[] = [
                'id' => $item->id,
                'type' => $item->aggregateName,
                'attributes' => self::getAttributes(dto: $item),
            ];
        }

        return $result;
    }
}
