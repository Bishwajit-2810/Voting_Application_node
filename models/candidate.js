const mongoose = require("mongoose");
const User = require("./user");

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    age: {
        type: Number,
        require: true
    },
    party: {
        type: String,
        require: true
    },
    votes: [
        {
            user: {
                require: true,
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            votedAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    voteCount:{
        type:Number,
        default: 0,
        require:true
    }

})

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate