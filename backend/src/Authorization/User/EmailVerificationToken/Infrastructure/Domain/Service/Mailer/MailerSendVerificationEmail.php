<?php

namespace Authorization\User\EmailVerificationToken\Infrastructure\Domain\Service\Mailer;

use Authorization\User\EmailVerificationToken\Domain\Service\SendVerificationEmail;
use Shared\Email\Email\Domain\Model\EmailAddress;
use Shared\Email\Email\Domain\Model\EmailMessage;
use Shared\Email\Email\Domain\Model\EmailTemplate;
use Shared\Email\Email\Domain\Service\EmailSender;

final readonly class MailerSendVerificationEmail implements SendVerificationEmail
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
    ): void {
        $this->emailSender->send(message: new EmailMessage(
            to: new EmailAddress(email: $email, name: $name),
            subjectKeyTranslation: 'subject',
            template: new EmailTemplate(
                path: '@EmailVerificationToken/verify-email.html.twig',
                context: [
                    'name' => $name,
                    'verifyUrl' => $this->frontendUrl.'?token='.urlencode(string: $rawToken),
                    'ttlHours' => intdiv($this->ttlMinutes, 60),
                    'languageCode' => $languageCode,
                    'logoPath' => '@EmailVerificationToken/golifecraft-logo.png',
                ],
            ),
            translationDomain: 'email_verification_token',
            languageCode: $languageCode,
        ));
    }
}
