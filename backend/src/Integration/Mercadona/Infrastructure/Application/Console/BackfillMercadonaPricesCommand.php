<?php

namespace Integration\Mercadona\Infrastructure\Application\Console;

use Integration\Mercadona\Domain\Exception\MercadonaThrottledException;
use Integration\Mercadona\Domain\Model\MercadonaProduct;
use Integration\Mercadona\Domain\Service\MercadonaCatalogProvider;
use Integration\Mercadona\Domain\Service\MercadonaImportQueue;
use Integration\Mercadona\Domain\Service\MissingPriceRegistry;
use Nutrition\GlobalCatalog\Article\Application\Command\UpsertGlobalArticleCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Messenger\Exception\ExceptionInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\HandledStamp;

final class BackfillMercadonaPricesCommand extends Command
{
    private const string SOURCE = 'mercadona';
    private const string STORE = 'Mercadona';
    private const int RESULT_PRICED = 1;
    private const int RESULT_ALREADY_PRICED = 2;
    private const int RESULT_UNKNOWN = 3;
    private const int RESULT_WITHOUT_PRICE = 4;
    private const int RESULT_FAILED = 5;

    public function __construct(
        private readonly MercadonaCatalogProvider $catalogProvider,
        private readonly MissingPriceRegistry $missingPriceRegistry,
        private readonly MercadonaImportQueue $priceQueue,
        private readonly MessageBusInterface $messageBus,
    ) {
        parent::__construct(name: 'app:catalog:backfill-mercadona-prices');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Fill in the missing prices of global articles already imported from Mercadona. It walks the catalog with its own cursor, without touching nutrition, so it can run alongside app:catalog:sync-mercadona. On throttling it stops cleanly and resumes on the next run.')
            ->addOption(name: 'category', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Limit discovery to a single top-level category id (only used when initializing the queue).', default: null)
            ->addOption(name: 'limit', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Max number of products to check in this run.', default: '5')
            ->addOption(name: 'scan', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Max number of subcategories to explore in this run when the pending buffer is low.', default: '1')
            ->addOption(name: 'delay', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Milliseconds to wait between product requests.', default: '500')
            ->addOption(name: 'refresh', shortcut: null, mode: InputOption::VALUE_NONE, description: 'Reset the cursor and walk the catalog from scratch.')
            ->addOption(name: 'force', shortcut: null, mode: InputOption::VALUE_NONE, description: 'Also overwrite the price of global articles that already have one.');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $categoryId = null !== $input->getOption('category') ? (int) $input->getOption('category') : null;
        $limit = max(1, (int) $input->getOption('limit'));
        $scanLimit = max(0, (int) $input->getOption('scan'));
        $delayMilliseconds = max(0, (int) $input->getOption('delay'));
        $force = (bool) $input->getOption('force');

        if ((bool) $input->getOption('refresh')) {
            $this->priceQueue->reset();
        }

        try {
            $this->initializeIfNeeded(categoryId: $categoryId, output: $output);
            $this->fillBuffer(limit: $limit, scanLimit: $scanLimit, output: $output);
            $this->backfillPending(limit: $limit, delayMilliseconds: $delayMilliseconds, force: $force, output: $output);
        } catch (MercadonaThrottledException $e) {
            $output->writeln(messages: sprintf('<comment>Throttled: %s Stopping; will resume on the next run.</comment>', $e->getMessage()));

            return Command::FAILURE;
        }

        $this->reportPending(output: $output);

        return Command::SUCCESS;
    }

    private function initializeIfNeeded(?int $categoryId, OutputInterface $output): void
    {
        if ($this->priceQueue->isInitialized()) {
            return;
        }

        $subcategoryIds = $this->catalogProvider->listSubcategoryIds(categoryId: $categoryId);
        $this->priceQueue->initialize(subcategoryIds: $subcategoryIds);

        $output->writeln(messages: sprintf('<info>Price backfill started: %d subcategories to walk, %d global articles without price.</info>', count($subcategoryIds), $this->missingPriceRegistry->countMissingPricing()));
    }

    private function fillBuffer(int $limit, int $scanLimit, OutputInterface $output): void
    {
        $scanned = 0;

        while ($scanned < $scanLimit
            && $this->priceQueue->pendingProducts() < $limit
            && null !== ($subcategoryId = $this->priceQueue->peekSubcategory())
        ) {
            $productIds = $this->catalogProvider->listProductIdsInSubcategory(subcategoryId: $subcategoryId);
            $this->priceQueue->enqueueProducts(productIds: $productIds);
            $this->priceQueue->markSubcategoryScanned(subcategoryId: $subcategoryId);
            ++$scanned;

            $output->writeln(messages: sprintf('<info>Subcategory %d walked: +%d products (pending: %d).</info>', $subcategoryId, count($productIds), $this->priceQueue->pendingProducts()));
        }
    }

    private function backfillPending(int $limit, int $delayMilliseconds, bool $force, OutputInterface $output): void
    {
        $priced = 0;
        $alreadyPriced = 0;
        $unknown = 0;
        $withoutPrice = 0;
        $failed = 0;

        for ($processed = 0; $processed < $limit; ++$processed) {
            $productId = $this->priceQueue->peekProduct();
            if (null === $productId) {
                break;
            }

            if ($processed > 0 && $delayMilliseconds > 0) {
                usleep($delayMilliseconds * 1000);
            }

            $result = $this->process(id: $productId, force: $force, output: $output);
            $this->priceQueue->markProductProcessed(productId: $productId);

            match ($result) {
                self::RESULT_PRICED => ++$priced,
                self::RESULT_ALREADY_PRICED => ++$alreadyPriced,
                self::RESULT_UNKNOWN => ++$unknown,
                self::RESULT_WITHOUT_PRICE => ++$withoutPrice,
                default => ++$failed,
            };
        }

        $output->writeln(messages: sprintf('<comment>Run done. Priced: %d, Already priced: %d, Not in catalog: %d, Without price at Mercadona: %d, Failed: %d</comment>', $priced, $alreadyPriced, $unknown, $withoutPrice, $failed));
    }

    private function reportPending(OutputInterface $output): void
    {
        $pendingProducts = $this->priceQueue->pendingProducts();
        $pendingSubcategories = $this->priceQueue->pendingSubcategories();

        if (0 === $pendingProducts && 0 === $pendingSubcategories) {
            $output->writeln(messages: sprintf('<info>Catalog walked. Global articles still without price: %d. Run with --refresh to walk again.</info>', $this->missingPriceRegistry->countMissingPricing()));

            return;
        }

        $output->writeln(messages: sprintf('<comment>Pending: %d products, %d subcategories, %d global articles without price.</comment>', $pendingProducts, $pendingSubcategories, $this->missingPriceRegistry->countMissingPricing()));
    }

    private function process(int $id, bool $force, OutputInterface $output): int
    {
        $product = $this->fetch(id: $id, output: $output);
        if (null === $product) {
            return self::RESULT_FAILED;
        }

        if (!$this->missingPriceRegistry->isKnown(barcode: $product->barcode)) {
            return self::RESULT_UNKNOWN;
        }

        if (!$force && !$this->missingPriceRegistry->needsPricing(barcode: $product->barcode)) {
            return self::RESULT_ALREADY_PRICED;
        }

        if (null === $product->price->unitPrice) {
            $output->writeln(messages: sprintf('<comment>Skip %s (%s): Mercadona returned no price.</comment>', $product->barcode, $product->name));

            return self::RESULT_WITHOUT_PRICE;
        }

        return $this->setPricing(product: $product, output: $output);
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

    private function setPricing(MercadonaProduct $product, OutputInterface $output): int
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
                pricing: MercadonaPricingMapper::toGlobalArticlePricing(price: $product->price),
                source: self::SOURCE,
                nutrition: null,
            ));

            $envelope->last(stampFqcn: HandledStamp::class);

            $output->writeln(messages: sprintf('<info>Priced %s (%s): %s €.</info>', $product->barcode, $product->name, number_format($product->price->unitPrice, 2, ',', '')));

            return self::RESULT_PRICED;
        } catch (ExceptionInterface $e) {
            $output->writeln(messages: sprintf('<error>Pricing %s (%s) failed: %s</error>', $product->barcode, $product->name, $e->getMessage()));

            return self::RESULT_FAILED;
        }
    }
}
