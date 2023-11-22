import { registerAs } from '@nestjs/config';

export default registerAs('session', () => ({
  secret: process.env.SESSION_SECRET,
}));
