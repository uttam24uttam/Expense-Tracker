
import { message } from "antd";
import { v4 as uuidv4 } from 'uuid';

//balances for each participant
export const calculateExpenseBalances = (newExpense, user) => {
    const totalAmount = parseFloat(newExpense.totalAmount);
    const balances = {};

    balances[user._id] = 0; // User starts at 0

    //Split option calculations
    if (newExpense.splitOption === "percentage") {
        let totalPercentage = 0;
        newExpense.selectedFriends.forEach((friendId) => {
            totalPercentage += parseFloat(newExpense.splitDetails[friendId] || 0);
        });

        // if (totalPercentage !== 100) {
        //     message.error("Total percentage must equal 100.");
        //     throw new Error("Total percentage must equal 100.");
        // }

        //balances based on percentage
        newExpense.selectedFriends.forEach((friendId) => {
            balances[friendId] = (parseFloat(newExpense.splitDetails[friendId]) / 100) * totalAmount;
        });
    } else if (newExpense.splitOption === "manual") {
        let totalAssigned = 0;
        newExpense.selectedFriends.forEach((friendId) => {
            balances[friendId] = parseFloat(newExpense.splitDetails[friendId] || 0);
            totalAssigned += balances[friendId];
        });

        if (totalAssigned !== totalAmount) {
            message.error("The sum of manual amounts does not match the total.");
            throw new Error("The sum of manual amounts does not match the total.");
        }
    } else if (newExpense.splitOption === "equally") {
        const numberOfParticipants = newExpense.selectedFriends.length + 1; //include the user
        const equalShare = totalAmount / numberOfParticipants;

        balances[user._id] = equalShare;
        newExpense.selectedFriends.forEach((friendId) => {
            balances[friendId] = equalShare;
        });
    }

    // each member's balance = total paid - total owed 
    Object.keys(balances).forEach((memberId) => {
        const totalPaid = parseFloat(newExpense.amountsPaid[memberId] || 0);
        const totalOwed = parseFloat(balances[memberId] || 0);

        balances[memberId] = totalPaid - totalOwed;
    });

    console.log("Calculated balances:", balances);
    return balances;
};

export const settleBalances = (balances, totalAmount) => {
    const creditors = [];
    const debtors = [];

    // Spearate +ves and -ves
    Object.entries(balances).forEach(([memberId, balance]) => {
        if (balance > 0) {
            creditors.push({ memberId, balance });
        } else if (balance < 0) {
            debtors.push({ memberId, balance });
        }
    });

    // Sorting +vs and -vs
    creditors.sort((a, b) => b.balance - a.balance); //largest creditor first
    debtors.sort((a, b) => a.balance - b.balance);   //smallest debtor first

    const transactions = [];

    //settle balance Logic -> greedy algorithm
    while (creditors.length > 0 && debtors.length > 0) {
        const creditor = creditors[0];
        const debtor = debtors[0];

        const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

        transactions.push({
            payerId: debtor.memberId,
            payeeId: creditor.memberId,
            amount: -amount, //negative for payer
        });

        creditor.balance -= amount;
        debtor.balance += amount;

        if (creditor.balance === 0) creditors.shift();
        if (debtor.balance === 0) debtors.shift();
    }

    console.log("Settled transactions:", transactions);
    return transactions;
};

//GENERATE FRIEND TRANSACTIONS
export const generateFriendTransactions = (settledTransactions, newExpense) => {
    const friendTransactions = [];
    const transactionNumber = uuidv4(); // Generate a unique TransactionNumber

    const category = newExpense.category || "Uncategorized";

    //g4enerate indiivdual friend transactions
    settledTransactions.forEach(({ payerId, payeeId, amount }) => {
        friendTransactions.push({
            user1: payerId,
            user2: payeeId,
            amount, // Negative for payer (amount owed)
            date: newExpense.date || new Date(),
            total_amount: newExpense.totalAmount,
            TransactionNumber: transactionNumber,
            description: newExpense.description || "No description provided",
            category,
        });

        friendTransactions.push({
            user1: payeeId,
            user2: payerId,
            amount: -amount, // positive for payee (amount received)
            date: newExpense.date || new Date(),
            total_amount: newExpense.totalAmount,
            TransactionNumber: transactionNumber,
            description: newExpense.description || "No description provided",
            category,
        });
    });

    return friendTransactions;
};

//Post transactions to the backend
export const postTransactionsToBackend = async (transactions) => {
    try {
        const response = await fetch("http://localhost:5000/api/friend-transactions/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ transactions }),
        });

        const data = await response.json();
        if (response.ok) {
            message.success("Transactions added successfully!");
        } else {
            message.error(data.message || "Error adding transactions.");
        }
    } catch (error) {
        console.error(error);
        message.error("Error posting transactions to the server.");
    }
};

