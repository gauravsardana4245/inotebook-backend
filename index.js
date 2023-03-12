const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

var cors = require('cors')
const connectToMongo = require("./db.js");

app.use(express.json());

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', "https://inotebook-gaurav.netlify.app/");
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(cors())
app.use('/api/auth', require('/Users/gauravsardana/inotebook/Backend/routes/auth.js'))
app.use('/api/notes', require('/Users/gauravsardana/inotebook/Backend/routes/notes.js'))
app.listen(port, () => {
    console.log(`Example app listening at port ${port}`);
})
connectToMongo();