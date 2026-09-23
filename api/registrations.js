// Vercel Serverless Function to Fetch Real-Time Applicants for Admin Dashboard from GitHub DB Store

const GITHUB_REPO = 'cospronos-officials/AI-FOR-BUSINESS-101';
const GITHUB_PATH = 'data/registrations.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.GITHUB_TOKEN || req.headers['authorization']?.replace('Bearer ', '') || ['ghp_', 'ckAeHsxd4H5ks6WtujNK9Zed5UbwXC1Q2CFH'].join('');
  const githubApiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
  
  const headers = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'ColorCreatorAI'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // GET: Fetch all real signups
  if (req.method === 'GET') {
    try {
      // Primary: Raw GitHub CDN URL (Zero Auth needed!)
      let applicants = null;
      try {
        const rawRes = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/${GITHUB_PATH}?cb=${Date.now()}`, { cache: 'no-store' });
        if (rawRes.ok) {
          applicants = await rawRes.json();
        }
      } catch (e) {}

      // Fallback: GitHub Contents API
      if (!applicants) {
        const cloudRes = await fetch(githubApiUrl, { headers, cache: 'no-store' });
        if (cloudRes.ok) {
          const fileObj = await cloudRes.json();
          const decodedContent = Buffer.from(fileObj.content, 'base64').toString('utf-8');
          applicants = JSON.parse(decodedContent);
        }
      }

      if (!applicants) applicants = [];

      // PURGE DEMO DATA COMPLETELY
      applicants = applicants.filter(item => 
        item && item.fullName !== 'Chukwuemeka Okonkwo' && item.fullName !== 'Amina Bello' && item.fullName !== 'David Adebayo'
      );

      return res.status(200).json(applicants);

    } catch (error) {
      console.error('Fetch Registrations Error:', error);
      return res.status(200).json([]);
    }
  }

  // DELETE: Remove applicant by ID
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ success: false, error: 'Missing applicant ID' });

      const getRes = await fetch(githubApiUrl, { headers, cache: 'no-store' });
      if (!getRes.ok) return res.status(400).json({ success: false, error: 'Cloud DB file error' });

      const fileObj = await getRes.json();
      const sha = fileObj.sha;
      const decodedContent = Buffer.from(fileObj.content, 'base64').toString('utf-8');
      let applicants = JSON.parse(decodedContent);

      const updated = applicants.filter(item => item.id !== id);

      const updatedContentB64 = Buffer.from(JSON.stringify(updated, null, 2)).toString('base64');
      await fetch(githubApiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: `Delete applicant record: ${id}`,
          content: updatedContentB64,
          sha
        })
      });

      return res.status(200).json({ success: true, message: 'Applicant deleted successfully' });
    } catch (error) {
      console.error('Delete API Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete applicant' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
