<?php

namespace Integration\OpenFoodFacts\Infrastructure\Application\Console;

use Integration\OpenFoodFacts\Domain\Model\OpenFoodFactsProduct;
use Integration\OpenFoodFacts\Domain\Service\OpenFoodFactsCatalogProvider;
use Nutrition\GlobalCatalog\Article\Application\Command\UpsertGlobalArticleCommand;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleNutrition;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticlePricing;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Messenger\Exception\ExceptionInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\HandledStamp;

final class SyncOpenFoodFactsCatalogCommand extends Command
{
    private const string SOURCE = 'openfoodfacts';

    public function __construct(
        private readonly OpenFoodFactsCatalogProvider $catalogProvider,
        private readonly MessageBusInterface $messageBus,
    ) {
        parent::__construct(name: 'app:catalog:sync-openfoodfacts');
    }

    protected function configure(): void
    {
        $this
            ->setDescription(description: 'Sync the global product catalog from OpenFoodFacts.')
            ->addOption(name: 'pages', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Number of pages to fetch.', default: '1')
            ->addOption(name: 'page-size', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Products per page.', default: '100')
            ->addOption(name: 'start-page', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'First page to fetch.', default: '1')
            ->addOption(name: 'delay', shortcut: null, mode: InputOption::VALUE_REQUIRED, description: 'Seconds to wait between pages (OpenFoodFacts search allows ~10 req/min).', default: '10');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $pages = max(1, (int) $input->getOption('pages'));
        $pageSize = max(1, (int) $input->getOption('page-size'));
        $startPage = max(1, (int) $input->getOption('start-page'));
        $delay = max(0, (int) $input->getOption('delay'));

        $upserted = 0;
        $failed = 0;

        for ($page = $startPage; $page < $startPage + $pages; ++$page) {
            if ($page > $startPage && $delay > 0) {
                sleep($delay);
            }

            try {
                $products = $this->catalogProvider->fetchPage(page: $page, pageSize: $pageSize);
            } catch (\Throwable $e) {
                $output->writeln(messages: sprintf('<error>Page %d failed: %s</error>', $page, $e->getMessage()));
                continue;
            }

            if (empty($products)) {
                $output->writeln(messages: sprintf('<comment>No products returned on page %d. Stopping.</comment>', $page));
                break;
            }

            $output->writeln(messages: sprintf('<info>Page %d:</info> %d products', $page, count($products)));

            foreach ($products as $product) {
                if ($this->upsert(product: $product, output: $output)) {
                    ++$upserted;
                    continue;
                }

                ++$failed;
            }
        }

        $output->writeln(messages: sprintf('<comment>Done. Upserted: %d, Failed: %d</comment>', $upserted, $failed));

        return Command::SUCCESS;
    }

    private function upsert(OpenFoodFactsProduct $product, OutputInterface $output): bool
    {
        try {
            $envelope = $this->messageBus->dispatch(message: new UpsertGlobalArticleCommand(
                barcode: $product->barcode,
                name: $product->name,
                brand: $product->brand,
                categoryName: $product->categoryName,
                imageUrl: $product->imageUrl,
                quantity: $product->quantity,
                stores: $product->stores,
                pricing: GlobalArticlePricing::empty(),
                source: self::SOURCE,
                nutrition: new GlobalArticleNutrition(
                    referenceAmount: $product->referenceAmount,
                    calories: $product->calories,
                    protein: $product->protein,
                    carbs: $product->carbs,
                    sugars: $product->sugars,
                    fat: $product->fat,
                    saturatedFat: $product->saturatedFat,
                    fiber: $product->fiber,
                    salt: $product->salt,
                ),
            ));

            $envelope->last(stampFqcn: HandledStamp::class);

            return true;
        } catch (ExceptionInterface $e) {
            $output->writeln(messages: sprintf('<error>Failed %s (%s): %s</error>', $product->barcode, $product->name, $e->getMessage()));

            return false;
        }
    }
}
