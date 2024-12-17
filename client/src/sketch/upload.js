import axios from 'axios';
import API_BASE from '../paths/api';
import UPLOADS from '../paths/user-uploads';

// trigger file upload sequence
/////////////// also add file validation at both client and server!!! STILL NEED TO DO CLIENT SIDEEEE
const uploadFile = (requestCallback, successCallback, failureCallback) => {

  // create file input element
  let input = document.createElement('input');
  input.type = 'file';
  
  input.onchange = (e) => {

    // function called when file upload request is made
    requestCallback();

    // reference to first selected file
    let file = e.target.files[0];

    let formData = new FormData();
    formData.append("audiofile", file);
    
    // send upload request to server
    axios
      .post(API_BASE + 'upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((response) => {    // upload completed
        console.log('upload completed');
        console.log(response);
        // wait here and periodically check for processing completion
        const fileCheckingInterval = setInterval(() => {
          // check if stem files have been created on server
          let filePath = UPLOADS + response.data.stemFolderPath;
          axios
            .get(filePath + 'vocals.wav')    // kinda assuming vocals is the last file to be created since it comes last alphabetically...
            .then((response) => {
              console.log('processing complete');
              clearInterval(fileCheckingInterval);
              
              // callback with path to uploaded files
              successCallback(filePath);
            })
            .catch((error) => {
              // console.log(error);
              console.log('processing upload...');
            });

        }, 10000);
      })
      .catch((error) => {    // upload failed
        console.log(error);
        failureCallback();
      });
  }

  // trigger the file upload window
  input.click();
  console.log('file selection window opened');
};

export default uploadFile;