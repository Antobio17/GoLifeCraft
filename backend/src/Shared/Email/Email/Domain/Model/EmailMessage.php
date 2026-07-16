<?php

namespace Shared\Email\Email\Domain\Model;

final readonly class EmailMessage
{
    public function __construct(
        public EmailAddress $to,
        public string $subjectKeyTranslation,
        public EmailTemplate $template,
        public string $translationDomain = 'messages',
        public string $languageCode = 'es',
    ) {
    }
}
