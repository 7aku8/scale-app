import { registerAs } from '@nestjs/config';

export default registerAs('websocket', () => ({
  cors: {
    origin: process.env.WS_CORS_ORIGIN || '*',
    credentials: true,
  },
  namespace: '/ws',
  transports: ['websocket', 'polling'],
}));
