import express from "express";
import cors from "cors";
import "../DB/dbConnect.js";
import userRoute from "../Routes/UserRoute.js";
import transactionRoute from "../Routes/transactionRoute.js";
import friendRoute from "../Routes/friendRoute.js";
import friendTransactionRoute from "../Routes/friendTransactionRoute.js";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/users/", userRoute);
app.use("/api/transactions/", transactionRoute);
app.use("/api/friends/", friendRoute);
app.use("/api/friend-transactions/", friendTransactionRoute);


app.listen(port, () => {
    console.log(`Backend Server Listening at port ${port}`);
});
