<?php

namespace App\Tests\Integration\Mcp\OAuth\Infrastructure\Domain\Service\Security;

use Integration\Mcp\OAuth\Infrastructure\Domain\Service\Security\RedirectUriValidator;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class RedirectUriValidatorTest extends TestCase
{
    private RedirectUriValidator $validator;

    protected function setUp(): void
    {
        $this->validator = new RedirectUriValidator(allowedHosts: [
            'claude.ai',
            'www.claude.ai',
            'claude.com',
            'www.claude.com',
            'chatgpt.com',
            'www.chatgpt.com',
            'chat.openai.com',
            'platform.openai.com',
        ]);
    }

    #[DataProvider('allowedRedirectUriProvider')]
    public function testItAllowsRegisteredClientCallbacks(string $redirectUri): void
    {
        self::assertTrue($this->validator->isAllowed(redirectUri: $redirectUri));
    }

    #[DataProvider('rejectedRedirectUriProvider')]
    public function testItRejectsEverythingElse(string $redirectUri): void
    {
        self::assertFalse($this->validator->isAllowed(redirectUri: $redirectUri));
    }

    public static function allowedRedirectUriProvider(): array
    {
        return [
            'claude connector' => ['https://claude.ai/api/mcp/auth_callback'],
            'chatgpt connector' => ['https://chatgpt.com/connector_platform_oauth_redirect'],
            'chatgpt app' => ['https://chatgpt.com/aip/connector/oauth/callback'],
            'chatgpt legacy host' => ['https://chat.openai.com/connector_platform_oauth_redirect'],
            'openai platform' => ['https://platform.openai.com/connector_platform_oauth_redirect'],
            'uppercase host' => ['https://ChatGPT.com/connector_platform_oauth_redirect'],
            'loopback over http' => ['http://127.0.0.1:33418/oauth/callback'],
        ];
    }

    public static function rejectedRedirectUriProvider(): array
    {
        return [
            'unknown host' => ['https://evil.com/callback'],
            'subdomain of an allowed host' => ['https://chatgpt.com.evil.com/callback'],
            'allowed host over http' => ['http://chatgpt.com/callback'],
            'credentials in the uri' => ['https://user:pass@chatgpt.com/callback'],
            'fragment in the uri' => ['https://chatgpt.com/callback#fragment'],
            'not a uri' => ['not-a-uri'],
        ];
    }
}
