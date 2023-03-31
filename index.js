require('dotenv').config();
const cookieParser = require('cookie-parser');
const EventEmitter = require('events');
const secret = process.env.ACCESS_TOKEN_SECRET;
const jwt = require('jsonwebtoken')
const express = require('express');
const app = express();
const port = 3000;
const expressWs = require('express-ws')(app);
const messageBus = new EventEmitter();

app.use(express.static('static'));

app.use(cookieParser());
app.ws('/ws/:channel', (ws, req) => {
    const channel = req.params.channel;
    const token = req.cookies.token;
    const session = jwt.verify(token, secret);
    messageBus.addListener('message.' + channel, (message) => {
        ws.send(JSON.stringify(message));
    });
    console.log('connecté');
    ws.on('message', (text) => {
        const msg = JSON.parse(text);
        msg.autheur = session.pseudo;
        messageBus.emit('message.' + channel, msg);
    });
});

app.post('/token', express.urlencoded(), (req, res) => {
    const form = req.body;
    const session = {
        id: strRandom({
            startsWithLowerCase: true,
            length: 8,
            includeUpperCase: true,
            includeNumbers: true
        }),
        pseudo: form.pseudo
    };
    const accessToken = generateAccessToken(session);
    res.cookie('token', accessToken);
    res.redirect('/');
});

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

function generateAccessToken(user) {
    return jwt.sign(user, secret);
}

function strRandom(o) {
    var a = 10,
        b = 'abcdefghijklmnopqrstuvwxyz',
        c = '',
        d = 0,
        e = '' + b;
    if (o) {
        if (o.startsWithLowerCase) {
            c = b[Math.floor(Math.random() * b.length)];
            d = 1;
        }
        if (o.length) {
            a = o.length;
        }
        if (o.includeUpperCase) {
            e += b.toUpperCase();
        }
        if (o.includeNumbers) {
            e += '1234567890';
        }
    }
    for (; d < a; d++) {
        c += e[Math.floor(Math.random() * e.length)];
    }
    return c;
}