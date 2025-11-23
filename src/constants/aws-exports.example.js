// AWS Amplify Configuration
// IMPORTANT: This is an example file. Copy this to aws-exports.js and update with your credentials.
// The aws-exports.js file is gitignored to protect your credentials.
//
// Setup Instructions:
// 1. Copy this file: cp aws-exports.example.js aws-exports.js
// 2. Update the values below with your AWS Cognito credentials
// 3. Or use environment variables (recommended for production)

const awsConfig = {
    Auth: {
        Cognito: {
            // Get from AWS Console → Cognito → User Pools
            userPoolId: process.env.EXPO_PUBLIC_AWS_USER_POOL_ID || 'us-east-1_XXXXXXXXX',

            // Get from User Pool → App Integration → App clients
            userPoolClientId: process.env.EXPO_PUBLIC_AWS_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
        }
    }
};

export default awsConfig;
