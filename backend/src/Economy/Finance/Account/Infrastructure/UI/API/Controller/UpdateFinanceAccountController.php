<?php

namespace Economy\Finance\Account\Infrastructure\UI\API\Controller;

use Economy\Finance\Account\Application\Command\UpdateFinanceAccountCommand;
use Economy\Finance\Account\Domain\Exception\UpdateFinanceAccountException;
use Economy\Finance\Account\Domain\Model\FinanceAccount;
use Shared\Tool\Tool\Domain\Exception\ArgumentRequestException;
use Shared\Tool\Tool\Infrastructure\Domain\Service\JsonResponse\JsonResponseBuilder;
use Shared\Tool\Tool\Infrastructure\Domain\Service\Request\RequestExtractor;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Messenger\Exception\HandlerFailedException;
use Symfony\Component\Messenger\HandleTrait;
use Symfony\Component\Messenger\MessageBusInterface;

final class UpdateFinanceAccountController
{
    use HandleTrait;

    public function __construct(
        MessageBusInterface $messageBus,
    ) {
        $this->messageBus = $messageBus;
    }

    public function __invoke(Request $request, string $financeAccountId): JsonResponse
    {
        try {
            $this->handle(message: new UpdateFinanceAccountCommand(
                financeAccountId: $financeAccountId,
                name: RequestExtractor::getStringRequestValue(request: $request, fieldName: 'name'),
                type: (string) RequestExtractor::getStringRequestValue(request: $request, fieldName: 'type', required: false)
                    ?: FinanceAccount::TYPE_BANK,
                updatedByUserId: RequestExtractor::getUserSessionId(request: $request),
            ));

            return new JsonResponse(data: null, status: Response::HTTP_NO_CONTENT);
        } catch (HandlerFailedException $e) {
            return JsonResponseBuilder::buildResponseFromBaseHandlerFailedException(
                exception: $e,
                exceptionStatusMap: [
                    UpdateFinanceAccountException::class => Response::HTTP_BAD_REQUEST,
                ]
            );
        } catch (ArgumentRequestException $e) {
            return JsonResponseBuilder::buildResponseFromBaseException(
                exception: $e,
                status: Response::HTTP_BAD_REQUEST
            );
        }
    }
}
