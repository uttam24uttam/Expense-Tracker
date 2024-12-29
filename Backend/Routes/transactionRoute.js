import express from "express";
import Transaction from "../models/transaction.js";
import { subDays } from 'date-fns';

const router = express.Router();

router.post('/add-transaction', async function (req, res) {
    try {
        console.log(" HAS BEEEEEEEN CALLED clear")
        console.log(`called TRACKING ${req.body}`);
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.send("Transaction Added Successfully");
    } catch (error) {
        res.status(500).json(error);
    }
});


router.post('/edit-transaction', async function (req, res) {
    try {

        await Transaction.findOneAndUpdate({ _id: req.body.transactionID }, req.body.payload)
        res.send("Transaction Updated Successfully");
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/delete-transaction', async function (req, res) {
    try {

        await Transaction.findOneAndDelete({ _id: req.body.transactionId })
        res.send("Transaction Deleted Successfully");
    } catch (error) {
        res.status(500).json(error);
    }
});


router.post('/get-all-transactions', async (req, res) => {
    try {
        const { userid, frequency, dateRange, type } = req.body;
        let transactions;

        if (frequency === '1') {
            transactions = await Transaction.find({
                userid: userid,
                ...(type !== 'all' ? { type } : {})
            });
        } else {
            transactions = await Transaction.find({
                userid: userid,
                ...(frequency !== "custom" ?
                    { date: { $gte: subDays(new Date(), Number(frequency)) } } :
                    { date: { $gte: dateRange[0], $lte: dateRange[1] } }
                ),
                ...(type !== 'all' ? { type } : {})
            });
        }

        res.send(transactions);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
});

export default router;
