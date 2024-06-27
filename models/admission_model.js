const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for college admission
const admissionSchema = new Schema({
    user_id:{
        type: Schema.Types.ObjectId,
        ref:'user'
    },
    personalInfo: {
        fullName: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            required: true
        },
        nationality: {
            type: String,
            required: true
        }
    },
    contactInfo: {
        permanentAddress: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        }
    },
    academicInfo: {
        previouseCollege: {
            institutionName: {
                type: String,
                required: true
            },
            completionYear: {
                type: Number,
                required: true
            },
            grades: {
                type: String,
                required: true
            }
        },
        entranceExam: {
            examName: {
                type: String
            },
            score: {
                type: Number
            },
            rank: {
                type: Number
            }
        }
    },
    courseInfo: {
        program: {
            type: String,
            required: true
        },
        preferredCourse: {
            type: String,
            required: true,
            enum: ['CSE', 'MECH', 'EC', 'CL'] 
        }
    },
    guardianInfo: {
        fatherName: {
            type: String,
            required: true
        },
        motherName: {
            type: String,
            required: true
        },
        guardianContactNumber: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    form_status:{
        type:String,
        enum:['APPROVED','PENDING'],
        default:'PENDING'
    }
});

const Admission = mongoose.model('Admission', admissionSchema);

module.exports = Admission;
