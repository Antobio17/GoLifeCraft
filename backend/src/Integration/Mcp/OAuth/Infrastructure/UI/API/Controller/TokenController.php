<?php

namespace Integration\Mcp\OAuth\Infrastructure\UI\API\Controller;

use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Model\UserRepository;
use Integration\Mcp\OAuth\Infrastructure\Domain\Service\Store\AuthorizationCodeStore;
use Integration\Mcp\OAuth\Infrastructure\UI\API\Exception\TokenException;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
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
        try {
            $this->guardGrant(request: $request);
            $stored = $this->pullCode(request: $request);
            $user = $this->resolveUser(userId: $stored['user_id']);
        } catch (TokenException $e) {
            return $this->error(error: $e->error);
        }

        return new JsonResponse(data: [
            'access_token' => $this->jwtManager->create(user: $user),
            'token_type' => 'Bearer',
            'expires_in' => $this->tokenTtl,
        ]);
    }

    private function guardGrant(Request $request): void
    {
        if ('authorization_code' !== $request->request->get('grant_type')) {
            throw TokenException::unsupportedGrantType();
        }
    }

    private function pullCode(Request $request): array
    {
        $code = $request->request->get('code');
        $codeVerifier = $request->request->get('code_verifier');

        if (null === $code || null === $codeVerifier) {
            throw TokenException::invalidRequest();
        }

        $stored = $this->codeStore->pull(code: $code);

        if (null === $stored
            || $stored['redirect_uri'] !== $request->request->get('redirect_uri')
            || $stored['client_id'] !== $request->request->get('client_id')
        ) {
            throw TokenException::invalidGrant();
        }

        if (!hash_equals(known_string: $stored['code_challenge'], user_string: $this->challengeFrom(verifier: $codeVerifier))) {
            throw TokenException::invalidGrant();
        }

        return $stored;
    }

    private function resolveUser(string $userId): User
    {
        $user = $this->userRepository->findById(id: $userId);

        if (null === $user) {
            throw TokenException::invalidGrant();
        }

        return $user;
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
