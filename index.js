const dotenv=require('dotenv');
dotenv.config();
require('./db/connection')
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

//Here we write all route related 



const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
