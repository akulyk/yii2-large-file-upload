<?php

namespace akulyk\upload\controllers;

use akulyk\upload\models\FileDataForm;
use akulyk\upload\services\LargeFileUploadService;
use Yii;
use yii\helpers\Url;
use yii\web\Controller;
use yii\web\UploadedFile;

/**
 * Class UploadController
 * @package akulyk\upload\controllers
 */
class UploadController extends Controller
{

    /**
     * @var LargeFileUploadService
     */
    private $largeFileUploadService;

    public function __construct($id, $module,
                                LargeFileUploadService $largeFileUploadService,
                                $config = [])
    {

        $this->largeFileUploadService = $largeFileUploadService;
        parent::__construct($id, $module, $config);
    }

    /**
     * Displays homepage.
     *
     * @return mixed
     */
    public function actionIndex()
    {

        $beginUrl = Url::to([$this->module->id . '/upload/begin']);
        $uploadUrl = Url::to([$this->module->id . '/upload/upload']);
        $endUrl = Url::to([$this->module->id . '/upload/end']);
        $chunkSize = 2 * 1024 * 1024;
        $uploadTimeout = 30 *1000;
        return $this->render('index', [
            'chunkSize' => $chunkSize,
            'uploadTimeout' => $uploadTimeout,
            'beginUrl' => $beginUrl,
            'uploadUrl' => $uploadUrl,
            'endUrl' => $endUrl,
        ]);
    }

    public function actionUpload()
    {

        $request = \Yii::$app->request;
        $name = (string)$request->post('name');
        $size = (int)$request->post('size');
        $data = ['success' => true, 'name' => $name];

        if ($uploadedFile = UploadedFile::getInstanceByName('chunk')) {
            $model = new FileDataForm([
                FileDataForm::FIELD_NAME => $name,
                FileDataForm::FIELD_SIZE => $size,
            ]);

            if ($model->validate()) {
                try {
                    $this->largeFileUploadService->addChunk($name, $size, $uploadedFile->tempName);
                } catch (\Exception $e) {
                    $data['success'] = false;
                    $data['message'] = $e->getMessage();
                    Yii::error($e->getMessage());
                }
            } else {
                $data['success'] = false;
                $data['message'] = implode('<br>', $model->getFirstErrors());
            }
        } else {
            $data['success'] = false;
            $data['message'] = 'No file to process!';
        }
        return $this->asJson($data);
    }

    public function actionBegin()
    {
        $request = \Yii::$app->request;
        $name = $request->post('name');
        $size = $request->post('size');
        $model = new FileDataForm([
            FileDataForm::FIELD_NAME => $name,
            FileDataForm::FIELD_SIZE => $size,
        ]);

        if ($model->validate()) {
            try {
                $data['pos'] = $this->largeFileUploadService->getFileStartPosition($name, $size);
                $data['success'] = true;
            } catch (\Exception $e) {
                $data['success'] = false;
                $data['message'] = $e->getMessage();
                Yii::error($e->getMessage());
            }
        } else {
            $data['success'] = false;
            $data['message'] = implode('<br>', $model->getFirstErrors());
        }
        $data['model'] = $model;

        return $this->asJson($data);
    }

    public function actionEnd()
    {
        $request = \Yii::$app->request;
        $name = $request->post('name');
        $size = $request->post('size');
        $model = new FileDataForm([
            FileDataForm::FIELD_NAME => $name,
            FileDataForm::FIELD_SIZE => $size,
        ]);
        $data = [];
        if ($model->validate()) {
            try {
                $this->largeFileUploadService->handleFileUploadFinished($name, $size);
                $data['success'] = true;
            } catch (\Exception $e) {
                $data['success'] = false;
                $data['message'] = $e->getMessage();
                Yii::error($e->getMessage());
            }
        }else{
            $data['success'] = false;
            $data['message'] = implode('<br>', $model->getFirstErrors());
        }
        return $this->asJson($data);
    }

}
