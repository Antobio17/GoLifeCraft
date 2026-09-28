<?php

namespace Shared\Push\Push\Domain\Model;

final readonly class PushNotification
{
    public function __construct(
        public string $title,
        public string $body,
        public ?string $url = null,
        public ?string $tag = null,
    ) {
    }

    /**
     * @return array{title: string, body: string, url: ?string, tag: ?string}
     */
    public function toPayload(): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'url' => $this->url,
            'tag' => $this->tag,
        ];
    }
}
