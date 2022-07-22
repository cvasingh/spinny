var mongoose = require('mongoose');

//mongoDB url
const myurl = "mongodb+srv://cvasingh:cvasingh123@cluster0.r8kw7.mongodb.net/library?retryWrites=true&w=majority"

//Attempt to connect to DB
mongoose.connect(myurl).then(() => {
    console.log('mongoDB connect successfull');
}).catch((err) => {
    console.log(`mongoDB not connect ${err} `);
})

// bookSchema
const bookSchema = new mongoose.Schema({
    bookName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    rentPerDay: {
        type: Number,
        required: true
    },
})

//collection  
const Book = new mongoose.model("Book", bookSchema);

//transactionSchema
const transactionSchema = new mongoose.Schema({
    bookName: {
        type: String,
        required: true
    },
    person: {
        type: String,
        required: true
    },
    issuedDate: {
        type: String
    },
    returnedDate: {
        type: String
    }
})

//collection  
const Transaction = new mongoose.model("Transaction", transactionSchema);

module.exports = {
    Book,
    Transaction
}