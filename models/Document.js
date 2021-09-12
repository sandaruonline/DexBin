const mongoose = require("mongoose");

const documentScheme = new mongoose.Schema({
    value: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Document", documentScheme);