var express = require('express');
var bodyParser = require('body-parser');
var cradle = require('cradle');
var c = new(cradle.Connection)('http://database', 5984, {
    cache: true,
    raw: false,
    forceSave: true,
});

var resultQueryView = `
    function(doc){
        if(doc.query && doc.args)
            emit([doc.query,doc.args], null);
    }
`;
var db = c.database('results');
db.exists(function (err, exists) {
    if (err) {
        console.log('error', err);
    } else if (!exists) {
        db.create(()=> {
            db.save('_design/result', {
                views: {
                    getResult: {
                        map: resultQueryView
                    }
                }
            }, () => {
                console.log('db created');
            });
        });
    }
});
var app = express();

var modules = {
    db2: require('./modules/db2.js')    
}

process.on('uncaughtException', function (err) {
    console.error(err);
});

var PORT = process.env.PORT || 3030;
app.use(bodyParser.json());

app.post('/:module', (req, res) => {
    var mod = modules[req.params.module];
    var query = req.body.query;
    var args = req.body.args;
    if (!mod) return res.status(404).send({
        error: req.params.module + ' not found'
    });
    function fetchAndSendResults(mod, res, query, args, oldDoc) {
        mod.run(query, args, (err, dbres) => {
            if (err) return res.status(500).send(err);
            if (res) res.send(dbres);
            console.error('Writing cache for', query, args);
            db.save({
                _id: oldDoc? oldDoc._id : undefined,
                _rev: oldDoc? oldDoc._rev : undefined,
                query: query,
                args: args,
                time: Date.now(),
                ttl: 1000 * 60 * 60 * 1, // 1 hour time to live
                result: dbres
            }, function(err, res) {
                if (err) console.error(err);
            });
        });
    };
    db.view('result/getResult', {
        key:[query,args],
        include_docs: true,
        limit: 2 // Used to test if query/args combo is unique
    }, (err, docs) => {
        if (docs.length == 0) {
            fetchAndSendResults(mod, res, query, args);
        } else {
            var doc = docs[0].doc;
            if (docs.length > 1) {
                console.error('Multiple results for', query, args);
                console.log(docs);
                doc.not_unique = true;
            }
            // fetch new results if cache is expired
            // or if the last results were empty
            // Sometimes ibm_db returns empty results incorrectly
            var emptyResult =
                (Array.isArray(doc.result) && doc.result.length == 0);
            if (emptyResult || Date.now() > doc.time + doc.ttl) {
                fetchAndSendResults(mod, null, query, args, doc);
            }
            res.send(doc.result);
        }
    });
});

app.listen(PORT, function () {
    console.log('Started on port', PORT);
});
