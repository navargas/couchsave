var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var modules = {
    munich: require('./modules/munich.js')    
}

process.on('uncaughtException', function (err) {
    console.error(err);
});

var PORT = process.env.PORT || 3030;
app.use(bodyParser.json());

app.post('/:module', (req, res) => {
    var mod = modules[req.params.module];
    if (!mod) return res.status(404).send({
        error: req.params.module + ' not found'
    });
    mod.run(req.body.query, req.body.args, (err, dbres) => {
        if (err) return res.status(500).send(err);
        res.send(dbres);
    });
});

app.listen(PORT, function () {
    console.log('Started on port', PORT);
});
