import React, { useState } from "react";
import { Modal, Input, DatePicker, Radio, Select, message, Button } from "antd";
import { WalletOutlined, ShoppingCartOutlined, CoffeeOutlined, RocketOutlined, CreditCardOutlined, HomeOutlined, CarOutlined, AccountBookOutlined, GiftOutlined } from "@ant-design/icons";
import axios from 'axios';

//for balances and transactions
import {
    calculateExpenseBalances,
    settleBalances,
    generateFriendTransactions,
    postTransactionsToBackend,
} from "./FriendExpenseLogic";

function AddFriendExpense({ friends, visible, onCancel, onExpenseAdded, okText }) {
    const user = JSON.parse(localStorage.getItem("User")); //fetch current usrr

    const [newExpense, setNewExpense] = useState({
        description: "",
        totalAmount: "",
        paidBy: user._id, //default paidBy=current user
        splitOption: "percentage",
        splitDetails: {},
        date: null,
        selectedFriends: [], //selected friends to split
        whoPaid: [],
        amountsPaid: {}, //how much each person paid
        category: "", //category
        addToPersonalFinance: false, //whether to add to personal finance
    });

    const categories = [
        { label: "Groceries", value: "groceries", icon: <ShoppingCartOutlined /> },
        { label: "Food & Drinks", value: "food_drinks", icon: <CoffeeOutlined /> },
        { label: "Entertainment", value: "entertainment", icon: <AccountBookOutlined /> },
        { label: "Travel", value: "travel", icon: <RocketOutlined /> },
        { label: "Shopping", value: "shopping", icon: <CreditCardOutlined /> },
        { label: "Rent", value: "rent", icon: <HomeOutlined /> },
        { label: "Transportation", value: "transportation", icon: <CarOutlined /> },
        { label: "Gifts", value: "gifts", icon: <GiftOutlined /> },
        { label: "Others", value: "others", icon: <WalletOutlined /> },
    ];


    // handleAddExpense function
    const handleAddExpense = async () => {
        try {
            //mandatory fields 
            if (!newExpense.description || !newExpense.totalAmount || !newExpense.date || newExpense.selectedFriends.length === 0 || !newExpense.category) {
                message.error("Please fill all required fields.");
                return;
            }

            //the balances based on the user's input
            const balances = calculateExpenseBalances(newExpense, user);

            const settledTransactions = settleBalances(balances);
            const transactions = generateFriendTransactions(settledTransactions, newExpense);

            await postTransactionsToBackend(transactions);

            //if the user wants to add this expense to their personal finance tracking
            if (newExpense.addToPersonalFinance) {
                // Send the personal finance info to the backend
                const personalFinanceTransaction = {
                    userid: user._id,
                    let amount;
                    if (newExpense.splitOption === "percentage") {
                         amount = (parseFloat(newExpense.splitDetails[user._id] || 0) / 100) * parseFloat(newExpense.totalAmount);
                   } else if (newExpense.splitOption === "manual") {
                        amount = parseFloat(newExpense.splitDetails[user._id] || 0);
                   } else {
                       amount = parseFloat(newExpense.totalAmount) / (newExpense.selectedFriends.length + 1);
                   }

                    type: "expense",
                    category: newExpense.category,
                    description: newExpense.description,
                    date: newExpense.date,
                };

                //Sending personal finance transaction to backend
                await axios.post("api/friend-transactions/add-personal-tracking-transaction", personalFinanceTransaction);

                message.success("Personal finance transaction added successfully!");
            }

            onExpenseAdded();
            onCancel();
        } catch (error) {
            console.error(error);
            message.error("Error adding expense.");
        }
    };

    return (
        <Modal
            title="Add Expense"
            visible={visible}
            onCancel={onCancel}
            onOk={handleAddExpense}
            width={600}
        >
            <Input
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) =>
                    setNewExpense({ ...newExpense, description: e.target.value })
                }
                className="mb-2"
                required
            />
            <Input
                placeholder="Total Amount"
                type="number"
                value={newExpense.totalAmount}
                onChange={(e) =>
                    setNewExpense({ ...newExpense, totalAmount: e.target.value })
                }
                className="mb-2"
                required
            />
            <DatePicker
                className="w-full mb-2"
                onChange={(date) => setNewExpense({ ...newExpense, date })}
                required
            />

            {/* Category Selection */}
            <div className="mb-2">
                <p>Category:</p>
                <Select
                    placeholder="Select category"
                    value={newExpense.category}
                    onChange={(value) =>
                        setNewExpense({ ...newExpense, category: value })
                    }
                    style={{ width: "100%" }}
                    required
                >
                    {categories.map((category) => (
                        <Select.Option key={category.value} value={category.value}>
                            {category.icon} {category.label}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {/* Split bw Friends */}
            <div className="mb-2">
                <p>Split Between You and:</p>
                <Select
                    mode="multiple"
                    placeholder="Select friends to split with"
                    value={newExpense.selectedFriends}
                    onChange={(value) =>
                        setNewExpense({ ...newExpense, selectedFriends: value })
                    }
                    style={{ width: "100%" }}
                    required
                >
                    {friends.map((friend) => (
                        <Select.Option key={friend._id} value={friend._id}>
                            {friend.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {/* Who Paid Option */}
            <div className="mb-2">
                <p>Who Paid?</p>
                <Select
                    mode="multiple"
                    value={newExpense.whoPaid}
                    onChange={(value) =>
                        setNewExpense({ ...newExpense, whoPaid: value })
                    }
                    style={{ width: "100%" }}
                    required
                >
                    <Select.Option value={user._id}>You</Select.Option> {/* Display YOU */}
                    {newExpense.selectedFriends.map((friendId) => {
                        const friend = friends.find((f) => f._id === friendId);
                        return (
                            <Select.Option key={friendId} value={friendId}>
                                {friend.name}
                            </Select.Option>
                        );
                    })}
                </Select>
            </div>

            {/*Amount Paid*/}
            {newExpense.whoPaid.length > 0 && (
                <div className="mb-2">
                <p>Enter Amount Paid by Each:</p>
                {newExpense.whoPaid.map((id) => (
                 <Input
                    key={id}
                    type="number"
                    value={newExpense.amountsPaid[id] || ""}
                    placeholder={`Amount paid by ${id === user._id ? "You" : friends.find(friend => friend._id === id)?.name}`}
                    onChange={(e) =>
                      setNewExpense({
                      ...newExpense,
                      amountsPaid: {
                        ...newExpense.amountsPaid,
                        [id]: e.target.value,
                            },
                        })
                         }
                      className="mb-2"
                      required
                        />
                    ))}
                </div>
            )}

            {/* Adjust Split  */}
            <div>
                <p>Adjust Split Method:</p>
                <Radio.Group
                    value={newExpense.splitOption}
                    onChange={(e) =>
                        setNewExpense({ ...newExpense, splitOption: e.target.value })
                    }
                >
                    <Radio value="percentage">Percentage</Radio>
                    <Radio value="manual">Manual Amount</Radio>
                    <Radio value="equally">Equally</Radio> {/* Option for Equal Split */}
                </Radio.Group>
                <div className="mt-2">
                    {newExpense.splitOption === "percentage" ? (
                <>
                    {newExpense.selectedFriends.map((friendId) => (
                        <Input
                            key={friendId}
                            placeholder={`Percentage for ${friends.find(friend => friend._id === friendId)?.name}`}
                            type="number"
                            value={newExpense.splitDetails[friendId] || ""}
                            onChange={(e) =>
                                setNewExpense({
                                    ...newExpense,
                                    splitDetails: {
                                    ...newExpense.splitDetails,
                                    [friendId]: e.target.value,
                                            },
                                        })
                                    }
                                    className="mb-2"
                                />
                            ))}
                         <Input
                            placeholder="Your Percentage"
                            type="number"
                            value={newExpense.splitDetails[user._id] || ""}
                            onChange={(e) =>
                            setNewExpense({
                                ...newExpense,
                                splitDetails: {
                                ...newExpense.splitDetails,
                                [user._id]: e.target.value,
                                        },
                                    })
                                }
                                className="mb-2"
                            />
                        </>
                    ) : newExpense.splitOption === "manual" ? (
                        <>
                    {newExpense.selectedFriends.map((friendId) => (
                         <Input
                            key={friendId}
                            placeholder={`Amount for ${friends.find(friend => friend._id === friendId)?.name}`}
                            type="number"
                            value={newExpense.splitDetails[friendId] || ""}
                            onChange={(e) =>
                                setNewExpense({
                                ...newExpense,
                                splitDetails: {
                                ...newExpense.splitDetails,
                                [friendId]: e.target.value,
                                        },
                                    })
                                }
                            className="mb-2"
                                />
                            ))}
                            <Input
                                placeholder="Your Share"
                                type="number"
                                value={newExpense.splitDetails[user._id] || ""}
                                onChange={(e) =>
                                  setNewExpense({
                                  ...newExpense,
                                  splitDetails: {
                                  ...newExpense.splitDetails,
                                  [user._id]: e.target.value,
                                        },
                                    })
                                }
                                className="mb-2"
                            />
                        </>
                    ) : (
                        <>
                            <p>Each participant gets an equal share: Rs. {(parseFloat(newExpense.totalAmount) / (newExpense.selectedFriends.length + 1)).toFixed(2)}</p>
                        </>
                    )}
                </div>
            </div>

            {/* personal finance tracking */}
            <div className="mb-2">
                <p>Do you want to Add your share into your personal finance tracking?</p>
                <Select
                    value={newExpense.addToPersonalFinance}
                    onChange={(value) =>
                        setNewExpense({ ...newExpense, addToPersonalFinance: value })
                    }
                    style={{ width: "100%" }}
                >
                    <Select.Option value={true}>Yes</Select.Option>
                    <Select.Option value={false}>No</Select.Option>
                </Select>
            </div>
        </Modal>
    );
}

export default AddFriendExpense;
