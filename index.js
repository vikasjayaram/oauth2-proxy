const express = require('express');
const bodyParser = require('body-parser');
const axios = require("axios").default;
const qs = require('qs');
const dotenv = require('dotenv');
const PORT = process.env.PORT || 5000;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    req.webtaskContext = {};
    const result = dotenv.config()

    if (result.error) {
        throw result.error
    }
    req.webtaskContext.data = result.parsed;
    next();
});

app.post('/token', async function (req, res) {
    const context = req.webtaskContext;
    const { client_id, client_secret, code, code_verifier, redirect_uri } = req.body;
    if (!client_id || !client_secret) {
        return res.send(400, 'missing client_id / client_secret');
    }
    var options = {
        method: 'POST',
        url: `${context.data.TOKEN_ENDPOINT}`,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify({
            grant_type: 'authorization_code',
            client_id: client_id,
            client_secret: client_secret,
            code_verifier: code_verifier,
            code: code,
            redirect_uri: redirect_uri
        })
    };
    try {
        const response = await axios.request(options);
        var data = response.data;
        data.x_refresh_token = response.data.refresh_token;
        delete data.refresh_token;
        return res.status(200).send(data);
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).send(error.response.data);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
            return res.status(500).send(error);
        }
    }
});


app.listen(PORT, () => console.log(`Listening on ${PORT}`));