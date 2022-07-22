const express = require('express')
const router = express.Router();

const Book = require('./db').Book
const Transaction = require('./db').Transaction


// bookName To Person list
router.post('/bookNameToPerson', (req, res) => {
    try {
        Transaction.find({
            bookName: { $regex: new RegExp(req.body.bookName) }
        },
            { person: 1, "_id": 0 }, (err, docs) => {
                res.send({ count: docs.length, list: docs })
            })
    } catch (error) {
        console.log(error);
    }
})

// bookName To rent
router.post('/bookNameToRent', async (req, res) => {
    try {
        var totalTime = 0
        const result = await Book.findOne(
            { bookName: { $regex: new RegExp(req.body.bookName) } },
            { rentPerDay: 1, "_id": 0 }
        )
        const transList = await Transaction.find(
            { bookName: { $regex: new RegExp(req.body.bookName) } },
            { issuedDate: 1, returnedDate: 1, "_id": 0 })
            
        transList.map((item, index) => {
            totalTime += (item.returnedDate - item.issuedDate)
        })
        res.send({
            TotalDays: Math.ceil(totalTime / (1000 * 3600 * 24)),
            rentPerDay: result.rentPerDay,
            TotalRs: Math.ceil(totalTime / (1000 * 3600 * 24)) * result.rentPerDay
        })
    } catch (error) {
        console.log(error);
    }
})

// person To Book Name
router.post('/personToBookName', (req, res) => {
    Transaction.find(
        { person: { $eq: req.body.person } },
        { bookName: 1, "_id": 0 },
        (err, docs) => {
            res.send(docs);
        })
})

// dates To List
router.post('/datesToPerson', (req, res) => {
    try {
        var minDate = new Date(req.body.issuedDate).getTime()
        var maxDate = new Date(req.body.returnedDate).getTime()
        Transaction.find({
            returnedDate: { $lte: maxDate, $gte: minDate }
        },
            { bookName: 1, person: 1, "_id": 0 },
            (err, docs) => {
                res.send(docs);
            })
    } catch (error) {
        console.log(error);
    }
})



module.exports = router;