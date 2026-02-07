const fs = require('fs');
const path = require('path');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

module.exports = (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    return res.end();
  }

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  try {
    const dbPath = path.join(process.cwd(), 'db.json');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

    const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
    const resource = urlParts[0];
    const id = urlParts[1];

    // Handle different HTTP methods
    if (req.method === 'GET') {
      if (resource && data[resource]) {
        if (id) {
          const item = data[resource].find(i => i.id === id);
          return res.status(200).json(item || {});
        }
        return res.status(200).json(data[resource] || []);
      }
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const newItem = JSON.parse(body);
        if (resource && data[resource]) {
          data[resource].push(newItem);
          fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
          return res.status(201).json(newItem);
        }
        return res.status(400).json({ error: 'Invalid resource' });
      });
      return;
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const updates = JSON.parse(body);
        if (resource && data[resource] && id) {
          const index = data[resource].findIndex(i => i.id === id);
          if (index !== -1) {
            data[resource][index] = { ...data[resource][index], ...updates };
            fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
            return res.status(200).json(data[resource][index]);
          }
        }
        return res.status(404).json({ error: 'Not found' });
      });
      return;
    }

    if (req.method === 'DELETE') {
      if (resource && data[resource] && id) {
        const index = data[resource].findIndex(i => i.id === id);
        if (index !== -1) {
          data[resource].splice(index, 1);
          fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
          return res.status(200).json({ success: true });
        }
      }
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
