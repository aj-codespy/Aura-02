// AWS Amplify Configuration
// IMPORTANT: This is an example file. Copy this to aws-exports.js and update with your credentials.
// The aws-exports.js file is gitignored to protect your credentials.

const awsConfig = {
    Auth: {
        Cognito: {
            userPoolId: 'us-east-1_xxxxxxxxx',  // Replace with your Cognito User Pool ID
            userPoolClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',  // Replace with your App Client ID
        }
    }
};

export default awsConfig;
