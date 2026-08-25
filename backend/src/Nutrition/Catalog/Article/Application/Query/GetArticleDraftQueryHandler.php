<?php

namespace Nutrition\Catalog\Article\Application\Query;

use Nutrition\Catalog\Article\Domain\Model\ArticleDraftSource;
use Nutrition\Catalog\Article\Domain\QueryModel\ArticleDraftGroundingNeedleDataQuery;
use Nutrition\Catalog\Article\Domain\QueryModel\Dto\GetArticleDraftResult;
use Nutrition\Catalog\Article\Domain\Service\ArticleDraftExtractor;
use Nutrition\Catalog\Article\Domain\Service\ArticleDraftQuotaGuard;
use Nutrition\Catalog\Article\Domain\Service\BarcodeReader;
use Nutrition\GlobalCatalog\Article\Domain\Model\GlobalArticleRepository;

final readonly class GetArticleDraftQueryHandler
{
    public function __construct(
        private BarcodeReader $barcodeReader,
        private GlobalArticleRepository $globalArticleRepository,
        private GlobalArticleDraftAssembler $globalArticleDraftAssembler,
        private ArticleDraftGroundingNeedleDataQuery $needleDataQuery,
        private ArticleDraftExtractor $articleDraftExtractor,
        private ArticleDraftQuotaGuard $quotaGuard,
    ) {
    }

    public function __invoke(GetArticleDraftQuery $query): GetArticleDraftResult
    {
        $barcode = $this->barcodeReader->read(photos: $query->photos);
        $globalArticle = null !== $barcode
            ? $this->globalArticleRepository->findByBarcode(barcode: $barcode)
            : null;

        if (null !== $globalArticle) {
            return new GetArticleDraftResult(
                source: ArticleDraftSource::GLOBAL_CATALOG,
                barcode: $barcode,
                globalArticleId: $globalArticle->id,
                draft: $this->globalArticleDraftAssembler->assemble(globalArticle: $globalArticle),
                lowConfidenceFields: [],
                notes: [sprintf('Barcode %s resolved from the global catalog: Gemini was not called.', $barcode)],
            );
        }

        $this->quotaGuard->consume(userId: $query->userSessionId);

        $extraction = $this->articleDraftExtractor->extract(
            photos: $query->photos,
            grounding: $this->needleDataQuery->load(),
        );

        if (!$extraction->isSuccessful()) {
            return new GetArticleDraftResult(
                source: ArticleDraftSource::NONE,
                barcode: $barcode,
                globalArticleId: null,
                draft: null,
                lowConfidenceFields: [],
                notes: $extraction->notes,
            );
        }

        return new GetArticleDraftResult(
            source: ArticleDraftSource::GEMINI,
            barcode: $barcode,
            globalArticleId: null,
            draft: $extraction->draft,
            lowConfidenceFields: $extraction->lowConfidenceFields,
            notes: $extraction->notes,
        );
    }
}
