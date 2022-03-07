const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');


dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));


app.use(cookieParser());

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log('Server started on port ${PORT}');
});

app.use("/auth", require("./routers/userrouter"));

mongoose.connect(process.env.MDB_CONNECT,{
    useNewUrlParser: true,
    useUnifiedTopology: true,  
},(err) =>{
    if(err){
        console.log(err);
    }
    else{
        console.log("Connected to MongoDB");
    }
});
