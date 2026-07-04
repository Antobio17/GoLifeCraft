<?php

namespace Authorization\User\User\Infrastructure\Domain\Service\Security;

use Authorization\User\User\Domain\Model\User;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Shared\Shared\Shared\Domain\Exception\BaseException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Core\Exception\TooManyLoginAttemptsAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\CustomCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;

final class TenantUserAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private readonly UserPasswordHasherInterface $userPasswordHasher,
        private readonly TenantUserProvider $tenantUserProvider,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly JWTEncoderInterface $jwtEncoder,
    ) {
    }

    public function authenticate(Request $request): Passport
    {
        $email = RequestExtractor::getStringRequestValue(
            request: $request,
            fieldName: 'email',
            required: false
        );
        $plainPassword = RequestExtractor::getStringRequestValue(
            request: $request,
            fieldName: 'password',
            required: false
        );

        if (empty($email) || empty($plainPassword)) {
            throw new BadCredentialsException();
        }

        $hasher = $this->userPasswordHasher;
        $userProvider = $this->tenantUserProvider;

        $userBadge = new UserBadge(
            userIdentifier: $email,
            userLoader: function (string $identifier) use ($userProvider): User {
                /** @var User $user */
                $user = $userProvider->loadUserByIdentifier(identifier: $identifier);

                return $user;
            }
        );

        return new Passport(
            userBadge: $userBadge,
            credentials: new CustomCredentials(
                customCredentialsChecker: function (
                    string $credentials,
                    User $user,
                ) use ($hasher): bool {
                    return $hasher->isPasswordValid(user: $user, plainPassword: $credentials);
                },
                credentials: $plainPassword
            )
        );
    }

    public function onAuthenticationFailure(
        Request $request,
        AuthenticationException $exception,
    ): Response {
        if ($exception instanceof TooManyLoginAttemptsAuthenticationException) {
            $response = JsonResponseBuilder::buildResponseFromBaseException(
                exception: new BaseException(
                    title: 'Too many login attempts. Please try again later.',
                    keyTranslation: 'user.authentication.too_many_attempts',
                    details: []
                ),
                status: Response::HTTP_TOO_MANY_REQUESTS
            );
            $response->headers->set('Retry-After', '300');

            return $response;
        }

        return JsonResponseBuilder::buildResponseFromBaseException(
            exception: new BaseException(
                title: 'Invalid credentials.',
                keyTranslation: 'user.authentication.failed',
                details: []
            ),
            status: Response::HTTP_UNAUTHORIZED
        );
    }

    public function onAuthenticationSuccess(
        Request $request,
        TokenInterface $token,
        string $firewallName,
    ): Response {
        /** @var User */
        $user = $token->getUser();

        $jwt = $this->jwtManager->create(user: $user);

        return new JsonResponse(
            data: [
                'data' => [
                    'token' => $jwt,
                    'expires_at' => $this->jwtEncoder->decode(token: $jwt)['exp'] ?? time(),
                    'token_type' => 'Bearer',
                    'user' => [
                        'email' => $user->email,
                        'roles' => $user->getRoles(),
                    ],
                ],
            ],
            status: Response::HTTP_OK
        );
    }

    public function supports(Request $request): bool
    {
        return $request->isMethod(method: 'POST') && '/api/login' === $request->getPathInfo();
    }
}
