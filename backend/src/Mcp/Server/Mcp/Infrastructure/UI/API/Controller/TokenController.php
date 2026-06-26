<?php

namespace Mcp\Server\Mcp\Infrastructure\UI\API\Controller;

use Authorization\User\User\Domain\Model\UserRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Mcp\Server\Mcp\Infrastructure\Domain\Service\OAuth\AuthorizationCodeStore;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class TokenController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly AuthorizationCodeStore $codeStore,
        private readonly int $tokenTtl,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        if ('authorization_code' !== $request->request->get('grant_type')) {
            return $this->error(error: 'unsupported_grant_type');
        }

        $code = $request->request->get('code');
        $codeVerifier = $request->request->get('code_verifier');

        if (null === $code || null === $codeVerifier) {
            return $this->error(error: 'invalid_request');
        }

        $stored = $this->codeStore->pull(code: $code);

        if (null === $stored
            || $stored['redirect_uri'] !== $request->request->get('redirect_uri')
            || $stored['client_id'] !== $request->request->get('client_id')
        ) {
            return $this->error(error: 'invalid_grant');
        }

        if (!hash_equals(known_string: $stored['code_challenge'], user_string: $this->challengeFrom(verifier: $codeVerifier))) {
            return $this->error(error: 'invalid_grant');
        }

        $user = $this->userRepository->findById(id: $stored['user_id']);

        if (null === $user) {
            return $this->error(error: 'invalid_grant');
        }

        return new JsonResponse(data: [
            'access_token' => $this->jwtManager->create(user: $user),
            'token_type' => 'Bearer',
            'expires_in' => $this->tokenTtl,
        ]);
    }

    private function challengeFrom(string $verifier): string
    {
        return rtrim(strtr(base64_encode(hash(algo: 'sha256', data: $verifier, binary: true)), '+/', '-_'), '=');
    }

    private function error(string $error): JsonResponse
    {
        return new JsonResponse(data: ['error' => $error], status: Response::HTTP_BAD_REQUEST);
    }
}
