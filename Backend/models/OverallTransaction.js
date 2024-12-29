// import mongoose from 'mongoose';

// const overallTransactionSchema = new mongoose.Schema({
//     TransactionNumber: { type: String, required: true, unique: true },
//     total_amount: { type: Number, required: true },
//     members: [
//         {
//             userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//             share: { type: Number, required: true }
//         }
//     ],
//     image: { type: String, required: false },  // If you store the image URL
//     date: { type: Date, default: Date.now }  // Default to current date if not provided
// });

// const OverallTransaction = mongoose.model('OverallTransaction', overallTransactionSchema);

// export default OverallTransaction;


import mongoose from 'mongoose';

const overallTransactionSchema = new mongoose.Schema({
    transactionNumber: { type: String, required: true, unique: true },
    totalAmount: { type: Number, required: true },
    date: { type: Date, default: Date.now }, // Date of the transaction
    members: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            share: { type: Number, required: true }, // How much this user owes
        },
    ],
    paidBy: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amountPaid: { type: Number, required: true }, // How much this user contributed
        },
    ],
    description: { type: String, required: true }, // Description of the expense
});

const OverallTransaction = mongoose.model('OverallTransaction', overallTransactionSchema);

export default OverallTransaction;
