import express from "express";
import friendTransaction from "../models/friendTransaction.js";
import User from "../models/user.js";
import moment from "moment";
import FriendBalance from '../models/FriendBalance.js';
import Settlement from "../models/Settlement.js";
import multer from 'multer';
import path from 'path';
import OverallTransaction from '../models/OverallTransaction.js';
import Transaction from "../models/transaction.js";


const router = express.Router();




//to ADd friend transactions and update balance_amount
router.post("/add", async (req, res) => {

    console.log("Received request at /add ");
    console.log("Request body:", req.body);

    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
        console.log("Invalid transactions data. Expecting an array.");
        return res.status(400).json({ message: "Invalid transactions data." });
    }

    console.log("Number of transactions received:", transactions.length);
    console.log("Transactions array:");

    transactions.forEach((transaction, index) => {
        console.log(`Transaction ${index + 1}:`, transaction);  //giving numbers to transactions fr
    });

    try {
        const transactionsWithNamesAndNumber = await Promise.all(   //iterate through all friendtransactions to add usernames
            transactions.map(async (transaction) => {
                const user1 = await User.findById(transaction.user1);
                const user2 = await User.findById(transaction.user2);

                const updatedTransaction = {
                    ...transaction,
                    user1Name: user1 ? user1.name : 'Unknown User',
                    user2Name: user2 ? user2.name : 'Unknown User',
                    TransactionNumber: transaction.TransactionNumber,
                };

                // Update FriendBalance
                if (transaction.amount < 0) {
                    await updateFriendBalance(transaction.user1, transaction.user2, Math.abs(transaction.amount));
                }

                return updatedTransaction;
            })
        );

        const savedTransactions = await friendTransaction.insertMany(transactionsWithNamesAndNumber);  //saving transactions

        res.status(201).json({
            message: "Transactions added successfully!",
            transactions: savedTransactions,
        });
    } catch (error) {
        console.error("Error saving transactions:", error);
        res.status(500).json({ message: "Failed to add transactions." });
    }
});

// function update the FriendBalance model
const updateFriendBalance = async (userId, friendId, amount) => {
    try {

        let friendBalance = await FriendBalance.findOne({ userId });
        console.log("FriendBalance for user1 found:", friendBalance);

        if (!friendBalance) {
            friendBalance = new FriendBalance({ userId, balances: [] }); //creating balancemodel 
        }

        const friendBalanceEntry = friendBalance.balances.find(
            (entry) => entry.friendId.toString() === friendId.toString()
        );
        console.log("FriendBalance entry found for user2:", friendBalanceEntry);

        if (!friendBalanceEntry) {
            friendBalance.balances.push({
                friendId,
                balanceAmount: Math.abs(amount), //abs value
            });
        } else {
            friendBalanceEntry.balanceAmount += Math.abs(amount); // update with abs value of the amount
        }

        await friendBalance.save(); //saving
        console.log("Updated FriendBalance for user1:", friendBalance);
    } catch (error) {
        console.error("Error updating FriendBalance:", error);
    }
};






//Fetch all friend transactions of a friend , for viwefriend page
//user id and friend id is passed in

router.get("/transactions/:userId/:friendId", async (req, res) => {
    const { userId, friendId } = req.params;

    try {
        // fetch transactions , where user1= user , user2=friend
        const transactions = await friendTransaction.find({
            $or: [
                { user1: userId, user2: friendId }
            ],
        }).lean();

        // Add balanceMessage
  const formattedTransactions = transactions.map((txn) => {
  const isUser1 = txn.user1.toString() === userId;
  const amount = Math.abs(txn.amount).toFixed(2);
  const balanceMessage = (isUser1 ? (txn.amount < 0 ? ` You borrowed ` : ` You lent `) : (txn.amount < 0 ? ` You lent ` : ` You borrowed `)); //if user & amount<0 , then borrowed , else lent


            return {
                ...txn,
                total_amount: txn.total_amount,
                balanceMessage,
                formattedDate: moment(txn.date).format("DD-MM-YYYY"),
                formattedTime: moment(txn.date).format("HH:mm"),
            };
        });


        //settlements being fetched, where user = payer/payee , friend =payer/payee
        const settlements = await Settlement.find({
            $or: [
                { payer: userId, payee: friendId },
                { payer: friendId, payee: userId },
            ],
        }).lean();

        // settlement transactions + friendTransactions
        const formattedSettlements = await Promise.all(
            settlements.map(async (settle) => {
                const payer = await User.findById(settle.payer).select("name"); //names
                const payee = await User.findById(settle.payee).select("name");

                const description = `${payer.name} settled ₹${settle.amount} with ${payee.name}`; //payer->payee,if payer=user/friend or payee==user/friend

                return {
                    _id: settle._id,
                    description: description,
                    date: settle.date,
                    amount: settle.amount,
                    total_amount: "",
                    balanceMessage: `${payer.name} Paid`, //paid messg
                    formattedDate: moment(settle.date).format("DD-MM-YYYY"),
                    formattedTime: moment(settle.date).format("HH:mm"),
                    category: "paid",
                };
            })
        );

        const allRecords = [...formattedTransactions, ...formattedSettlements];  //settlements + friendtransactions

        allRecords.sort((a, b) => new Date(b.date) - new Date(a.date)); //sorting all by dates , newest first

        res.status(200).json({ transactions: allRecords });

    } catch (error) {
        console.error("Error fetching transactions and settlements:", error);
        res.status(500).json({ message: "Failed to fetch data." });
    }
});




// balance calculation route
router.get("/balance/:userId/:friendId", async (req, res) => {
    console.log("FIXING BALANCE-1")
    try {
        const { userId, friendId } = req.params;

        console.log(`user ${userId} friend ${friendId}`);

        //user balance = user in friendbalance model
        //userFriendBalance =  friend's balance in user' acc
        //friend balance = friend in friendbalance model
        //frienduserbalance = user's balance in frined's acc

        const userBalance = await FriendBalance.findOne({ userId: userId });
        console.log(`userBalance: ${userBalance}`);

        let userFriendBalance = 0; // Default balance 
        console.log(`userFriendBalance-1: ${userFriendBalance}`);

        if (userBalance) {
            const balance = userBalance.balances.find(
                (balance) => balance.friendId.toString() === friendId
            );
            if (balance) {
                userFriendBalance = balance.balanceAmount;
            }
        }
        console.log(`userFriendBalance-2: ${userFriendBalance}`);
        // Fetch the balance of the friend's account (B)
        const friendBalance = await FriendBalance.findOne({ userId: friendId });
        console.log(`friendbalance ${friendBalance} `)

        let friendUserBalance = 0;

        if (friendBalance) {
            const balance = friendBalance.balances.find(
                (balance) => balance.friendId.toString() === userId
            );
            if (balance) {
                friendUserBalance = balance.balanceAmount;
            }
        }

        console.log(`user-friend-Balance ${userFriendBalance}`);
        console.log(`friend-user-Balance ${friendUserBalance}`);

        // Fetch the friend's details
        const friend = await User.findById(friendId);
        if (!friend) {
            return res.status(404).json({ message: "Friend not found." });
        }

        const friendName = friend.name;

        const balanceDifference = userFriendBalance - friendUserBalance;  //overall differece , user-friend
        let balanceMessage = '';

        if (balanceDifference > 0) { //diff>0 = overall diff greater for  user =  user owes friend
            balanceMessage = `You owe ${friendName} ₹${balanceDifference.toFixed(0)}`;
        } else if (balanceDifference < 0) {
            balanceMessage = `${friendName} owes you ₹${Math.abs(balanceDifference).toFixed(0)}`;
        } else {
            balanceMessage = `Everything is settled between you and ${friendName}.`;
        }

        res.status(200).json({
            balanceMessage,
        });
    } catch (error) {
        console.error("Error calculating balance:", error);
        res.status(500).json({ message: "Failed to calculate balance." });
    }
});


//SEttle up route 
router.post("/settle-up", async (req, res) => {
    const { userId, friendId, settleAmount } = req.body;

    try {
        // Update the balance
        const userBalance = await FriendBalance.findOne({ userId });

        if (!userBalance) {
            return res.status(404).json({ success: false, message: "Balance record not found." });
        }

        const friendBalance = userBalance.balances.find(
            (balance) => balance.friendId.toString() === friendId
        );

        if (!friendBalance) {
            return res.status(404).json({ success: false, message: "Friend balance not found." });
        }

        const userBalance2 = await FriendBalance.findOne({ userId: userId });
        let userFriendBalance2 = 0; // Default balance 

        if (userBalance2) {
            const balance2 = userBalance2.balances.find(
                (balance2) => balance2.friendId.toString() === friendId
            );
            if (balance2) {
                userFriendBalance2 = balance2.balanceAmount;
            }
        }
        // Fetch the balance of the friend's account (B)
        const friendBalance2 = await FriendBalance.findOne({ userId: friendId });

        let friendUserBalance2 = 0;

        if (friendBalance2) {
            const balance2 = friendBalance2.balances.find(
                (balance2) => balance2.friendId.toString() === userId
            );
            if (balance2) {
                friendUserBalance2 = balance2.balanceAmount;
            }
        }

        const balanceDifference2 = userFriendBalance2 - friendUserBalance2;


        // settlem amount has to be lesser than balancediff condition 
        console.log(`Settlement amount ${settleAmount} and user owes friend ${balanceDifference2}`)
        if (settleAmount > balanceDifference2) {
            console.log("TRUEEEE SIRRRRR")
            return res.status(400).json({
                success: false,
                message: "Settlement amount cannot be greater than the balance amount.",
            });
        }

        console.log("FALSEEEEEE SIRRRR")
        friendBalance.balanceAmount -= settleAmount;
        await userBalance.save();

        await Settlement.create({
            payer: userId,
            payee: friendId,
            amount: settleAmount,
        });

        res.status(200).json({ success: true, message: "Settlement successful." });
    } catch (error) {
        console.error("Error in settling up:", error);
        res.status(500).json({ success: false, message: "Settlement failed." });
    }
});



// Personal tracking 

router.post('/add-personal-tracking-transaction', async function (req, res) {
    console.log("PERSONAL HAS BEEEN CALLED clear")
    try {
        console.log(`PERSONAL TRACKING ${req.body}`);
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.send("Transaction Added Successfully");
    } catch (error) {
        res.status(500).json(error);
    }
});




export default router;




