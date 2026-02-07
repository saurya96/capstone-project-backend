const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Read database
    const dbPath = path.join(process.cwd(), 'db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

    // Parse URL to get resource and ID
    const urlPath = req.url.split('?')[0];
    const pathParts = urlPath.split('/').filter(Boolean);
    const resource = pathParts[0];
    const id = pathParts[1];

    // GET requests
    if (req.method === 'GET') {
      if (!resource) {
        return res.status(200).json(db);
      }
      if (db[resource]) {
        if (id) {
          const item = db[resource].find(item => item.id === id);
          return res.status(200).json(item || {});
        }
        return res.status(200).json(db[resource]);
      }
      return res.status(404).json({ error: 'Resource not found' });
    }

    // POST requests
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          const newItem = JSON.parse(body);
          if (db[resource]) {
            db[resource].push(newItem);
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            return res.status(201).json(newItem);
          }
          return res.status(404).json({ error: 'Resource not found' });
        } catch (e) {
          return res.status(400).json({ error: 'Invalid JSON' });
        }
      });
      return;
    }

    // PUT/PATCH requests
    if (req.method === 'PUT' || req.method === 'PATCH') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          const updates = JSON.parse(body);
          if (db[resource] && id) {
            const index = db[resource].findIndex(item => item.id === id);
            if (index !== -1) {
              db[resource][index] = { ...db[resource][index], ...updates };
              fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
              return res.status(200).json(db[resource][index]);
            }
          }
          return res.status(404).json({ error: 'Not found' });
        } catch (e) {
          return res.status(400).json({ error: 'Invalid JSON' });
        }
      });
      return;
    }

    // DELETE requests
    if (req.method === 'DELETE') {
      if (db[resource] && id) {
        const index = db[resource].findIndex(item => item.id === id);
        if (index !== -1) {
          const deleted = db[resource].splice(index, 1);
          fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
          return res.status(200).json(deleted[0]);
        }
      }
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};
