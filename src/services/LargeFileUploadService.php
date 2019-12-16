<?php namespace akulyk\upload\services;

class LargeFileUploadService{

    public function getFileHash($name, $size){
        return md5($name . $size);
    }

    public function addChunk($name, $size, $tempUploadedFile){
        $hash = $this->getFileHash($name, $size);
        $tmpFile = $this->buildFilePath($hash .'.tmp');
        if(!is_file($tempUploadedFile)){
            throw new \InvalidArgumentException("Temp file not found!");
        }
        $chunk = fopen($tempUploadedFile, "rb");
        $tmpResource = fopen($tmpFile, 'ab');
        stream_copy_to_stream($chunk, $tmpResource);
        fclose($chunk);
        fclose($tmpResource);
        return true;
    }

    public function getFileStartPosition($name, $size){
        $pos = 0;
        $hash = $this->getFileHash($name,$size);
        $tmpFile = $this->buildFilePath($hash .'.tmp');
        if(is_file($tmpFile)){
            $pos = filesize($tmpFile);
            if($pos === (int) $size){
                throw new \DomainException('Such file already loaded, but not renamed!');
            }
        }
        $fileInfo = pathinfo($name);
        $uploadedFile = $this->buildFilePath( $hash . '.' . $fileInfo['extension']);
        if(file_exists($uploadedFile)){
            throw new \DomainException('Such file already loaded!');
        }
        return $pos;
    }

    public function handleFileUploadFinished($name, $size){
        $hash = $this->getFileHash($name, $size);
        $fileInfo = pathinfo($name);
        $encodedFile = $this->buildFilePath($hash .'.tmp');
        $target = $this->buildFilePath( $hash . '.' . $fileInfo['extension']);

        return rename($encodedFile, $target);
    }

    protected function buildFilePath($file){
        return \Yii::getAlias('@runtime') . '/' . $file;
    }
}
