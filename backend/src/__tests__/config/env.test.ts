import { config } from '../../config/env';

describe('Environment Configuration', () => {
  it('should load configuration', () => {
    expect(config).toBeDefined();
  });

  it('should have correct environment', () => {
    expect(config.env).toBe('development');
  });

  it('should have port number', () => {
    expect(config.port).toBeDefined();
    expect(typeof config.port).toBe('number');
  });

  it('should have database configuration', () => {
    expect(config.database).toBeDefined();
    expect(config.database.url).toBeDefined();
  });

  it('should have JWT configuration', () => {
    expect(config.jwt).toBeDefined();
    expect(config.jwt.secret).toBeDefined();
    expect(config.jwt.expiresIn).toBeDefined();
  });

  it('should have CORS configuration', () => {
    expect(config.cors).toBeDefined();
    expect(config.cors.origin).toBeDefined();
  });

  it('should have rate limit configuration', () => {
    expect(config.rateLimit).toBeDefined();
    expect(config.rateLimit.windowMs).toBeGreaterThan(0);
    expect(config.rateLimit.max).toBeGreaterThan(0);
  });
});
