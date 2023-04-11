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

app.ws('/ws/:channel', (ws, req) => {
    const channel = req.params.channel;
    const token = req.cookies.token;
    const session = jwt.verify(token, secret);
    messageBus.addListener('message.' + channel, (message) => {
        ws.send(JSON.stringify(message));
    });
    messageBus.addListener('typing.' + channel, (message) => {
        ws.send(JSON.stringify(message));
    });
    console.log('connecté');
    ws.on('message', (text) => {
        const msg = JSON.parse(text);
        msg.autheur = session.pseudo;
        msg.channel = channel;
        switch (msg.action) {
            case 'typing':
                messageBus.emit('typing.' + channel, msg);
                break;
            case 'game':
                /*
                r.db('messaging').table('message')
                    .filter(r.row('channel').eq(msg.channel))
                    .orderBy('datetime').limit(1).run(conn)
                    .then((c) => c.toArray())
                    .then((a) => {
                        if (a.length === 0) {
                            messageBus.emit('message.' + channel, msg);
                            messageBus.emit('message', msg);
                            return;
                        }
                        switch (checkWordChaining(msg, a[0])) {
                            case 3:
                                const warning = {
                                    'action': a[0].action,
                                    'autheur': 'system',
                                    'channel': channel,
                                    'message': 'attendez la réponse d\'abord'
                                };
                                messageBus.emit('message.' + channel, warning);
                                break;
                            case 2:
                                const win  = {
                                    'action': a[0].action,
                                    'autheur': 'system',
                                    'channel': channel,
                                    'message': 'vous avez gagnez ' + a[0].autheur
                                };
                                messageBus.emit('message.' + channel, win);
                                break;
                            case 1:
                                messageBus.emit('message.' + channel, msg);
                                messageBus.emit('message', msg);
                                break;

                            default:
                                break;
                        }
                    });*/
                messageBus.emit('message.' + channel, msg);
                messageBus.emit('message', msg);
                break;
            case 'conv':
                messageBus.emit('message.' + channel, msg);
                messageBus.emit('message', msg);
                break;
            default:
                break;
        }
    });
});

app.get('/message/:channel', (req, res) => {
    const channel = req.params.channel;
    r.db('messaging').table('message').filter(r.row('channel').eq(channel)).orderBy('datetime').limit(50).run(conn)
        .then((c) => c.toArray())
        .then((a) => {
            res.send(JSON.stringify(a));
        });
});

app.post('/login', express.urlencoded(), (req, res) => {
    const form = req.body;
    if (form.pseudo === '' || form.password === '') {
        //res.redirect('login.html?error=empty')
        console.log('cahmps vides');
    }
    const pseudo = form.pseudo;
    const password = form.password;
    r.db('messaging').table('user').filter(r.row('pseudo').eq(pseudo)).run(conn)
        .then((c) => c.next())
        .then((a) => {
            if (!bcrypt.compareSync(password, a.password)) {
                res.set({ 'Content-type': 'text/plain', 'success': false, 'description': 'mot de passe invalide' });
                console.log('connexion échoué');
                res.redirect('login.html');
            }
        })
        .catch((err) => {
            if (err) return res.status(400).json({ success: false, description: err });
        });
    const session = {
        id: strRandom({
            startsWithLowerCase: true,
            length: 8,
            includeUpperCase: true,
            includeNumbers: true
        }),
        pseudo: pseudo
    };
    const accessToken = generateAccessToken(session);
    req.cookies.token = accessToken;
    console.log('connexion réussi');
    res.redirect('/index.html');
});

app.post('/signin', express.urlencoded(), (req, res) => {
    const form = req.body;
    if (form.pseudo === '' || form.password === '' || form.confirm === '') res.redirect('signin.html');
    else if (form.password != form.confirm) res.redirect('signin.html');
    const pseudo = form.pseudo;
    const password = form.password;
    r.db('messaging').table('user').filter(r.row('pseudo').eq(pseudo)).run(conn)
        .then((c) => c.next())
        .then((a) => {
            console.log('ERROR: ', a);
            res.redirect('signin.html');
        })
        .catch((err) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) return res.status(400).json({ success: false, description: err });
                r.db('messaging').table('user').insert({ pseudo: pseudo, password: hash }).run(conn);
                res.redirect('login.html');
            });
        });
});

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

messageBus.addListener('message', (msg) => {
    r.db('messaging').table('message').insert(
        {
            'autheur': msg.autheur,
            'channel': msg.channel,
            'message': msg.message,
            'action': msg.action,
            'datetime': new Date()
        }
    ).run(conn);
});

function generateAccessToken(user) {
    return jwt.sign(user, secret);
}
