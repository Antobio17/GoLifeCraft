<?php

namespace Nutrition\Menu\Menu\Infrastructure\Domain\Service\Dompdf;

use Dompdf\Dompdf;
use Dompdf\Options;
use Nutrition\Menu\Menu\Domain\QueryModel\Dto\ExportMenuResult;
use Nutrition\Menu\Menu\Domain\Service\DocumentTheme;
use Nutrition\Menu\Menu\Domain\Service\MenuDocumentRenderer;
use Twig\Environment;

final readonly class DompdfMenuDocumentRenderer implements MenuDocumentRenderer
{
    private const TEMPLATE = '@MenuDocument/menu-document.html.twig';

    /** @var array<int, array{family: string, weight: int, file: string}> */
    private const FONTS = [
        ['family' => 'brand-display', 'weight' => 700, 'file' => 'BricolageGrotesque-Bold.ttf'],
        ['family' => 'brand-display', 'weight' => 800, 'file' => 'BricolageGrotesque-ExtraBold.ttf'],
        ['family' => 'brand-body', 'weight' => 400, 'file' => 'HankenGrotesk-Regular.ttf'],
        ['family' => 'brand-body', 'weight' => 600, 'file' => 'HankenGrotesk-SemiBold.ttf'],
        ['family' => 'brand-body', 'weight' => 700, 'file' => 'HankenGrotesk-Bold.ttf'],
    ];

    public function __construct(
        private Environment $twig,
        private string $fontDirectory,
        private string $cacheDirectory,
    ) {
    }

    public function render(ExportMenuResult $menu, string $locale, DocumentTheme $theme): string
    {
        $html = $this->twig->render(name: self::TEMPLATE, context: [
            'menu' => $menu,
            'locale' => $locale,
            'palette' => MenuDocumentPalette::forTheme(theme: $theme),
        ]);

        $dompdf = new Dompdf(options: $this->buildOptions());
        $this->registerFonts(dompdf: $dompdf);

        $dompdf->loadHtml(str: $html, encoding: 'UTF-8');
        $dompdf->setPaper(size: 'A4', orientation: 'portrait');
        $dompdf->render();

        return (string) $dompdf->output();
    }

    private function buildOptions(): Options
    {
        if (!is_dir(filename: $this->cacheDirectory)) {
            mkdir(directory: $this->cacheDirectory, permissions: 0o775, recursive: true);
        }

        $options = new Options();
        $options->setFontDir(fontDir: $this->cacheDirectory);
        $options->setFontCache(fontCache: $this->cacheDirectory);
        $options->setTempDir(tempDir: sys_get_temp_dir());
        $options->setChroot(chroot: [$this->fontDirectory]);
        $options->setIsRemoteEnabled(isRemoteEnabled: false);
        $options->setDefaultFont(defaultFont: 'brand-body');

        return $options;
    }

    private function registerFonts(Dompdf $dompdf): void
    {
        $fontMetrics = $dompdf->getFontMetrics();

        foreach (self::FONTS as $font) {
            $fontMetrics->registerFont(
                style: ['family' => $font['family'], 'weight' => $font['weight'], 'style' => 'normal'],
                remoteFile: $this->fontDirectory.'/'.$font['file'],
            );
        }
    }
}
