const app = require('./src/config/app');

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
