<?php

namespace Integration\Mercadona\Infrastructure\Application\Console;

use Integration\Mercadona\Domain\Exception\MercadonaThrottledException;
use Integration\Mercadona\Domain\Model\MercadonaNutrition;
use Integration\Mercadona\Domain\Model\MercadonaProduct;
use Integration\Mercadona\Domain\Model\NutritionExtraction;
use Integration\Mercadona\Domain\Service\ImportedProductRegistry;
use Integration\Mercadona\Domain\Service\MercadonaCatalogProvider;
use Integration\Mercadona\Domain\Service\MercadonaImportQueue;
use Integration\Mercadona\Domain\Service\MercadonaNutritionExtractor;
use Nutrition\GlobalCatalog\Article\Application\Command\UpsertGlobalArticleCommand;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleNutrition;
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
    private const int RESULT_REPRICED = 4;

    private bool $showDetails = false;

    public function __construct(
        private readonly MercadonaCatalogProvider $catalogProvider,
        private readonly MercadonaNutritionExtractor $nutritionExtractor,
        private readonly ImportedProductRegistry $importedRegistry,
        private readonly MercadonaImportQueue $importQueue,
        private readonly MessageBusInterface $messageBus,
    ) {
        parent::__construct(name: 'app:catalog:sync-mercadona');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Incrementally sync the global product catalog from Mercadona. Discovery and import advance together, a few requests per run, so it can run every minute without bursting. On throttling it stops cleanly and resumes on the next run.')
            ->addOption(name: 'category', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Limit discovery to a single top-level category id (only used when initializing the queue).', default: null)
            ->addOption(name: 'limit', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Max number of products to import in this run.', default: '1')
            ->addOption(name: 'scan', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Max number of subcategories to explore in this run when the pending buffer is low.', default: '1')
            ->addOption(name: 'delay', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Milliseconds to wait between imports (only relevant when limit > 1).', default: '500')
            ->addOption(name: 'refresh', shortcut: null, mode: InputOption::VALUE_NONE, description: 'Reset the queue and rediscover the catalog from scratch.')
            ->addOption(name: 'show-details', shortcut: null, mode: InputOption::VALUE_NONE, description: 'Print the label image URLs, their download result and the raw Gemini answer for every product.')
            ->addOption(name: 'force', shortcut: null, mode: InputOption::VALUE_NONE, description: 'Re-extract and re-import products already present in the catalog.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $categoryId = null !== $input->getOption('category') ? (int) $input->getOption('category') : null;
        $limit = max(1, (int) $input->getOption('limit'));
        $scanLimit = max(0, (int) $input->getOption('scan'));
        $delayMilliseconds = max(0, (int) $input->getOption('delay'));
        $force = (bool) $input->getOption('force');
        $this->showDetails = (bool) $input->getOption('show-details');

        if ((bool) $input->getOption('refresh')) {
            $this->importQueue->reset();
        }

        try {
            $this->initializeIfNeeded(categoryId: $categoryId, output: $output);
            $this->fillBuffer(limit: $limit, scanLimit: $scanLimit, output: $output);
            $this->importPending(limit: $limit, delayMilliseconds: $delayMilliseconds, force: $force, output: $output);
        } catch (MercadonaThrottledException $e) {
            $output->writeln(messages: sprintf('<comment>Throttled: %s Stopping; will resume on the next run.</comment>', $e->getMessage()));

            return Command::FAILURE;
        }

        $this->reportPending(output: $output);

        return Command::SUCCESS;
    }

    private function initializeIfNeeded(?int $categoryId, OutputInterface $output): void
    {
        if ($this->importQueue->isInitialized()) {
            return;
        }

        $subcategoryIds = $this->catalogProvider->listSubcategoryIds(categoryId: $categoryId);
        $this->importQueue->initialize(subcategoryIds: $subcategoryIds);

        $output->writeln(messages: sprintf('<info>Sync started: %d subcategories to explore.</info>', count($subcategoryIds)));
    }

    private function fillBuffer(int $limit, int $scanLimit, OutputInterface $output): void
    {
        $scanned = 0;

        while ($scanned < $scanLimit
            && $this->importQueue->pendingProducts() < $limit
            && null !== ($subcategoryId = $this->importQueue->peekSubcategory())
        ) {
            $productIds = $this->catalogProvider->listProductIdsInSubcategory(subcategoryId: $subcategoryId);
            $this->importQueue->enqueueProducts(productIds: $productIds);
            $this->importQueue->markSubcategoryScanned(subcategoryId: $subcategoryId);
            ++$scanned;

            $output->writeln(messages: sprintf('<info>Subcategory %d explored: +%d products (pending: %d).</info>', $subcategoryId, count($productIds), $this->importQueue->pendingProducts()));
        }
    }

    private function importPending(int $limit, int $delayMilliseconds, bool $force, OutputInterface $output): void
    {
        $upserted = 0;
        $repriced = 0;
        $skipped = 0;
        $failed = 0;

        for ($imported = 0; $imported < $limit; ++$imported) {
            $productId = $this->importQueue->peekProduct();
            if (null === $productId) {
                break;
            }

            if ($imported > 0 && $delayMilliseconds > 0) {
                usleep($delayMilliseconds * 1000);
            }

            $result = $this->process(id: $productId, force: $force, output: $output);
            $this->importQueue->markProductProcessed(productId: $productId);

            match ($result) {
                self::RESULT_UPSERTED => ++$upserted,
                self::RESULT_REPRICED => ++$repriced,
                self::RESULT_SKIPPED => ++$skipped,
                default => ++$failed,
            };
        }

        $output->writeln(messages: sprintf('<comment>Run done. Upserted: %d, Repriced: %d, Skipped: %d, Failed: %d</comment>', $upserted, $repriced, $skipped, $failed));
    }

    private function reportPending(OutputInterface $output): void
    {
        $pendingProducts = $this->importQueue->pendingProducts();
        $pendingSubcategories = $this->importQueue->pendingSubcategories();

        if (0 === $pendingProducts && 0 === $pendingSubcategories) {
            $output->writeln(messages: '<info>Catalog complete. Run with --refresh to sync again.</info>');

            return;
        }

        $output->writeln(messages: sprintf('<comment>Pending: %d products, %d subcategories.</comment>', $pendingProducts, $pendingSubcategories));
    }

    private function process(int $id, bool $force, OutputInterface $output): int
    {
        $product = $this->fetch(id: $id, output: $output);
        if (null === $product) {
            return self::RESULT_FAILED;
        }

        if (!$force && $this->importedRegistry->isImported(barcode: $product->barcode)) {
            return $this->refreshPricing(product: $product, output: $output);
        }

        $extraction = $this->nutritionExtractor->extract(imageUrls: $product->labelImageUrls);
        $this->writeDetails(extraction: $extraction, output: $output);

        if (!$extraction->isSuccessful()) {
            $output->writeln(messages: sprintf('<comment>Skip %s (%s): %s.</comment>', $product->barcode, $product->name, $extraction->status));

            return self::RESULT_SKIPPED;
        }

        return $this->upsert(product: $product, nutrition: $extraction->nutrition, output: $output);
    }

    private function writeDetails(NutritionExtraction $extraction, OutputInterface $output): void
    {
        if (!$this->showDetails) {
            return;
        }

        foreach ($extraction->notes as $note) {
            $output->writeln(messages: sprintf('<comment>  %s</comment>', $note));
        }
    }

    private function fetch(int $id, OutputInterface $output): ?MercadonaProduct
    {
        try {
            $product = $this->catalogProvider->fetchProduct(id: $id);
        } catch (MercadonaThrottledException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $output->writeln(messages: sprintf('<error>Product %d failed: %s</error>', $id, $e->getMessage()));

            return null;
        }

        if (null === $product) {
            $output->writeln(messages: sprintf('<comment>Skip %d: missing product identity.</comment>', $id));
        }

        return $product;
    }

    private function upsert(MercadonaProduct $product, MercadonaNutrition $nutrition, OutputInterface $output): int
    {
        try {
            $this->dispatchUpsert(product: $product, nutrition: new GlobalArticleNutrition(
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

            $output->writeln(messages: sprintf('<info>Imported %s (%s).</info>', $product->barcode, $product->name));

            return self::RESULT_UPSERTED;
        } catch (ExceptionInterface $e) {
            $output->writeln(messages: sprintf('<error>Upsert %s (%s) failed: %s</error>', $product->barcode, $product->name, $e->getMessage()));

            return self::RESULT_FAILED;
        }
    }

    private function refreshPricing(MercadonaProduct $product, OutputInterface $output): int
    {
        try {
            $this->dispatchUpsert(product: $product, nutrition: null);

            $output->writeln(messages: sprintf('<info>Repriced %s (%s): %s.</info>', $product->barcode, $product->name, $this->formatPrice(price: $product->price->unitPrice)));

            return self::RESULT_REPRICED;
        } catch (ExceptionInterface $e) {
            $output->writeln(messages: sprintf('<error>Repricing %s (%s) failed: %s</error>', $product->barcode, $product->name, $e->getMessage()));

            return self::RESULT_FAILED;
        }
    }

    private function dispatchUpsert(MercadonaProduct $product, ?GlobalArticleNutrition $nutrition): void
    {
        $envelope = $this->messageBus->dispatch(message: new UpsertGlobalArticleCommand(
            barcode: $product->barcode,
            name: $product->name,
            brand: $product->brand,
            categoryName: $product->categoryName,
            imageUrl: $product->imageUrl,
            quantity: $product->quantity,
            stores: self::STORE,
            pricing: MercadonaPricingMapper::toGlobalArticlePricing(price: $product->price),
            source: self::SOURCE,
            nutrition: $nutrition,
        ));

        $envelope->last(stampFqcn: HandledStamp::class);
    }

    private function formatPrice(?float $price): string
    {
        if (null === $price) {
            return 'no price';
        }

        return number_format($price, 2, ',', '').' €';
    }
}
