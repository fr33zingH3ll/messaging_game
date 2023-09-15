const EventEmitter = require('events');
const express = require('express');
const app = express();
const ws = new require('ws');
const port = 3000;
const expressWs = require('express-ws')(app);
const messageBus = new EventEmitter();
const r = require('rethinkdb');
let conn = undefined;
r.connect({ host: 'localhost', port: 28015 })
    .then((c) => { conn = c; });

app.use(express.static('static'));

DB_NAME = 'messaging';
TABLE_NAME = {
    'message' : 'message',
    'user' : 'user'
};

ACTIONS = {
    'typing' : 'typing',
    'send' : 'send'
}

app.ws('/ws', (req, res) => {
    ws.on('message', function(msg) {
        console.log(msg);
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send(err.message)
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
