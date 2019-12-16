<?php

namespace akulyk\upload\assets;

use yii\bootstrap\BootstrapAsset;
use yii\web\AssetBundle;

/**
 * Class UploadAsset
 * @package akulyk\upload\assets
 */
class UploadAsset extends AssetBundle
{
    public $sourcePath = '@akulyk/upload/resources';
    public $css = [

    ];
    public $js = [
        'js/upload.babel.min.js'
    ];
    public $depends = [
        BootstrapAsset::class,
    ];
}
