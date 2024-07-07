const pickerRouter = require('express').Router();
const picker = require('../controllers/contactPickerController');

pickerRouter.get('/dial',picker.dialPicker);
pickerRouter.get('/country',picker.countryPicker);
pickerRouter.get('/state',picker.statePicker);
pickerRouter.get('/city',picker.cityPicker)

module.exports=pickerRouter;