// const multer = require('multer');
// const storage = multer.diskStorage({
//     destination: function(req,file,cb){
//         cb(null, "uploads/")
//     },

//     filename: function(req,file,cb){
//         const filename = `${Date.now()} - ${file.originalname}`;
//         cb(null, filename);
//     }
// })


// const fileFilter = (req,file,cb) => {
// if(file.mimetype.startsWith("image")){
//     cb(null,true);
// }else{
//     cb(new Error("Only image file allowed"))
// }
// }


// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter
// })



// module.exports = upload



const multer = require("multer");

// Storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // all images will save inside /uploads folder
  },

  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter (only images allowed)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional: max 5MB per image
});

module.exports = upload;
