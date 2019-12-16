<?php namespace akulyk\upload\models;

use yii\base\Model;

/**
 * Class FileDataForm
 * @package akulyk\upload\models
 */
class FileDataForm extends Model
{
    const FIELD_NAME = 'name';
    const FIELD_SIZE = 'size';
    public $name;
    public $size;

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [[self::FIELD_NAME, self::FIELD_SIZE], 'required'],
            [[self::FIELD_NAME], 'string'],
            [[self::FIELD_SIZE], 'integer'],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            self::FIELD_NAME => 'File Name',
            self::FIELD_SIZE => 'File Size',
        ];
    }

    public function beforeValidate()
    {
        $this->name = pathinfo($this->name, PATHINFO_BASENAME);
        return parent::beforeValidate();
    }

}
