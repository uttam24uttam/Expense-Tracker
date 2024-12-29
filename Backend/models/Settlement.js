import mongoose from "mongoose";
 
const SettlementSchema = new mongoose.Schema({
    payer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    payee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});

const Settlement = mongoose.model("Settlement", SettlementSchema);
export default Settlement;
