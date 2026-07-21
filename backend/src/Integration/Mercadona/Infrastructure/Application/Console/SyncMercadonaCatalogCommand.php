<?php

namespace Integration\Mercadona\Infrastructure\Application\Console;

use Integration\Mercadona\Domain\Model\MercadonaNutrition;
use Integration\Mercadona\Domain\Model\MercadonaProduct;
use Integration\Mercadona\Domain\Service\ImportedProductRegistry;
use Integration\Mercadona\Domain\Service\MercadonaCatalogProvider;
use Integration\Mercadona\Domain\Service\MercadonaNutritionExtractor;
use Nutrition\GlobalCatalog\Article\Application\Command\UpsertGlobalArticleCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Messenger\Exception\ExceptionInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\HandledStamp;

final class SyncMercadonaCatalogCommand extends Command
{
    private const string SOURCE = 'mercadona';
    private const string STORE = 'Mercadona';
    private const int RESULT_UPSERTED = 1;
    private const int RESULT_SKIPPED = 2;
    private const int RESULT_FAILED = 3;
    private const int RESULT_EXISTING = 4;
    private const int CATALOG_PAUSE_MICROSECONDS = 150000;

    public function __construct(
        private readonly MercadonaCatalogProvider $catalogProvider,
        private readonly MercadonaNutritionExtractor $nutritionExtractor,
        private readonly ImportedProductRegistry $importedRegistry,
        private readonly MessageBusInterface $messageBus,
    ) {
        parent::__construct(name: 'app:catalog:sync-mercadona');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Sync the global product catalog from Mercadona. Stores a product only when identity and nutrition are both extracted and validated. Resumable: already imported products are skipped without extraction.')
            ->addOption(name: 'category', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Limit to a single top-level category id.', default: null)
            ->addOption(name: 'limit', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Max number of products to process (0 = all).', default: '0')
            ->addOption(name: 'delay', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Milliseconds to wait between nutrition extractions.', default: '500')
            ->addOption(name: 'force', shortcut: null, mode: InputOption::VALUE_NONE, description: 'Re-extract and re-import products already present in the catalog.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $categoryId = null !== $input->getOption('category') ? (int) $input->getOption('category') : null;
        $limit = max(0, (int) $input->getOption('limit'));
        $delayMilliseconds = max(0, (int) $input->getOption('delay'));
        $force = (bool) $input->getOption('force');

        $ids = $this->catalogProvider->listProductIds(categoryId: $categoryId);
        if ($limit > 0) {
            $ids = array_slice($ids, 0, $limit);
        }

        $output->writeln(messages: sprintf('<info>%d products to process.</info>', count($ids)));

        $upserted = 0;
        $existing = 0;
        $skipped = 0;
        $failed = 0;

        foreach (array_values($ids) as $id) {
            usleep(self::CATALOG_PAUSE_MICROSECONDS);

            $result = $this->process(id: $id, force: $force, output: $output);

            match ($result) {
                self::RESULT_UPSERTED => ++$upserted,
                self::RESULT_EXISTING => ++$existing,
                self::RESULT_SKIPPED => ++$skipped,
                default => ++$failed,
            };

            if (self::RESULT_EXISTING !== $result && $delayMilliseconds > 0) {
                usleep($delayMilliseconds * 1000);
            }
        }

        $output->writeln(messages: sprintf('<comment>Done. Upserted: %d, Existing: %d, Skipped: %d, Failed: %d</comment>', $upserted, $existing, $skipped, $failed));

        return Command::SUCCESS;
    }

    private function process(int $id, bool $force, OutputInterface $output): int
    {
        try {
            $product = $this->catalogProvider->fetchProduct(id: $id);
        } catch (\Throwable $e) {
            $output->writeln(messages: sprintf('<error>Product %d failed: %s</error>', $id, $e->getMessage()));

            return self::RESULT_FAILED;
        }

        if (null === $product) {
            $output->writeln(messages: sprintf('<comment>Skip %d: missing product identity.</comment>', $id));

            return self::RESULT_SKIPPED;
        }

        if (!$force && $this->importedRegistry->isImported(barcode: $product->barcode)) {
            return self::RESULT_EXISTING;
        }

        $nutrition = $this->nutritionExtractor->extract(imageUrls: $product->labelImageUrls);
        if (null === $nutrition) {
            $output->writeln(messages: sprintf('<comment>Skip %s (%s): nutrition not extracted.</comment>', $product->barcode, $product->name));

            return self::RESULT_SKIPPED;
        }

        return $this->upsert(product: $product, nutrition: $nutrition, output: $output);
    }

    private function upsert(MercadonaProduct $product, MercadonaNutrition $nutrition, OutputInterface $output): int
    {
        try {
            $envelope = $this->messageBus->dispatch(message: new UpsertGlobalArticleCommand(
                barcode: $product->barcode,
                name: $product->name,
                brand: $product->brand,
                categoryName: $product->categoryName,
                imageUrl: $product->imageUrl,
                quantity: $product->quantity,
                stores: self::STORE,
                source: self::SOURCE,
                referenceAmount: $nutrition->referenceAmount,
                calories: $nutrition->calories,
                protein: $nutrition->protein,
                carbs: $nutrition->carbs,
                sugars: $nutrition->sugars,
                fat: $nutrition->fat,
                saturatedFat: $nutrition->saturatedFat,
                fiber: $nutrition->fiber,
                salt: $nutrition->salt,
            ));

            $envelope->last(stampFqcn: HandledStamp::class);

            $output->writeln(messages: sprintf('<info>Imported %s (%s).</info>', $product->barcode, $product->name));

            return self::RESULT_UPSERTED;
        } catch (ExceptionInterface $e) {
            $output->writeln(messages: sprintf('<error>Upsert %s (%s) failed: %s</error>', $product->barcode, $product->name, $e->getMessage()));

            return self::RESULT_FAILED;
        }
    }
}
