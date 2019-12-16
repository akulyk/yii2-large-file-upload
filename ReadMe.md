# Large file upload
## Yii2 extension

### Instruction

Add to config file to module section
```
...
uploader =>[
    'class' => 'akulyk\upload\Module',
],
```

Route: `/uploader/upload/index`

All files will be saved to `runtime` folder.

Module can continue upload process when user lost connection
or server gone away.
