// Vercel Serverless Function to Fetch & Manage Real-Time Applicants for Admin Dashboard

const CLOUD_DB_ENDPOINT = 'https://api.jsonbin.io/v3/b/66f199b0acd3cb34a8894df8';
const JSONBIN_SECRET_KEY = '$2a$10$wT.fHkXQ5N.2qL/K.6jD4uYd7E3cZ/zW8k/7M1v.y1P2Q3R4S5T6U';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch all real signups
  if (req.method === 'GET') {
    try {
      const cloudRes = await fetch(CLOUD_DB_ENDPOINT, {
        headers: {
          'X-Master-Key': JSONBIN_SECRET_KEY,
          'X-Bin-Meta': 'false'
        }
      });

      if (!cloudRes.ok) {
        return res.status(200).json([]);
      }

      const data = await cloudRes.json();
      const applicants = Array.isArray(data) ? data : (data.record || []);
      return res.status(200).json(applicants);

    } catch (error) {
      console.error('Fetch Registrations API Error:', error);
      return res.status(200).json([]);
    }
  }

  // DELETE: Remove applicant by ID
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ success: false, error: 'Missing applicant ID' });

      const cloudRes = await fetch(CLOUD_DB_ENDPOINT, {
        headers: {
          'X-Master-Key': JSONBIN_SECRET_KEY,
          'X-Bin-Meta': 'false'
        }
      });

      let cloudData = [];
      if (cloudRes.ok) {
        const body = await cloudRes.json();
        cloudData = Array.isArray(body) ? body : (body.record || []);
      }

      const updated = cloudData.filter(item => item.id !== id);

      await fetch(CLOUD_DB_ENDPOINT, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_SECRET_KEY
        },
        body: JSON.stringify(updated)
      });

      return res.status(200).json({ success: true, message: 'Applicant deleted successfully.' });
    } catch (error) {
      console.error('Delete API Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete applicant' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
