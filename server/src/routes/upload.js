const express = require('express');

const router = express.Router();

// middleware to handle file uploads
const multer  = require('multer');
const fs = require('fs');

// where to store uploaded file
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    // generate unique folder name based on time of upload
    const folder = Date.now().toString();
    // create folder if not already there
    await fs.promises.mkdir('./uploads/' + folder, { recursive: true })
    cb(null, './uploads/' + folder) // where files will be saved
  },
  filename: function (req, file, cb) {
    // save file under original name
    cb(null, file.originalname);
  }
});

// file restrictions
const upload = multer({
  storage: storage,
  limits: { fileSize: 50000000 },    // accept max file size of abt 50MB (apparently avg wav file is 10MB per minute?)
  fileFilter: function (req, file, cb) {

    // log file info
    console.log(file);

    // check file type/extension; accept specified audio filetypes only
    const filetype = file.mimetype;
    const fileext = file.originalname.slice(-4);
    if ((filetype == 'audio/mpeg' 
        || filetype == 'audio/mp3' 
        || filetype == 'audio/wav' 
        || filetype == 'audio/ogg')
      && (fileext == '.mp3'
        || fileext == '.wav'
        || fileext == '.ogg')
    ) {
      return cb(null, true);
    } else {
      req.fileValidationError = "unsupported file type: file must be audio file with extension .mp3, .wav, or .ogg";
      return cb(null, false, req.fileValidationError);
    }
  },
});

// used to spawn a python3 process upon file upload
const { spawn } = require('child_process');

// process uploaded file and return path to resulting files
router.post('/', upload.single('audiofile'), (req, res) => {

  // if file was rejected, return error
  if (req.fileValidationError) {
    let errorMsg = req.fileValidationError;
    return res.status(500).send(errorMsg);
  }

  // log uploaded file details
  const file = req.file;
  console.log(file);

  // process uploaded file via python script (will likely take several minutes)
  const filename = file.filename;
  const destFolderPath = file.destination;
  // spawn new python3 process executing processing script
  const pyProcess = spawn('python3', [__dirname + '/../stem_splitter.py', destFolderPath, filename]);

  // whenever stdout buffer is flushed, append incoming data to output array
  let output = [];
  pyProcess.stdout.on("data", (data) => {
    // console.log(data.toString());
    output.push(data.toString().trim());
  });

  // called when python script finishes running
  pyProcess.on("close", () => {
    console.log('python script output: ');
    console.log(output);

    // // after processing is complete, send response with absolute path to stems
    // return res.status(200).json({
    //   stemFolderPath: output[output.length - 1],
    // });
  });

  const pathSplit = destFolderPath.split('/');
  const relativeFolderPath = '/' + pathSplit[pathSplit.length - 1] + '/htdemucs/' + filename.slice(0, -4) + '/';
  // after upload is complete and processing has started, send response with path to stems (relative to statically served uploads folder)
  return res.status(202).json({
    stemFolderPath: relativeFolderPath,
  });
});

module.exports = router;
