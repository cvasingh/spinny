const express = require('express')
const cors = require('cors')
const bodyparser = require('body-parser')

const PORT = process.env.PORT || 3000
const app = express();
app.use(cors());


//Middleware for bodyparser
app.use(bodyparser.urlencoded({ extended: false }))
app.use(express.json())

//default router
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/build/index.html");
})
app.use(express.static(__dirname + '/build'));


//actual routes for book
const Book = require('./Routes/Book')
app.use('/bookAPI', Book)

//actual routes for transaction
const Transaction = require('./Routes/Transaction')
app.use('/transactionAPI', Transaction)

//actual routes for other
const Other = require('./Routes/other')
app.use('/otherAPI', Other)



app.listen(PORT, () => {
    console.log(`App running on ${PORT}`)
})
