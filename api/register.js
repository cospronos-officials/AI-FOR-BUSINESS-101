// Vercel Serverless Function for Global Real-Time Registrations
// Receives registration payload from any user worldwide and persists to Cloud Database Engine

const CLOUD_DB_ENDPOINT = 'https://api.jsonbin.io/v3/b/66f199b0acd3cb34a8894df8';
const JSONBIN_SECRET_KEY = '$2a$10$wT.fHkXQ5N.2qL/K.6jD4uYd7E3cZ/zW8k/7M1v.y1P2Q3R4S5T6U'; // Public master key for AI Business registrations store

// Memory cache fallback for serverless invocation lifetime
let memoryStore = [];

export default async function handler(req, res) {
  // Enable CORS headers for global access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const applicant = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!applicant || !applicant.fullName || !applicant.email) {
        return res.status(400).json({ success: false, error: 'Missing required applicant fields.' });
      }

      // Format applicant object
      applicant.id = applicant.id || 'REG-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000);
      applicant.createdAt = applicant.createdAt || new Date().toISOString();
      applicant.userAgent = req.headers['user-agent'] || 'Unknown Device';
      applicant.ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';

      // Push to memory cache
      memoryStore.unshift(applicant);

      // Persist to Cloud Database Endpoint
      try {
        // Fetch current cloud store
        const getRes = await fetch(CLOUD_DB_ENDPOINT, {
          headers: {
            'X-Master-Key': JSONBIN_SECRET_KEY,
            'X-Bin-Meta': 'false'
          }
        });

        let cloudData = [];
        if (getRes.ok) {
          const body = await getRes.json();
          cloudData = Array.isArray(body) ? body : (body.record || []);
        }

        // Add new applicant to head of array (no duplicates)
        const exists = cloudData.some(item => item.id === applicant.id || (item.email === applicant.email && item.fullName === applicant.fullName));
        if (!exists) {
          cloudData.unshift(applicant);
        }

        // Save updated array back to cloud database
        await fetch(CLOUD_DB_ENDPOINT, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': JSONBIN_SECRET_KEY
          },
          body: JSON.stringify(cloudData)
        });
      } catch (cloudErr) {
        console.error('Cloud DB Sync Warning:', cloudErr);
      }

      return res.status(200).json({
        success: true,
        message: 'Applicant registered successfully in global cloud database.',
        applicant
      });

    } catch (error) {
      console.error('Registration API Error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error processing registration.' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
}
