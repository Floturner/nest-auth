import { registerAs } from '@nestjs/config';

export default registerAs('tfa', () => ({
  appName: process.env.TFA_APP_NAME,
}));
