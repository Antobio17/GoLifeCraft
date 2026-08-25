<?php

namespace Nutrition\Catalog\Article\Infrastructure\Domain\Service\Zbar;

use Nutrition\Catalog\Article\Domain\QueryModel\Dto\ArticleDraftPhoto;
use Nutrition\Catalog\Article\Domain\Service\BarcodeReader;
use Psr\Log\LoggerInterface;
use Symfony\Component\Process\Exception\ExceptionInterface;
use Symfony\Component\Process\Process;

final readonly class ZbarBarcodeReader implements BarcodeReader
{
    private const string BINARY = 'zbarimg';
    private const int TIMEOUT_IN_SECONDS = 5;
    private const int EXIT_CODE_NO_BARCODE = 4;
    private const string BARCODE_PATTERN = '/^(\d{8}|\d{12,14})$/';

    public function __construct(
        private LoggerInterface $logger,
    ) {
    }

    public function read(array $photos): ?string
    {
        foreach ($photos as $photo) {
            $barcode = $this->readPhoto(photo: $photo);

            if (null !== $barcode) {
                return $barcode;
            }
        }

        return null;
    }

    private function readPhoto(ArticleDraftPhoto $photo): ?string
    {
        $process = new Process(command: [
            self::BINARY,
            '--raw',
            '-q',
            '-Sdisable',
            '-Sean13.enable',
            '-Sean8.enable',
            '-Supca.enable',
            $photo->path,
        ]);
        $process->setTimeout(timeout: self::TIMEOUT_IN_SECONDS);

        try {
            $process->run();
        } catch (ExceptionInterface $e) {
            $this->logger->warning(message: 'zbarimg could not be executed.', context: ['error' => $e->getMessage()]);

            return null;
        }

        if (!$process->isSuccessful() && self::EXIT_CODE_NO_BARCODE !== $process->getExitCode()) {
            $this->logger->warning(message: 'zbarimg failed.', context: [
                'exitCode' => $process->getExitCode(),
                'error' => $process->getErrorOutput(),
            ]);

            return null;
        }

        foreach (explode(separator: "\n", string: $process->getOutput()) as $line) {
            $candidate = trim($line);

            if (1 === preg_match(pattern: self::BARCODE_PATTERN, subject: $candidate)) {
                return $candidate;
            }
        }

        return null;
    }
}
