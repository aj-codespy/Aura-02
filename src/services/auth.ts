import { Amplify } from 'aws-amplify';
import {
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signOut,
} from 'aws-amplify/auth';
import { Logger } from './logger';

// Use example file as fallback for CI/CD (aws-exports.js is gitignored)
let awsConfig;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  awsConfig = require('../constants/aws-exports').default;
} catch {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  awsConfig = require('../constants/aws-exports.example').default;
}

// Configure Amplify
// @ts-ignore
Amplify.configure(awsConfig);

// MOCK MODE FLAG
const USE_MOCK_AUTH = true;

export const AuthService = {
  signIn: async (username: string, password: string) => {
    if (USE_MOCK_AUTH) {
      Logger.info(`[MockAuth] Signing in ${username}...`);
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
      Logger.error('Error signing in', error);
      throw error;
    }
  },

  signOut: async () => {
    if (USE_MOCK_AUTH) {
      Logger.info('[MockAuth] Signing out...');
      return;
    }

    try {
      await signOut();
    } catch (error) {
      Logger.error('Error signing out', error);
    }
  },

  getCurrentUser: async () => {
    if (USE_MOCK_AUTH) {
      return { userId: 'mock-user-id', username: 'Mock User' };
    }

    try {
      return await getCurrentUser();
    } catch (error) {
      Logger.info('No current user');
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
      Logger.info('No session');
      return null;
    }
  },
};
