
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Home route
app.get('/', (req, res) => {
    res.status(200).send('Welcome to my Lab 1 Express Server!');
});

app.get('/about', (req, res) => {
    res.status(200).json({
        name: 'K.SUSVITHA',
        section: 'CSE GEN AI-2A'
    });
});


app.get('/time', (req, res) => {
    res.status(200).json({
        currentDateTime: new Date()
    });
});


app.use((req, res) => {
    res.status(404).send('404 - Page Not Found');
});


app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});
