import express from 'express';
import { openapi } from './openapi.yaml'; // This won't work directly, we need to read the file

// We'll create a separate file for the OpenAPI specification
// For now, we'll just serve the static file

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

app.use('/api', express.static('apps/api', { extensions: ['json', 'yaml'] }));

// Add a route to serve the OpenAPI specification
app.get('/api/docs', (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/openapi.yaml'));
});

app.listen(5000, () => {
  console.log(`API server running on port ${port}`);
});