import mongoose from 'mongoose';

const friendTransactionSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    total_amount: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    user1Name: {
        type: String,
        required: true
    },
    user2Name: {
        type: String,
        required: true
    },
    TransactionNumber: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: "Uncategorized"
    },
});

const FriendTransaction = mongoose.model('FriendTransaction', friendTransactionSchema);

export default FriendTransaction;


