<?php

namespace Authorization\User\PasswordResetToken\Infrastructure\Domain\Service\Mailer;

use Authorization\User\PasswordResetToken\Domain\Service\SendPasswordResetEmail;
use Shared\Email\Email\Domain\Model\EmailAddress;
use Shared\Email\Email\Domain\Model\EmailMessage;
use Shared\Email\Email\Domain\Model\EmailTemplate;
use Shared\Email\Email\Domain\Service\EmailSender;

final readonly class MailerSendPasswordResetEmail implements SendPasswordResetEmail
{
    public function __construct(
        private EmailSender $emailSender,
        private string $frontendUrl,
        private int $ttlMinutes,
    ) {
    }

    public function send(
        string $email,
        string $name,
        string $languageCode,
        string $rawToken,
        \DateTime $requestedAt,
    ): void {
        $this->emailSender->send(message: new EmailMessage(
            to: new EmailAddress(email: $email, name: $name),
            subjectKeyTranslation: 'subject',
            template: new EmailTemplate(
                path: '@PasswordResetToken/password-reset.html.twig',
                context: [
                    'name' => $name,
                    'resetUrl' => $this->frontendUrl.'?token='.urlencode(string: $rawToken),
                    'ttlMinutes' => $this->ttlMinutes,
                    'languageCode' => $languageCode,
                    'requestedAtFormatted' => $requestedAt->format(format: 'd/m/Y · H:i'),
                    'logoPath' => '@PasswordResetToken/golifecraft-logo.png',
                ],
            ),
            translationDomain: 'password_reset_token',
            languageCode: $languageCode,
        ));
    }
}
