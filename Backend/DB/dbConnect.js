import mongoose from "mongoose";
const url = process.env.MONGO_URL;

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

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose disconnected due to application termination');
    process.exit(0);
});
