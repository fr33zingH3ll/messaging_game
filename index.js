require('dotenv').config();
const cookieParser = require('cookie-parser');
const EventEmitter = require('events');
const secret = process.env.ACCESS_TOKEN_SECRET;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const express = require('express');
const app = express();
const port = 3000;
const expressWs = require('express-ws')(app);
const messageBus = new EventEmitter();
const { strRandom, checkWordChaining } = require('./utils');
const r = require('rethinkdb');
let conn = undefined;
r.connect({ host: 'localhost', port: 28015 })
    .then((c) => { conn = c; });

app.use(express.static('static'));
app.use(cookieParser());

app.ws('/channel', (ws, req) => {
    // Vérification du token
    const token = req.cookies.token;
    const session = jwt.verify(token, secret);

    // Vérification du token de session
    const token_session = req.cookies.token_session;
    const channel = jwt.verify(token_session, secret);
    
    console.log('INFO : channel : ' + channel.channel_name);
    ws.on('message', (text) => {
        const msg = JSON.parse(text);
        msg.autheur = session.pseudo;
        msg.channel = channel;
        switch (msg.action) {
            case 'typing':
                messageBus.emit('typing.' + channel, JSON.parse({ autheur: msg.autheur }))
                break;
            case 'send':
                messageBus.emit('message.' + channel, msg);
                messageBus.emit('message', msg);
                break;
            default:
                break;
        }

    });
    messageBus.addListener('message.' + channel, (message) => {
        ws.send(JSON.stringify(message));
    });
    messageBus.addListener('typing.' + channel, (message) => {
        ws.send(JSON.stringify(message));
    });
    messageBus.addListener('message', (msg) => {
        r.db('messaging').table('message').insert(
            {
                'autheur': msg.autheur,
                'channel': msg.channel,
                'message': msg.message,
                'datetime': new Date()
            }
        ).run(conn);
    });
});

app.get('/message', (req, res) => {
    const token_session = req.cookies.token_session;
    const channel = jwt.verify(token_session, secret);
    const session = jwt.verify(token_session, secret);
    r.db('messaging').table('message').filter(r.row('channel').eq(channel)).orderBy('datetime').limit(50).run(conn)
        .then((c) => c.toArray())
        .then((a) => {
            res.send(JSON.stringify(a));
        });
});

app.post('/login', express.urlencoded(), (req, res) => {
    const form = req.body;
    const pseudo = form.pseudo;
    const password = form.password;
    if (form.pseudo === '' || form.password === '') {
        console.log('ERROR : L\'un des champs est vide, redirection vers login.html.');
        return res.redirect('/login.html?success=false&description=field_empty');
    }
    console.log('INFO : Champs valides, vérification du user en DB.');
    r.db('messaging').table('user').filter(r.row('pseudo').eq(pseudo)).run(conn)
        .then((c) => c.next())
        .then((a) => {
            console.log('INFO : User enregistrer en DB, teste du mot de passe.');
            if (!bcrypt.compareSync(password, a.password)) {
                console.log('ERROR : Mot de passe incorecte, redirection vers login.html.');
                return res.redirect('/login.html?success=false&description=incorrect_identifiers');
            } else {
                const session = {
                    id: strRandom({
                        startsWithLowerCase: true,
                        length: 8,
                        includeUpperCase: true,
                        includeNumbers: true
                    }),
                    pseudo: pseudo
                };
                const accessToken = jwt.sign(session, secret);
                req.cookies.token = accessToken;
                console.log('INFO : Mot de passe correct, redirection vers index.html.');
                return res.redirect('/index.html?sucess=true&description=successful_connection');
            }
        })
        .catch((err) => {
            if (err) {
                console.log('ERROR : message => '+err.message);
                return res.redirect('/login.html?success=false&description='+err.message);
            }
        });
});

app.post('/signin', express.urlencoded(), (req, res) => {
    const form = req.body;
    if (form.pseudo === '' || form.password === '' || form.confirm === '') return res.send({ success: false, description: 'field empty' });;
    if (form.password !== form.confirm) return res.send({ success: false, description: 'password not confirmed' })
    const pseudo = form.pseudo;
    const password = form.password;
    r.db('messaging').table('user').filter(r.row('pseudo').eq(pseudo)).run(conn)
        .then((c) => c.next())
        .then(() => {
            res.send({success: false, description: 'already registered'})
        })
        .catch(() => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) return res.status(400).json({ success: false, description: err });
                r.db('messaging').table('user').insert({ pseudo: pseudo, password: hash }).run(conn);
                res.send({ success: true, description: 'successful registration' })
            });
        });
});

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send(err.message)
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
