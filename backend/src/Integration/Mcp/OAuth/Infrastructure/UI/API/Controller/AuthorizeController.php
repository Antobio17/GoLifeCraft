<?php

namespace Integration\Mcp\OAuth\Infrastructure\UI\API\Controller;

use Authorization\User\User\Domain\Model\User;
use Integration\Mcp\OAuth\Infrastructure\Domain\Service\Security\CredentialsVerifier;
use Integration\Mcp\OAuth\Infrastructure\Domain\Service\Store\AuthorizationCodeStore;
use Integration\Mcp\OAuth\Infrastructure\UI\API\Exception\AuthorizeException;
use Integration\Mcp\OAuth\Infrastructure\UI\API\Response\LoginFormResponseBuilder;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class AuthorizeController
{
    public function __construct(
        private readonly CredentialsVerifier $credentialsVerifier,
        private readonly AuthorizationCodeStore $codeStore,
    ) {
    }

    public function __invoke(Request $request): Response
    {
        try {
            $this->guardGrant(request: $request);
            $clientId = $this->required(request: $request, key: 'client_id');
            $redirectUri = $this->required(request: $request, key: 'redirect_uri');
            $codeChallenge = $this->required(request: $request, key: 'code_challenge');
        } catch (AuthorizeException $e) {
            return new JsonResponse(data: ['error' => $e->error], status: Response::HTTP_BAD_REQUEST);
        }

        $username = $this->param(request: $request, key: 'username');
        $password = $this->param(request: $request, key: 'password');

        if (null === $username || null === $password) {
            return LoginFormResponseBuilder::build(request: $request);
        }

        $user = $this->credentialsVerifier->verify(username: $username, password: $password);

        if (null === $user) {
            return LoginFormResponseBuilder::build(request: $request, error: 'Invalid credentials.');
        }

        return $this->redirectWithCode(
            request: $request,
            user: $user,
            clientId: $clientId,
            redirectUri: $redirectUri,
            codeChallenge: $codeChallenge,
        );
    }

    private function guardGrant(Request $request): void
    {
        if ('code' !== $this->param(request: $request, key: 'response_type')) {
            throw AuthorizeException::invalidRequest();
        }

        if ('S256' !== $this->param(request: $request, key: 'code_challenge_method')) {
            throw AuthorizeException::invalidRequest();
        }
    }

    private function required(Request $request, string $key): string
    {
        $value = $this->param(request: $request, key: $key);

        if (null === $value) {
            throw AuthorizeException::invalidRequest();
        }

        return $value;
    }

    private function redirectWithCode(
        Request $request,
        User $user,
        string $clientId,
        string $redirectUri,
        string $codeChallenge,
    ): RedirectResponse {
        $code = $this->codeStore->generate();
        $this->codeStore->store(code: $code, data: [
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'code_challenge' => $codeChallenge,
            'user_id' => $user->id,
        ]);

        $state = $this->param(request: $request, key: 'state');
        $separator = str_contains(haystack: $redirectUri, needle: '?') ? '&' : '?';
        $query = http_build_query(data: array_filter(['code' => $code, 'state' => $state]));

        return new RedirectResponse(url: $redirectUri.$separator.$query);
    }

    private function param(Request $request, string $key): ?string
    {
        return $request->query->get($key) ?? $request->request->get($key);
    }
}
