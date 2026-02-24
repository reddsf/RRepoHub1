import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_FILE = path.resolve(__dirname, 'links.json');

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Data Types
interface LinkItem {
  id: string;
  name: string;
  url: string;
  date: string;
}

// In-memory store (synced with file)
let links: LinkItem[] = [];

// Load data from file
try {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    links = JSON.parse(data);
    console.log(`[Server] Loaded ${links.length} links from storage.`);
  } else {
    // Create empty file if not exists
    fs.writeFileSync(DATA_FILE, '[]');
  }
} catch (err) {
  console.error('[Server] Failed to load links:', err);
  links = [];
}

// Helper to save data
const saveLinks = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(links, null, 2));
  } catch (err) {
    console.error('[Server] Failed to save links:', err);
  }
};

// Passkey Logic (Static)
const currentPasskey = 'R@dd!23X';

// Active Users Tracking (Real-ish)
const activeSessions = new Set<string>();

app.use((req, res, next) => {
  const id = req.cookies.auth_session || req.ip;
  activeSessions.add(id);
  if (activeSessions.size > 100) {
    activeSessions.clear();
    activeSessions.add(id);
  }
  next();
});

app.get('/api/status', (req, res) => {
  res.json({ 
    activeUsers: activeSessions.size, 
    lastUpdated: new Date().toISOString() 
  });
});

// Captcha Store
const captchas = new Map<string, string>();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Admin-only: Get current passkey
app.get('/api/admin/passkey', (req, res) => {
  if (req.cookies.admin_session !== 'valid') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  res.json({ passkey: currentPasskey });
});

app.post('/api/auth/captcha', (req, res) => {
  const id = Math.random().toString(36).substring(7);
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  const answer = (num1 + num2).toString();
  captchas.set(id, answer);
  setTimeout(() => captchas.delete(id), 5 * 60 * 1000);
  res.json({ id, question: `${num1} + ${num2}` });
});

app.post('/api/auth/verify', (req, res) => {
  const { passkey, captchaId, captchaAnswer } = req.body;
  const expectedAnswer = captchas.get(captchaId);
  if (!expectedAnswer || expectedAnswer !== captchaAnswer) {
    return res.status(400).json({ error: 'Invalid or expired captcha' });
  }
  if (passkey !== currentPasskey) {
    return res.status(401).json({ error: 'Invalid passkey' });
  }
  res.cookie('auth_session', 'valid', { 
    httpOnly: true, 
    maxAge: 3600000, 
    secure: true,
    sameSite: 'none'
  });
  res.json({ success: true });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'alexredd' && password === '2010') {
    res.cookie('admin_session', 'valid', { 
      httpOnly: true, 
      maxAge: 3600000,
      secure: true,
      sameSite: 'none'
    });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Link Management Routes
app.get('/api/data/links', (req, res) => {
  res.json(links);
});

app.post('/api/data/links', (req, res) => {
  if (req.cookies.admin_session !== 'valid') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const { name, url } = req.body;
  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }

  const newLink: LinkItem = {
    id: Math.random().toString(36).substring(7),
    name,
    url,
    date: new Date().toISOString()
  };

  links.unshift(newLink); // Add to top
  saveLinks();
  
  console.log(`[Links] Added: ${name} -> ${url}`);
  res.json({ success: true, link: newLink });
});

app.delete('/api/data/links/:id', (req, res) => {
  if (req.cookies.admin_session !== 'valid') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const { id } = req.params;
  const initialLength = links.length;
  links = links.filter(l => l.id !== id);
  
  if (links.length !== initialLength) {
    saveLinks();
    console.log(`[Links] Deleted ID: ${id}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Link not found' });
  }
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`[Static Passkey]: ${currentPasskey}`);
  });
}

startServer();
