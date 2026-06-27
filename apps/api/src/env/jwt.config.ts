import { registerAs } from '@nestjs/config';
import ms, { StringValue } from 'ms';

const accessTtl: StringValue = '15m';
const refreshTtl: StringValue = '30d';

const KEY = 'jwt';

export default registerAs(KEY, () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  accessTtl,
  refreshTtl,
  refreshMaxAgeMs: ms(refreshTtl),
}));
