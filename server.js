import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import shortid from 'shortid';
import db from './database.js';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// Get all urls from db
app.get('/urls', (req, res) => {
    db.query('SELECT * FROM urls', (err, results) => {
        if (err) {
            console.error("Error retrieving URLs:", err);
            return res.status(500).json({ error: "Failed to retrieve URLs" });
        }

        res.json(results);
    });
});

// Endpoint to shorten URL
app.post('/shorten', (req, res) => {
    const { longUrl } = req.body;
    const shortAlias = shortid.generate();
    
    db.query('INSERT INTO urls (long_url, short_alias) VALUES (?, ?)', [longUrl, shortAlias], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to shorten URL' });
        }
        
        res.json({ shortUrl: `http://localhost:${port}/${shortAlias}` });
    });
});

// Endpoint to redirect to the original URL
app.get('/:shortAlias', (req, res) => {
    const { shortAlias } = req.params;

    db.query('SELECT long_url FROM urls WHERE short_alias = ?', [shortAlias], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'URL not found' });
        }

        res.redirect(results[0].long_url);
    });
});


app.listen(port, () => {
    console.log(`Server listening on ${port}...`)
});
    