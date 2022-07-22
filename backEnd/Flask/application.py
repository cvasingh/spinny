import math
from datetime import datetime
from math import ceil

import pymongo
import certifi
from flask import Flask, jsonify, request
from bson.json_util import dumps
from flask_cors import CORS

application = Flask(__name__)
CORS(application)

conn = pymongo.MongoClient("mongodb+srv://cvasingh:cvasingh123@cluster0.r8kw7.mongodb.net", tlsCAFile=certifi.where())
mydb = conn["library"]
Books = mydb["books"]
Transactions = mydb["transactions"]


########################################################################################################################
# Other APIs
########################################################################################################################

# list of books to a person
@application.route('/otherAPI/personToBookName', methods=['POST'])
def personToBookName():
    _json = request.json
    print(_json)
    _person = _json['person']
    _data = Transactions.find(
        {'person': {'$eq': _person}},
        {'bookName': 1, '_id': 0})
    res = dumps(_data)
    return res


# list of books to Rent
@application.route('/otherAPI/bookNameToRent', methods=['POST'])
def bookNameToRent():
    _json = request.json
    print(_json)
    _bookName = _json['bookName']
    _rent = Books.find(
        {'bookName': {'$eq': _bookName}},
        {'rentPerDay': 1, '_id': 0})
    _transList = Transactions.find(
        {'bookName': {'$regex': _bookName}},
        {'issuedDate': 1, 'returnedDate': 1, '_id': 0})
    _totalTime = 0
    for i in _transList:
        print(i)
    res = dumps(_transList)
    return res


# list of persons to a book
@application.route('/otherAPI/bookNameToPerson', methods=['POST'])
def bookNameToPerson():
    _json = request.json
    print(_json)
    _bookName = _json['bookName']
    _data = Transactions.find(
        {'bookName': {'$eq': _bookName}},
        {'person': 1, '_id': 0})
    res = dumps(_data)
    return res


# search Person from date
@application.route('/otherAPI/datesToPerson', methods=['POST'])
def datesToPerson():
    _json = request.json
    print(_json)
    _minDate = int(datetime.strptime(_json['issuedDate'], "%Y-%m-%d").timestamp() * 1000)
    _maxDate = int(datetime.strptime(_json['returnedDate'], "%Y-%m-%d").timestamp() * 1000)
    print(_json)
    _data = Transactions.find({
        'returnedDate': {'$lt': _maxDate, '$gt': _minDate}},
        {'person': 1, 'bookName': 1, '_id': 0})
    res = dumps(_data)
    return res


########################################################################################################################
# Transactions APIs
########################################################################################################################

# list of Transaction
@application.route('/transactionAPI/allTransaction', methods=['GET'])
def allTransaction():
    _data = Transactions.find({}, {'_id': 0}).sort('_id', -1)
    res = dumps(_data)
    return res


# add bookIssued
@application.route('/transactionAPI/bookIssued', methods=['POST'])
def bookIssued():
    _json = request.json
    _bookName = _json['bookName']
    _person = _json['person']
    _issuedDate = int(datetime.strptime(_json['issuedDate'], "%Y-%m-%d").timestamp() * 1000)

    Transactions.insert_one({
        'bookName': _bookName,
        'person': _person,
        'issuedDate': _issuedDate,
        'returnedDate': ''
    })
    return "Data Inserted"


# add bookReturn
@application.route('/transactionAPI/bookReturn', methods=['POST'])
def bookReturn():
    _json = request.json
    _bookName = _json['bookName']
    _person = _json['person']
    _returnedDate = int(datetime.strptime(_json['returnedDate'], "%Y-%m-%d").timestamp() * 1000)
    _rent = Books.find_one({'bookName': {'$regex': _bookName}},
                           {'rentPerDay': 1, '_id': 0})

    temp = Transactions.update_one({
        'bookName': {'$regex': _bookName},
        'person': {'$eq': _person}},
        {"$set": {'returnedDate': _returnedDate}})

    _tran = Transactions.find_one({
        'person': {'$eq': _person},
        'returnedDate': {'$eq': _returnedDate}
    }, {'issuedDate': 1, '_id': 0})

    _result = {
        'returnedDate': _returnedDate,
        'issuedDate': _tran['issuedDate'],
        'day': math.ceil((_returnedDate - _tran['issuedDate']) / (1000 * 3600 * 24)),
        'rentPerDay': _rent['rentPerDay'],
        'Rs': math.ceil((_returnedDate - _tran['issuedDate']) / (1000 * 3600 * 24)) * _rent['rentPerDay']
    }

    res = dumps(_result)
    return res


########################################################################################################################
# Books APIs
########################################################################################################################


@application.route('/bookAPI/searchBook', methods=['POST'])
def searchBook():
    _json = request.json
    print(_json)
    if 'rentPerDay' in _json:
        _minRent = _json['rentPerDay'][0]
        _maxRent = int(_json['rentPerDay'][1])
    else:
        _minRent = 0
        _maxRent = 100

    if (not 'bookName' in _json) and (not 'category' in _json):
        _data = Books.find({
            'rentPerDay': {'$gte': _minRent, '$lte': _maxRent}
        }, {'_id': 0, '__v': 0})
        res = dumps(_data)
        return res

    elif 'bookName' in _json:
        _data = Books.find({
            'bookName': {'$regex': _json['bookName']},
            'rentPerDay': {'$gte': _minRent, '$lte': _maxRent}
        }, {'_id': 0, '__v': 0})
        res = dumps(_data)
        return res

    elif 'category' in _json:
        _data = Books.find({
            'category': _json['category'],
            'rentPerDay': {'$gte': _minRent, '$lte': _maxRent}
        }, {'_id': 0, '__v': 0})
        res = dumps(_data)
        return res
    else:
        return "done"


@application.errorhandler(404)
def not_found(error=None):
    message = {
        'message': 'Not found' + request.url,
        'status': 404
    }
    res = jsonify(message)
    res.status_code = 404
    return res


if __name__ == "__main__":
    application.run(debug=True)
