import * as Sentry from '@sentry/react-native';

// Initialize Sentry for error tracking
// Get your DSN from https://sentry.io
export const initSentry = () => {
    const SENTRY_DSN = process.env.SENTRY_DSN;

    if (!SENTRY_DSN) {
        console.log('Sentry DSN not configured - error tracking disabled');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,

        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,

        // Enable in production only
        enabled: !__DEV__,

        // Environment
        environment: __DEV__ ? 'development' : 'production',

        // Release version
        release: 'com.ajcodespy.aura@1.0.0',
    });

    console.log('✅ Sentry initialized for error tracking');
};

// Capture error manually
export const captureError = (error: Error, context?: Record<string, any>) => {
    if (__DEV__) {
        console.error('Error:', error, context);
    } else {
        Sentry.captureException(error, { extra: context });
    }
};

// Capture message
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    if (!__DEV__) {
        Sentry.captureMessage(message, level);
    }
};

// Set user context
export const setUserContext = (userId: string, email?: string) => {
    Sentry.setUser({
        id: userId,
        email,
    });
};

// Clear user context (on logout)
export const clearUserContext = () => {
    Sentry.setUser(null);
};
