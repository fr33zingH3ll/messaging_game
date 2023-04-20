const fetch = require("node-fetch");


test('signin', async () => {
    const params = new URLSearchParams();
    params.set('pseudo', 'test1');
    params.set('password', 'toto');
    params.set('confirm', 'toto');
    const result = await fetch('http://localhost:3000/signin', { method:'POST', body:params.toString(), headers:{ 'Content-type':'application/x-www-form-urlencoded' } });
    console.log(await result.text());
    expect(result.status).toBe(200);
});