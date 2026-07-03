<?php

namespace Integration\Mcp\OAuth\Infrastructure\UI\API\Controller;

use Authorization\User\User\Domain\Model\User;
use Authorization\User\User\Domain\Model\UserRepository;
use Integration\Mcp\OAuth\Infrastructure\Domain\Service\Store\AuthorizationCodeStore;
use Integration\Mcp\OAuth\Infrastructure\Domain\Service\Store\RefreshTokenStore;
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
        private readonly RefreshTokenStore $refreshTokenStore,
        private readonly int $tokenTtl,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $grant = $this->resolveGrant(request: $request);
            $user = $this->resolveUser(userId: $grant['user_id']);
        } catch (TokenException $e) {
            return $this->error(error: $e->error);
        }

        return $this->buildTokenResponse(user: $user, clientId: $grant['client_id']);
    }

    private function resolveGrant(Request $request): array
    {
        $grantType = $request->request->get('grant_type');

        if ('authorization_code' === $grantType) {
            return $this->grantFromCode(request: $request);
        }

        if ('refresh_token' === $grantType) {
            return $this->grantFromRefreshToken(request: $request);
        }

        throw TokenException::unsupportedGrantType();
    }

    private function grantFromCode(Request $request): array
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

    private function grantFromRefreshToken(Request $request): array
    {
        $refreshToken = $request->request->get('refresh_token');

        if (null === $refreshToken) {
            throw TokenException::invalidRequest();
        }

        $stored = $this->refreshTokenStore->pull(token: $refreshToken);

        if (null === $stored || $stored['client_id'] !== $request->request->get('client_id')) {
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

    private function buildTokenResponse(User $user, string $clientId): JsonResponse
    {
        $refreshToken = $this->refreshTokenStore->generate();
        $this->refreshTokenStore->store(token: $refreshToken, data: [
            'client_id' => $clientId,
            'user_id' => $user->id,
        ]);

        return new JsonResponse(data: [
            'access_token' => $this->jwtManager->create(user: $user),
            'token_type' => 'Bearer',
            'expires_in' => $this->tokenTtl,
            'refresh_token' => $refreshToken,
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
