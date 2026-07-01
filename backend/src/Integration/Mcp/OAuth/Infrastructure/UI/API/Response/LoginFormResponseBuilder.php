<?php

namespace Integration\Mcp\OAuth\Infrastructure\UI\API\Response;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final class LoginFormResponseBuilder
{
    private const array FORWARDED_PARAMS = [
        'response_type', 'code_challenge_method', 'client_id', 'redirect_uri', 'code_challenge', 'state', 'scope', 'resource',
    ];

    private const string TEMPLATE = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in</title><style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}form{background:#1e293b;padding:2rem;border-radius:12px;width:320px;box-shadow:0 10px 30px rgba(0,0,0,.4)}h1{font-size:1.25rem;margin:0 0 1.5rem}label{display:block;font-size:.8rem;margin:0 0 .35rem;color:#94a3b8}input[type=text],input[type=password]{width:100%%;box-sizing:border-box;padding:.6rem;margin:0 0 1rem;border:1px solid #334155;border-radius:8px;background:#0f172a;color:#e2e8f0}button{width:100%%;padding:.7rem;border:0;border-radius:8px;background:#6366f1;color:#fff;font-weight:600;cursor:pointer}.error{background:#7f1d1d;color:#fecaca;padding:.5rem .75rem;border-radius:8px;font-size:.85rem;margin:0 0 1rem}</style></head><body><form method="post" action="/oauth/authorize"><h1>GoLifeCraft MCP</h1>%s<label for="username">Username</label><input id="username" type="text" name="username" autocomplete="username" autofocus><label for="password">Password</label><input id="password" type="password" name="password" autocomplete="current-password">%s<button type="submit">Authorize</button></form></body></html>';

    public static function build(Request $request, ?string $error = null): Response
    {
        $html = sprintf(
            self::TEMPLATE,
            self::buildError(error: $error),
            self::buildHiddenInputs(request: $request)
        );

        return new Response(content: $html, status: Response::HTTP_OK, headers: ['Content-Type' => 'text/html']);
    }

    private static function buildHiddenInputs(Request $request): string
    {
        $hidden = '';

        foreach (self::FORWARDED_PARAMS as $key) {
            $value = $request->query->get($key) ?? $request->request->get($key);

            if (null === $value) {
                continue;
            }

            $hidden .= sprintf('<input type="hidden" name="%s" value="%s">', $key, htmlspecialchars($value, ENT_QUOTES));
        }

        return $hidden;
    }

    private static function buildError(?string $error): string
    {
        if (null === $error) {
            return '';
        }

        return sprintf('<p class="error">%s</p>', htmlspecialchars($error, ENT_QUOTES));
    }
}
