const express=require('express');
const videoController=require("../controllers/video")
const router = express.Router();
const upload = require('../middlewares/upload-file')
router.get('/getAll',videoController.getAll);
router.delete('/delete/:id',videoController.deleteOne);
// router.get('/getOne/:id',crudController.getOne);
router.post('/uploadVideo',upload.single('video'),videoController.addVideo);
// router.delete('/delete/:id',crudController.deleteOne);
// router.patch('/update/:id',crudController.updateOne);

module.exports = router;