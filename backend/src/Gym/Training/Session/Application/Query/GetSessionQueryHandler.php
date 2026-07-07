<?php

namespace Gym\Training\Session\Application\Query;

use Gym\Training\Session\Domain\Exception\GetSessionException;
use Gym\Training\Session\Domain\QueryModel\GetSessionNeedleDataQuery;
use Shared\Shared\Shared\Application\Query\QueryResult;

final readonly class GetSessionQueryHandler
{
    public function __construct(
        private GetSessionNeedleDataQuery $needleDataQuery,
        private GetSessionDataTransform $dataTransform,
    ) {
    }

    public function __invoke(GetSessionQuery $query): QueryResult
    {
        $session = $this->needleDataQuery->findSessionById(
            sessionId: $query->sessionId,
        );

        if (null === $session) {
            throw GetSessionException::notFound(sessionId: $query->sessionId);
        }

        return $this->dataTransform->transform(session: $session);
    }
}
