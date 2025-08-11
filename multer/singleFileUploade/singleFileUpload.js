const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, "uploads/")
    },

    filename: function(req,file,cb){
        const filename = `${Date.now()} - ${file.originalname}`;
        cb(null, filename);
    }
})


const fileFilter = (req,file,cb) => {
if(file.mimetype.startsWith("image")){
    cb(null,true);
}else{
    cb(new Error("Only image file allowed"))
}
}


const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})



module.exports = upload