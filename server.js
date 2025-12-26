// server.js - Custom server for Docusaurus with Better-Auth API routes
const express = require('express');
const path = require('path');
const chalk = require('chalk');
const cors = require('cors');

// Import Better-Auth
const { auth } = require('./src/auth/auth.config');

// Create Express app
const app = express();

// Enable CORS for API routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Add Better-Auth API routes
app.use('/api/auth', auth.handler);

// Serve static files from build directory (after API routes)
app.use(express.static(path.join(__dirname, 'build')));

// For all other routes, serve the Docusaurus app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(chalk.green(`Server running at http://localhost:${port}`));
  console.log(chalk.green(`Better-Auth API available at http://localhost:${port}/api/auth`));
});