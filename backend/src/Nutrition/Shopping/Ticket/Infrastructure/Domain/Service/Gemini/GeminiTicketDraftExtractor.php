<?php

namespace Nutrition\Shopping\Ticket\Infrastructure\Domain\Service\Gemini;

use Integration\Gemini\Client\Domain\Model\GeminiImage;
use Integration\Gemini\Client\Domain\Service\GeminiClient;
use Nutrition\Shopping\Ticket\Domain\Exception\GetTicketDraftException;
use Nutrition\Shopping\Ticket\Domain\Model\Ticket;
use Nutrition\Shopping\Ticket\Domain\Model\TicketItem;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraft;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftExtraction;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftGrounding;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftLine;
use Nutrition\Shopping\Ticket\Domain\QueryModel\Dto\TicketDraftPhoto;
use Nutrition\Shopping\Ticket\Domain\Service\TicketDraftExtractor;

final readonly class GeminiTicketDraftExtractor implements TicketDraftExtractor
{
    private const int MAX_ATTEMPTS = 1;
    private const int MAX_LINES = 150;
    private const int RAW_UNIT_MAX_LENGTH = 16;
    private const array LOW_CONFIDENCE_FIELDS = ['storeName', 'supermarketId', 'purchasedOn', 'total'];
    private const string PROMPT = <<<'PROMPT'
        Eres un asistente que transcribe tickets de la compra. En todas las imágenes aparece EL MISMO ticket: si hay varias, son tramos consecutivos del mismo papel, en orden.

        Devuelve la cabecera del ticket y una línea por cada producto comprado.

        Reglas:
        - Si un dato no aparece en el ticket, ponlo a null. No inventes ni estimes NUNCA.
        - found = true solo si reconoces un ticket de compra en las imágenes.
        - storeName: el nombre del comercio tal y como está impreso en la cabecera.
        - purchasedOn: el día de la compra en formato YYYY-MM-DD. Si en el papel viene como DD/MM/AAAA, conviértelo.
        - total: el total pagado impreso al pie. Cópialo tal cual; no lo sumes tú.
        - rawName: el texto del producto EXACTAMENTE como está impreso, con sus abreviaturas y sin corregir. No lo traduzcas ni lo completes: ese texto es la clave con la que se recuerda a qué artículo corresponde.
        - quantity: el número de envases o unidades de esa línea. Si el producto se vende a peso, pon el peso impreso y unit "kg".
        - unitPrice y totalPrice en euros, con punto decimal.
        - NO devuelvas como línea los descuentos, promociones, cupones, puntos, devoluciones, subtotales, la base imponible, el IVA, el total, la forma de pago ni los mensajes del pie.
        - Una misma referencia impresa dos veces se devuelve dos veces, sin agrupar.
        - lowConfidence: lista con los nombres de los campos de cabecera que has rellenado sin verlos con total claridad.
        %s
        PROMPT;

    public function __construct(
        private GeminiClient $geminiClient,
    ) {
    }

    public function extract(array $photos, TicketDraftGrounding $grounding): TicketDraftExtraction
    {
        if (!$this->geminiClient->isConfigured()) {
            throw GetTicketDraftException::extractorIsNotAvailable();
        }

        $notes = [];
        $images = $this->images(photos: $photos, notes: $notes);

        if ([] === $images) {
            return TicketDraftExtraction::failure(notes: ['None of the photos could be read.']);
        }

        $response = $this->geminiClient->generateJson(
            prompt: sprintf(self::PROMPT, $this->groundingBlock(grounding: $grounding)),
            images: $images,
            schema: $this->schema(grounding: $grounding),
            maxAttempts: self::MAX_ATTEMPTS,
        );

        $notes = array_merge($notes, $response->notes);

        if (!$response->isSuccessful() || true !== ($response->data['found'] ?? null)) {
            return TicketDraftExtraction::failure(notes: $notes);
        }

        $lines = $this->toLines(data: $response->data, notes: $notes);

        if ([] === $lines) {
            $notes[] = 'The ticket was recognised but no product line could be read.';

            return TicketDraftExtraction::failure(notes: $notes);
        }

        return TicketDraftExtraction::success(
            draft: $this->toDraft(data: $response->data, grounding: $grounding, lines: $lines, notes: $notes),
            lowConfidenceFields: $this->lowConfidenceFields(data: $response->data),
            notes: $notes,
        );
    }

    /**
     * @param TicketDraftPhoto[] $photos
     * @param string[]           $notes
     *
     * @return GeminiImage[]
     */
    private function images(array $photos, array &$notes): array
    {
        $images = [];
        foreach ($photos as $photo) {
            $bytes = @file_get_contents(filename: $photo->path);

            if (false === $bytes || '' === $bytes) {
                $notes[] = sprintf('A photo could not be read from disk (%s).', $photo->mimeType);
                continue;
            }

            $image = new GeminiImage(mimeType: $photo->mimeType, bytes: $bytes);
            $notes[] = sprintf('Photo sent to Gemini: %s, %d KB.', $photo->mimeType, $image->sizeInKilobytes());
            $images[] = $image;
        }

        return $images;
    }

    private function groundingBlock(TicketDraftGrounding $grounding): string
    {
        if ([] === $grounding->supermarkets) {
            return '';
        }

        $lines = [];
        foreach ($grounding->supermarkets as $id => $name) {
            $lines[] = sprintf('- %s: %s', $id, $name);
        }

        return "\nSupermercados existentes (elige el id exacto de uno si el ticket es de esa cadena, o null):\n".implode("\n", $lines);
    }

    /**
     * @param array<string, mixed> $data
     * @param TicketDraftLine[]    $lines
     * @param string[]             $notes
     */
    private function toDraft(array $data, TicketDraftGrounding $grounding, array $lines, array &$notes): TicketDraft
    {
        $purchasedOn = $this->toDay(value: $data['purchasedOn'] ?? null);

        if (null === $purchasedOn && null !== ($data['purchasedOn'] ?? null)) {
            $notes[] = 'The purchase day read from the ticket is not a date: dropped.';
        }

        return new TicketDraft(
            storeName: $this->toTrimmedString(value: $data['storeName'] ?? null, maxLength: Ticket::STORE_NAME_MAX_LENGTH),
            supermarketId: $this->pick(value: $data['supermarketId'] ?? null, allowed: $grounding->supermarketIds()),
            purchasedOn: $purchasedOn,
            total: $this->toPositiveFloat(value: $data['total'] ?? null),
            lines: $lines,
        );
    }

    /**
     * @param array<string, mixed> $data
     * @param string[]             $notes
     *
     * @return TicketDraftLine[]
     */
    private function toLines(array $data, array &$notes): array
    {
        $rawLines = $data['lines'] ?? [];

        if (!is_array($rawLines)) {
            return [];
        }

        $lines = [];
        $dropped = 0;

        foreach ($rawLines as $rawLine) {
            if (count($lines) >= self::MAX_LINES) {
                $notes[] = sprintf('The ticket has more than %d lines: the rest were dropped.', self::MAX_LINES);
                break;
            }

            $line = is_array($rawLine) ? $this->toLine(rawLine: $rawLine) : null;

            if (null === $line) {
                ++$dropped;
                continue;
            }

            $lines[] = $line;
        }

        if ($dropped > 0) {
            $notes[] = sprintf('%d line(s) came back without a name or without a quantity: dropped.', $dropped);
        }

        return $lines;
    }

    /**
     * @param array<string, mixed> $rawLine
     */
    private function toLine(array $rawLine): ?TicketDraftLine
    {
        $rawName = $this->toTrimmedString(value: $rawLine['rawName'] ?? null, maxLength: TicketItem::RAW_NAME_MAX_LENGTH);

        if (null === $rawName) {
            return null;
        }

        $quantity = $this->toPositiveFloat(value: $rawLine['quantity'] ?? null) ?? 1.0;

        if (0.0 === $quantity) {
            return null;
        }

        return new TicketDraftLine(
            rawName: $rawName,
            quantity: $quantity,
            rawUnit: $this->toTrimmedString(value: $rawLine['unit'] ?? null, maxLength: self::RAW_UNIT_MAX_LENGTH),
            unitPrice: $this->toPositiveFloat(value: $rawLine['unitPrice'] ?? null),
            totalPrice: $this->toPositiveFloat(value: $rawLine['totalPrice'] ?? null),
        );
    }

    /**
     * @param array<string, mixed> $data
     *
     * @return string[]
     */
    private function lowConfidenceFields(array $data): array
    {
        $fields = $data['lowConfidence'] ?? [];

        if (!is_array($fields)) {
            return [];
        }

        return array_values(array_intersect(self::LOW_CONFIDENCE_FIELDS, $fields));
    }

    /**
     * @param string[] $allowed
     */
    private function pick(mixed $value, array $allowed): ?string
    {
        $candidate = $this->toTrimmedString(value: $value, maxLength: 36);

        if (null === $candidate || !in_array($candidate, $allowed, true)) {
            return null;
        }

        return $candidate;
    }

    private function toDay(mixed $value): ?string
    {
        $candidate = $this->toTrimmedString(value: $value, maxLength: 10);

        if (null === $candidate) {
            return null;
        }

        $day = \DateTime::createFromFormat(format: '!Y-m-d', datetime: $candidate);

        return false !== $day && $day->format(format: 'Y-m-d') === $candidate ? $candidate : null;
    }

    private function toTrimmedString(mixed $value, int $maxLength): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $trimmed = trim($value);

        return '' === $trimmed ? null : mb_substr(string: $trimmed, start: 0, length: $maxLength);
    }

    private function toPositiveFloat(mixed $value): ?float
    {
        if (!is_numeric($value) || (float) $value < 0.0) {
            return null;
        }

        return (float) $value;
    }

    /**
     * @return array<string, mixed>
     */
    private function schema(TicketDraftGrounding $grounding): array
    {
        $nullableNumber = ['type' => 'NUMBER', 'nullable' => true];
        $nullableString = ['type' => 'STRING', 'nullable' => true];
        $supermarketIds = $grounding->supermarketIds();

        return [
            'type' => 'OBJECT',
            'properties' => [
                'found' => ['type' => 'BOOLEAN'],
                'storeName' => $nullableString,
                'supermarketId' => [] === $supermarketIds
                    ? $nullableString
                    : array_merge($nullableString, ['enum' => $supermarketIds]),
                'purchasedOn' => $nullableString,
                'total' => $nullableNumber,
                'lines' => [
                    'type' => 'ARRAY',
                    'items' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'rawName' => ['type' => 'STRING'],
                            'quantity' => ['type' => 'NUMBER'],
                            'unit' => $nullableString,
                            'unitPrice' => $nullableNumber,
                            'totalPrice' => $nullableNumber,
                        ],
                        'required' => ['rawName', 'quantity'],
                    ],
                ],
                'lowConfidence' => [
                    'type' => 'ARRAY',
                    'items' => ['type' => 'STRING', 'enum' => self::LOW_CONFIDENCE_FIELDS],
                ],
            ],
            'required' => ['found', 'lines'],
        ];
    }
}
