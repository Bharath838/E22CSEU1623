const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 9876;

let window = [];
const WINDOW_SIZE = 10;

app.get('/numbers/:type', async (req, res) => {
    const { type } = req.params;
    const urls = {
        'p': 'http://20.244.56.144/evaluation-service/primes',
        'f': 'http://20.244.56.144/evaluation-service/fibo',
        'e': 'http://20.244.56.144/evaluation-service/even',
        'r': 'http://20.244.56.144/evaluation-service/rand'
    };
    try {
        const response = await axios.get(urls[type], {
            headers: { 
                'Authorization': req.headers.authorization 
            },
            timeout: 500
        });

        const newNumbers = response.data.numbers.filter(n => !window.includes(n));
        const prevWindow = [...window];
        window = [...window, ...newNumbers].slice(-WINDOW_SIZE);
        const avg = (window.reduce((a, b) => a + b, 0) / window.length).toFixed(2);

        res.json({
            windowPrevState: prevWindow,
            windowCurrState: window,
            numbers: newNumbers,
            avg: parseFloat(avg)
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch numbers" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));