<?php

namespace Nutrition\Catalog\Article\Domain\Model;

enum ArticleDraftSource: string
{
    case GLOBAL_CATALOG = 'global';
    case GEMINI = 'gemini';
    case NONE = 'none';
}
