<?php

$finder = (new PhpCsFixer\Finder())
    ->in(dirs: __DIR__)
    ->exclude(dirs: 'var')
;

return (new PhpCsFixer\Config())
    ->setRules([
        '@Symfony' => true,
        'method_argument_space' => [
            'on_multiline' => 'ensure_fully_multiline',
        ],
        'single_line_throw' => false,
    ])
    ->setFinder($finder)
;
