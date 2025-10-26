import request from 'supertest';
import app from '../../app';

describe('Health Check API', () => {
  describe('GET /api/health', () => {
    it('should return 200 status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
    });

    it('should return JSON response', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return health check data', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should have success true', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.success).toBe(true);
    });

    it('should have environment set', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.environment).toBe('development');
    });

    it('should have uptime greater than 0', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /api', () => {
    it('should return API info', async () => {
      const response = await request(app).get('/api');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
    });
  });
});
