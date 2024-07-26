import express from "express";
import "../DB/dbConnect.js"
import userRoute from "../Routes/UserRoute.js"
import transactionRoute from "../Routes/transactionRoute.js"

const app = express();
const port = 5000;

app.use(express.json())
app.use("/api/users/", userRoute)
app.use("/api/transactions/", transactionRoute)

app.listen(port, () => {
    console.log(`Backend Server Listening at port ${port}`)
})