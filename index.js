const dotenv=require('dotenv');
dotenv.config();
require('./db/connection')
const express = require('express');
const bodyParser = require('body-parser');
const studentRouter = require('./routers/student');
const adminRouter = require('./routers/admin');
const app = express();
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

//Here we write all route related 
app.use('/student',studentRouter);
app.use('/admin',adminRouter)



const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
