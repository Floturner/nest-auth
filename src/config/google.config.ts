import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
}));
