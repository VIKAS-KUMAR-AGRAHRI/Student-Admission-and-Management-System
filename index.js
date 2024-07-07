const dotenv=require('dotenv');
dotenv.config();
require('./db/connection')
const express = require('express');
const bodyParser = require('body-parser');
const studentRouter = require('./routers/student');
const adminRouter = require('./routers/admin');
const faculityRouter = require('./routers/subfaculty');
const pickerRouter = require('./routers/addressPicker');

const app = express();
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

//Here we write all route related 
app.use('/student',studentRouter);
app.use('/admin',adminRouter)
app.use('/faculity',faculityRouter)
app.use('/address',pickerRouter);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
