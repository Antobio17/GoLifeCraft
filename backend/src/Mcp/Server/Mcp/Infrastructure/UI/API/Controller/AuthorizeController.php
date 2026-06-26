<?php

namespace Mcp\Server\Mcp\Infrastructure\UI\API\Controller;

use Authorization\User\User\Domain\Model\UserRepository;
use Mcp\Server\Mcp\Infrastructure\Domain\Service\OAuth\AuthorizationCodeStore;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class AuthorizeController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly AuthorizationCodeStore $codeStore,
    ) {
    }

    public function __invoke(Request $request): Response
    {
        $clientId = $request->get('client_id');
        $redirectUri = $request->get('redirect_uri');
        $codeChallenge = $request->get('code_challenge');
        $state = $request->get('state');
        $username = $request->get('username');
        $password = $request->get('password');

        if ('code' !== $request->get('response_type') || null === $clientId || null === $redirectUri || null === $codeChallenge) {
            return $this->error(error: 'invalid_request', status: Response::HTTP_BAD_REQUEST);
        }

        if ('S256' !== $request->get('code_challenge_method')) {
            return $this->error(error: 'invalid_request', status: Response::HTTP_BAD_REQUEST);
        }

        if (null === $username || null === $password) {
            return $this->error(error: 'access_denied', status: Response::HTTP_UNAUTHORIZED);
        }

        $user = $this->userRepository->findByUsername(username: $username);

        if (null === $user || !$this->passwordHasher->isPasswordValid(user: $user, plainPassword: $password)) {
            return $this->error(error: 'access_denied', status: Response::HTTP_UNAUTHORIZED);
        }

        $code = $this->codeStore->generate();
        $this->codeStore->store(code: $code, data: [
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'code_challenge' => $codeChallenge,
            'user_id' => $user->id,
        ]);

        $separator = str_contains(haystack: $redirectUri, needle: '?') ? '&' : '?';
        $query = http_build_query(data: array_filter(['code' => $code, 'state' => $state]));

        return new RedirectResponse(url: $redirectUri.$separator.$query);
    }

    private function error(string $error, int $status): JsonResponse
    {
        return new JsonResponse(data: ['error' => $error], status: $status);
    }
}
