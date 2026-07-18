<?php

namespace Authorization\User\RefreshToken\Infrastructure\UI\API\Controller;

use Authorization\User\RefreshToken\Infrastructure\Domain\Service\RefreshTokenManager;
use Authorization\User\User\Domain\Model\UserRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Shared\Shared\Shared\Domain\Exception\BaseException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class RefreshTokenController
{
    public function __construct(
        private readonly RefreshTokenManager $refreshTokenManager,
        private readonly UserRepository $userRepository,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly JWTEncoderInterface $jwtEncoder,
        private readonly int $refreshTokenTtlDays,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $rawToken = RequestExtractor::getStringRequestValue(
            request: $request,
            fieldName: 'refresh_token',
            required: false
        );

        if (empty($rawToken)) {
            return $this->unauthorized();
        }

        $grant = $this->refreshTokenManager->rotate(
            rawToken: $rawToken,
            clientId: null,
            ttlDays: $this->refreshTokenTtlDays,
        );

        if (null === $grant) {
            return $this->unauthorized();
        }

        $user = $this->userRepository->findById(id: $grant->userId);

        if (null === $user) {
            return $this->unauthorized();
        }

        $jwt = $this->jwtManager->create(user: $user);

        return new JsonResponse(
            data: [
                'data' => [
                    'token' => $jwt,
                    'expires_at' => $this->jwtEncoder->decode(token: $jwt)['exp'] ?? time(),
                    'token_type' => 'Bearer',
                    'refresh_token' => $grant->rawToken,
                    'user' => [
                        'email' => $user->email,
                        'roles' => $user->getRoles(),
                    ],
                ],
            ],
            status: Response::HTTP_OK
        );
    }

    private function unauthorized(): JsonResponse
    {
        return JsonResponseBuilder::buildResponseFromBaseException(
            exception: new BaseException(
                title: 'Invalid refresh token.',
                keyTranslation: 'token.refresh.failed',
                details: []
            ),
            status: Response::HTTP_UNAUTHORIZED
        );
    }
}
