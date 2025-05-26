const express = require("express");
const app = express();

app.use("/test", (req, res)=>{
    res.send("Hello from test");
})
app.use((req, res)=>{
    res.send("Hello from devtinder");
});

app.listen(3000,(req, res)=>{
    console.log("Server started successfully");
})