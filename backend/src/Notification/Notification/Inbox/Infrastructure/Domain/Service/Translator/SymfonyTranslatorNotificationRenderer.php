<?php

namespace Notification\Notification\Inbox\Infrastructure\Domain\Service\Translator;

use Notification\Notification\Inbox\Domain\Service\Dto\RenderedNotification;
use Notification\Notification\Inbox\Domain\Service\NotificationRenderer;
use Notification\Notification\Settings\Domain\Model\NotificationType;
use Symfony\Contracts\Translation\TranslatorInterface;

final readonly class SymfonyTranslatorNotificationRenderer implements NotificationRenderer
{
    private const string DOMAIN = 'notification';

    public function __construct(
        private TranslatorInterface $translator,
    ) {
    }

    public function render(NotificationType $type, array $params, string $languageCode): RenderedNotification
    {
        $variant = (string) ($params['variant'] ?? (null === ($params['time'] ?? null) ? 'untimed' : 'timed'));
        $parameters = [];

        foreach ($params as $key => $value) {
            $parameters[sprintf('%%%s%%', $key)] = (string) $value;
        }

        return new RenderedNotification(
            title: $this->translator->trans(
                id: sprintf('%s.title', $type->value),
                parameters: $parameters,
                domain: self::DOMAIN,
                locale: $languageCode,
            ),
            body: $this->translator->trans(
                id: sprintf('%s.body.%s', $type->value, $variant),
                parameters: $parameters,
                domain: self::DOMAIN,
                locale: $languageCode,
            ),
        );
    }
}
