const mongoose = require("mongoose");
const express = require("express");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const dotenv = require("dotenv");
dotenv.config();
const app = express();

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));


app.get("/test", (req, res) => {
  res.send("Test route is working!");
});

const connectToDb = async()=> {
	try {
		const connectionInstance = await mongoose.connect(`mongodb+srv://adityasen:12345@adityasen-cluster.kprjses.mongodb.net/authapp`)
		console.log("mongodb connected");
	} catch (error) {
		console.log("error in db connect");
	}
}
connectToDb().then(()=>{
	app.listen( 3000 , ()=>{
		console.log(`server is running at port 3000`);
	})
})
.catch((error)=>{
	console.log("mongodb connection failed");
});

