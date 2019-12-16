<?php

use akulyk\upload\assets\UploadAsset;
use yii\helpers\Html;
use yii\widgets\ActiveForm;
/* @var $this yii\web\View
 * @var ActiveForm $form
 * @var integer $chunkSize
 * @var integer $uploadTimeout
 * @var string $beginUrl
 * @var string $uploadUrl
 * @var string $endUrl
 */

UploadAsset::register($this);
?>
<div class="site-index">
    <div class="row">
        <div class="col-md-12">
            <div class="alert alert-success" role="alert" style="display: none">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <div class="alert-content"></div>
            </div>
            <div class="alert alert-danger" role="alert" style="display: none">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <div class="alert-content"></div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-6">
            <?php $form = ActiveForm::begin(); ?>
            <div class="form-group">
                <?= Html::fileInput('file', null, [
                    'class' => 'form-control',
                    'data' => [
                        'large_file' => 1,
                        'chunk_size' => $chunkSize,
                        'upload_timeout' => $uploadTimeout,
                        'begin_url' => $beginUrl,
                        'upload_url' => $uploadUrl,
                        'end_url' => $endUrl,
                    ]
                ]); ?>
            </div>
            <button type="button" data-send="1" class="btn btn-primary">Send</button>
            <button type="reset" data-send="1" class="btn btn-warning">Reset</button>
            <?php $form::end(); ?>
        </div>
    </div>
    <br>
    <div class="row">
        <div class="col-md-12">
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="25" aria-valuemin="0"
                     aria-valuemax="100"></div>
            </div>
        </div>
    </div>
</div>

