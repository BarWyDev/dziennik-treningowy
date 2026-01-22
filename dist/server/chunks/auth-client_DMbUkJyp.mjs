import { createAuthClient } from 'better-auth/react';

const authClient = createAuthClient({
  baseURL: "http://localhost:4321"
});
const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgetPassword,
  resetPassword
} = authClient;

export { signUp as a, signOut as b, forgetPassword as f, resetPassword as r, signIn as s };
