var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var PORT = process.env.PORT || 3030;
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send({ok:true});
});

app.listen(PORT, function () {
    console.log('Started on port', PORT);
});
