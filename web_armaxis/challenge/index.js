const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const routes = require('./routes');
const app = express();

// Configure Nunjucks
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    noCache: true, // Disable caching for development
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie-parser

// Static files
app.use('/static', express.static(path.resolve('static')));

// Routes
app.use('/', routes);

// Start server
const PORT = 1337;
app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
