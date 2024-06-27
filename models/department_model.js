const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const departmentSchema = new Schema({
    name: {
        type: String,
        enum: ['CSE', 'MECH', 'EC', 'CL', 'Accounts', 'HR', 'Admin', 'IT'],
        unique: true 
    },
    faculty: {
        type: Schema.Types.ObjectId,
        ref: 'Faculty' 
    }
});

// Define a schema for students
const studentSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user' 
    },
    department: {
        type: String,
        enum: ['CSE', 'MECH', 'EC', 'CL'] 
    }
});

// Define a schema for faculty
const facultySchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'user' 
    },
    department: {
        type: Schema.Types.ObjectId,
        ref: 'Department' 
    }
});

// Compile models from the schemas
const Department = mongoose.model('Department', departmentSchema);
const Student = mongoose.model('Student', studentSchema);
const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = { Department, Student, Faculty };
