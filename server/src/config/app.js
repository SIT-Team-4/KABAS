const express = require('express');
const cors = require('cors');
const routes = require('../routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use((err, req, res) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
