import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({

    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    friendID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    balance: {
        type: Number,
        default: 0
    },

    description: {
        type: String,
        default: ""
    }
})

const friendModel = mongoose.model("Friends", friendSchema);
export default friendModel;