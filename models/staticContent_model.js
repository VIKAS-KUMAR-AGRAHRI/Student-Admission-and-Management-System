const mongoose = require('mongoose');
const schema = mongoose.Schema;
const statickey = new schema({
    type: {
        type: String
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },

},
    {
        timestamps: true
    })

module.exports = mongoose.model('static', statickey);
