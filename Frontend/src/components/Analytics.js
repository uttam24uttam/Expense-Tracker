import React from 'react';
import { Progress } from 'antd';

function Analytics({ transactions }) {

    const totalTransactions = transactions.length;
    const totalExpenseTransactions = transactions.filter(transaction => transaction.type === 'expense').length;
    const totalIncomeTransactions = transactions.filter(transaction => transaction.type === 'income').length;
    const totalIncomeTransactionsPercentage = (totalIncomeTransactions / totalTransactions) * 100;
    const totalExpenseTransactionsPercentage = (totalExpenseTransactions / totalTransactions) * 100;

    const totalExpense = transactions.reduce((acc, transaction) => transaction.type === "expense" ? acc + transaction.amount : acc, 0);
    const totalIncome = transactions.reduce((acc, transaction) => transaction.type === "income" ? acc + transaction.amount : acc, 0);
    const totalTurnover = totalExpense + totalIncome;
    const totalIncomePercentage = (totalIncome / totalTurnover) * 100;
    const totalExpensePercentage = (totalExpense / totalTurnover) * 100;

    const categories = ["salary", "freelance", "food", "travel", "invest", "education", "medical", "entertainment", "savings", "others"];

    return (
        <div className="container mx-auto p-4">  {/* container */}
            <div className="flex flex-wrap -mx-2 mb-4">   {/* row-1 */}
                <div className="w-full md:w-1/3 px-2 mr-5">   {/* column-1 */}
                    <div className="bg-white p-6 shadow rounded">
                        <h4 className="text-lg mb-2 font-medium text-gray-900">Total Transactions: {totalTransactions}</h4>
                        <hr className="my-2" />
                        <h3 className="text-md font-medium mb-2 text-gray-800">Income : {totalIncomeTransactions}</h3>
                        <h3 className="text-md font-medium mb-2 text-gray-800">Expense: {totalExpenseTransactions}</h3>
                        <div className='progress-bar'>
                            <Progress className=' w-32 h-32 mx-5 mb-3' strokeColor='green' type='circle' format={percent => `${percent}%`} percent={totalIncomeTransactionsPercentage.toFixed(0)} />
                            <Progress className=" w-32 h-32 " strokeColor='red' type='circle' format={percent => `${percent}%`} percent={totalExpenseTransactionsPercentage.toFixed(0)} />
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/3 px-2 ml-5">   {/* column-2 */}
                    <div className="bg-white p-4 shadow rounded">
                        <h4 className="text-lg mb-2 font-medium text-gray-900">Total Turnover: {totalTurnover}</h4>
                        <hr className="my-2" />
                        <h3 className="text-md font-medium mb-2 text-gray-800">Income : {totalIncome}</h3>
                        <h3 className="text-md font-medium mb-2 text-gray-800">Expense: {totalExpense}</h3>
                        <div className='progress-bar'>
                            <Progress className='mx-5 mb-3' strokeColor='green' format={percent => `${percent}%`} type='circle' percent={totalIncomePercentage.toFixed(0)} />
                            <Progress strokeColor='red' type='circle' format={percent => `${percent}%`} percent={totalExpensePercentage.toFixed(0)} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap -mx-2 mt-9">   {/* row-2 */}
                <div className="w-full md:w-1/2 px-2">   {/* column-1 */}
                    <div className="bg-white p-4 shadow rounded">
                        <h4 className="text-lg mb-2 font-medium text-gray-900">Income Category Wise:</h4>
                        <hr className="my-2" />
                        {categories.map((category) => {
                            const amount = transactions.filter(t => t.type === 'income' && t.category === category).reduce((acc, t) => acc + t.amount, 0);
                            return (
                                amount > 0 && <div className="p-3" key={category} >
                                    <h5 className='capitalize'>{category}</h5>
                                    <Progress format={percent => `${percent}%`} percent={((amount / totalIncome) * 100).toFixed(0)} />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="w-full md:w-1/2 px-2">   {/* column-2 */}
                    <div className="bg-white p-4 shadow rounded">
                        <h4 className="text-lg mb-2 font-medium text-gray-900">Expense Category Wise:</h4>
                        <hr className="my-2" />
                        {categories.map((category) => {
                            const amount = transactions.filter(t => t.type === 'expense' && t.category === category).reduce((acc, t) => acc + t.amount, 0);
                            return (
                                amount > 0 && <div className="p-3" key={category} >
                                    <h5 className='capitalize'>{category}</h5>
                                    <Progress format={percent => `${percent}%`} percent={((amount / totalExpense) * 100).toFixed(0)} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div >
    );
}

export default Analytics;
