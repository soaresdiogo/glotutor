// Set environment variables before any imports
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.PRIVATE_KEY = 'test-private-key';
process.env.PUBLIC_KEY = 'test-public-key';
process.env.JWT_ISSUER = 'test-issuer';
process.env.JWT_AUDIENCE = 'test-audience';
process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME = '15m';
process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME = '7d';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.CONTACT_EMAIL_RECIPIENT = 'test@example.com';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock_secret';
process.env.X_N8N_SECRET = 'test-telegram-bot-secret';
process.env.NEXT_PUBLIC_API_URI = 'http://localhost:3000/api';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_URL = 'https://api.exchangerate.test';
process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY = 'test-exchange-rate-key';
