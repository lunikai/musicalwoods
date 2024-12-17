const express = require('express');

const app = express();
const PORT = process.env.PORT || 8000;

// only allow clients in whitelist to access server
const cors = require('cors');
const whitelist = ['http://localhost:3000'];
const options = {
  origin: whitelist,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(options));

// serve static files to client
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));    // stores user-uploaded files

// route requests to /upload to uploadRouter
const uploadRouter = require('./routes/upload');
app.use('/upload', uploadRouter);

// listen for requests on designated port
app.listen(PORT, () => 
  console.log(`Server listening on port: ${PORT}`)
);