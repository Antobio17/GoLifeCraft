<?php

namespace Authorization\User\User\Infrastructure\UI\API\Controller;

use Authorization\User\User\Domain\Service\ImpersonationRevoker;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class RevokeImpersonationController
{
    public function __construct(
        private readonly ImpersonationRevoker $impersonationRevoker,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $tokenId = $request->attributes->get(key: 'impersonationTokenId');

        if (null === $tokenId) {
            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        }

        $this->impersonationRevoker->revoke(tokenId: $tokenId);

        return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
    }
}
