<?php

namespace Integration\Mcp\Server\Infrastructure\UI\Mcp\Controller;

use Mcp\Server;
use Mcp\Server\Transport\Http\Middleware\CorsMiddleware;
use Mcp\Server\Transport\Http\Middleware\DnsRebindingProtectionMiddleware;
use Mcp\Server\Transport\Http\Middleware\ProtocolVersionMiddleware;
use Mcp\Server\Transport\StreamableHttpTransport;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\PsrHttpMessage\HttpFoundationFactoryInterface;
use Symfony\Bridge\PsrHttpMessage\HttpMessageFactoryInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

final readonly class McpEndpointController
{
    /**
     * @param list<string> $allowedHosts
     */
    public function __construct(
        private Server $server,
        private HttpMessageFactoryInterface $httpMessageFactory,
        private HttpFoundationFactoryInterface $httpFoundationFactory,
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory,
        private array $allowedHosts,
        private ?LoggerInterface $logger = null,
    ) {
    }

    public function handle(Request $request): Response
    {
        $transport = new StreamableHttpTransport(
            request: $this->httpMessageFactory->createRequest(symfonyRequest: $request),
            responseFactory: $this->responseFactory,
            streamFactory: $this->streamFactory,
            logger: $this->logger,
            middleware: $this->buildMiddleware(),
        );

        $psrResponse = $this->server->run(transport: $transport);
        $streamed = 'text/event-stream' === strtolower($psrResponse->getHeaderLine('Content-Type'));

        return $this->httpFoundationFactory->createResponse(psrResponse: $psrResponse, streamed: $streamed);
    }

    /**
     * @return list<\Psr\Http\Server\MiddlewareInterface>
     */
    private function buildMiddleware(): array
    {
        $allowedHosts = array_values(array_unique(array_filter(
            [...$this->allowedHosts, 'localhost', '127.0.0.1', '[::1]']
        )));

        return [
            new CorsMiddleware(),
            new DnsRebindingProtectionMiddleware(
                allowedHosts: $allowedHosts,
                responseFactory: $this->responseFactory,
                streamFactory: $this->streamFactory,
            ),
            new ProtocolVersionMiddleware(),
        ];
    }
}
