import 'server-only';

import { PrivyClient, type User as PrivyUser } from '@privy-io/node';

const getRequiredEnv = (name: 'NEXT_PUBLIC_PRIVY_APP_ID' | 'PRIVY_APP_SECRET') => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const privyClient = new PrivyClient({
  appId: getRequiredEnv('NEXT_PUBLIC_PRIVY_APP_ID'),
  appSecret: getRequiredEnv('PRIVY_APP_SECRET'),
});

export const getPrivyUserFromIdentityToken = async (
  identityToken: string,
): Promise<PrivyUser> => {
  const tokenUser = await privyClient.users().get({ id_token: identityToken });

  // Identity tokens can omit linked accounts due to JWT size limits. Fetch the
  // canonical user after the token has been verified to include all wallets.
  return privyClient.users()._get(tokenUser.id);
};
