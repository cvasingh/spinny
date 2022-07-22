const express = require('express')
const router = express.Router();

const Book = require('./db').Book

// search book
router.post('/searchBook', (req, res) => {
    console.log(req.body);
    const minRent = req.body.rentPerDay ? req.body.rentPerDay[0] : 0;
    const maxRent = req.body.rentPerDay ? req.body.rentPerDay[1] : 1000;
    if (!req.body.category) {
        Book.find({
            bookName: { $regex: new RegExp(req.body.bookName) },
            rentPerDay: { $gte: minRent, $lte: maxRent }
        }, { _id: 0, __v: 0 }, (err, docs) => {
            console.log(docs);
            res.send(docs)
        });
    } else {
        Book.find({
            bookName: { $regex: new RegExp(req.body.bookName) },
            category: req.body.category,
            rentPerDay: { $gte: minRent, $lte: maxRent }
        }, { _id: 0, __v: 0 }, (err, docs) => {
            console.log(docs);
            res.send(docs)
        });
    }
})




module.exports = router;