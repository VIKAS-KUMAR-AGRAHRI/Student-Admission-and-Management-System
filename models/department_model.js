const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        type: String,
        enum: ['CSE', 'MECH', 'EC', 'CL']
    }
});

const Student = mongoose.model('Student', studentSchema);
const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = { Student, Faculty };
