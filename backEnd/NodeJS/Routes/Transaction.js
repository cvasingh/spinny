const express = require('express')
const router = express.Router();


const Book = require('./db').Book
const Transaction = require('./db').Transaction

// bookIssued
router.get('/allTransaction', (req, res) => {
    Transaction.find({}, (err, docs) => {
        res.send(docs)
    }).sort({ _id: -1 })
})
// bookIssued
router.post('/bookIssued', (req, res) => {
    console.log(req.body);
    const temp = new Transaction({
        bookName: req.body.bookName,
        person: req.body.person,
        issuedDate: new Date(req.body.issuedDate).getTime(),
        returnedDate: ""
    })
    temp.save()
        .then(() => res.send("Data Inserted"))
})

// bookIssued
router.post('/bookReturn', async (req, res) => {
    try {
        var returnedDate = new Date(req.body.returnedDate).getTime()
        const result = await Book.findOne(
            { bookName: { $regex: new RegExp(req.body.bookName) } },
            { rentPerDay: 1, "_id": 0 }
        )
        await Transaction.updateOne({
            bookName: { $eq: req.body.bookName },
            person: { $eq: req.body.person }
        },
            { returnedDate: returnedDate })

        const data = await Transaction.findOne({
            bookName: { $eq: req.body.bookName },
            person: { $eq: req.body.person },
            returnedDate: { $eq: returnedDate }
        }, { issuedDate: 1, "_id": 0 });
        res.send({
            returnedDate,
            issuedDate: data.issuedDate,
            day: Math.ceil((returnedDate - data.issuedDate) / (1000 * 3600 * 24)),
            rentPerDay: result.rentPerDay,
            Rs: Math.ceil((returnedDate - data.issuedDate) / (1000 * 3600 * 24)) * result.rentPerDay
        })


    } catch (error) {
        console.log(error);
    }
})

module.exports = router;
