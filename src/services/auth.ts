import { Amplify } from 'aws-amplify';
import { fetchAuthSession, getCurrentUser, signIn, signOut } from 'aws-amplify/auth';
// Use example file as fallback for CI/CD (aws-exports.js is gitignored)
let awsConfig;
try {
  awsConfig = require('../constants/aws-exports').default;
} catch {
  awsConfig = require('../constants/aws-exports.example').default;
}

const USER_KEY = 'current_user';
// Configure Amplify
// @ts-ignore
Amplify.configure(awsConfig);

// MOCK MODE FLAG
const USE_MOCK_AUTH = true;

export const AuthService = {
  signIn: async (username: string, password: string) => {
    if (USE_MOCK_AUTH) {
      console.log(`[MockAuth] Signing in ${username}...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network

      if (username && password) {
        return { isSignedIn: true, nextStep: { signInStep: 'DONE' } };
      } else {
        throw new Error('Invalid credentials');
      }
    }

    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });
      return { isSignedIn, nextStep };
    } catch (error) {
      console.error('Error signing in', error);
      throw error;
    }
  },

  signOut: async () => {
    if (USE_MOCK_AUTH) {
      console.log('[MockAuth] Signing out...');
      return;
    }

    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out', error);
    }
  },

  getCurrentUser: async () => {
    if (USE_MOCK_AUTH) {
      return { userId: 'mock-user-id', username: 'Mock User' };
    }

    try {
      return await getCurrentUser();
    } catch (error) {
      console.log('No current user');
      return null;
    }
  },

  getSession: async () => {
    if (USE_MOCK_AUTH) {
      return { isSignedIn: true };
    }

    try {
      return await fetchAuthSession();
    } catch (error) {
      console.log('No session');
      return null;
    }
  },
};
