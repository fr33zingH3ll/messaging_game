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

function checkWordChaining(msg1, msg2) {
    if (msg1.autheur === msg2.autheur) {
        return 3;
    }
    const a1 = msg1.message.split('');
    const letter1 = a1[a1.length - 1];
    const letter2 = msg2.message.split('')[0];

    if (letter1 !== letter2) {
        return 2;
    } else {
        return 1;
    }
}

module.exports = { strRandom, checkWordChaining };