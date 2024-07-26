import mongoose from "mongoose";
const url = "mongodb://localhost:27017/Expense_tracker"

mongoose.connect(url);

mongoose.connection.on('connected', () => {
    console.log("MongoDb connected");
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDb disconnected');
});

// Optionally handle process termination
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongoose disconnected due to application termination');
        process.exit(0);
    });
});

