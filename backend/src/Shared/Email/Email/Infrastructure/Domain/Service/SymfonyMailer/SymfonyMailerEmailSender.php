<?php

namespace Shared\Email\Email\Infrastructure\Domain\Service\SymfonyMailer;

use Shared\Email\Email\Domain\Exception\SendEmailException;
use Shared\Email\Email\Domain\Model\EmailMessage;
use Shared\Email\Email\Domain\Service\EmailSender;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Environment;

final readonly class SymfonyMailerEmailSender implements EmailSender
{
    public function __construct(
        private MailerInterface $mailer,
        private TranslatorInterface $translator,
        private Environment $twig,
    ) {
    }

    public function send(EmailMessage $message): void
    {
        $subject = $this->translator->trans(
            id: $message->subjectKeyTranslation,
            parameters: $message->template->context,
            domain: $message->translationDomain,
            locale: $message->languageCode,
        );

        $context = $message->template->context + ['translationDomain' => $message->translationDomain];

        $email = (new TemplatedEmail())
            ->to(new Address(address: $message->to->email, name: $message->to->name ?? ''))
            ->subject(subject: $subject)
            ->htmlTemplate(template: $message->template->path)
            ->context(context: $context);

        try {
            $this->mailer->send(message: $email);
        } catch (TransportExceptionInterface $e) {
            throw SendEmailException::transportFailed(
                email: $message->to->email,
                reason: $e->getMessage(),
            );
        }
    }
}
