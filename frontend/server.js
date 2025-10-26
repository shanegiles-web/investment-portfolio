import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.VITE_API_URL || 'http://localhost:3001';

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Bad Gateway - Could not reach backend API' });
  }
}));

// Proxy uploads requests to backend
app.use('/uploads', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Bad Gateway - Could not reach backend API' });
  }
}));

// Serve static files from the dist directory
const distPath = path.join(__dirname, 'dist');
console.log(`Serving static files from: ${distPath}`);
app.use(express.static(distPath));

// Handle client-side routing - return index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log(`Serving index.html from: ${indexPath}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`✓ Server is running on port ${PORT}`);
  console.log(`✓ Proxying API requests to: ${API_URL}`);
  console.log(`✓ Serving static files from: ${distPath}`);
});
