<?php

namespace akulyk\upload;

use Yii;



class Module extends \yii\base\Module
{
    public $controllerNamespace = 'akulyk\upload\controllers';

    public function __construct($id, $parent = null, array $config = [])
    {
        parent::__construct($id, $parent, $config);
    }

    public function init()
    {
        parent::init();

    }

}
