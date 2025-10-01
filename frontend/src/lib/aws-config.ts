// AWS Amplify configuration for direct Cognito integration
import { Amplify } from 'aws-amplify';

// Get configuration from environment variables
const awsConfig = {
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      userPoolId: import.meta.env.VITE_USER_POOL_ID || 'us-east-1_XXXXXXXXX',
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
      loginWith: {
        email: true,
      },
    },
  },
};

// Validate configuration
if (!import.meta.env.VITE_USER_POOL_ID || import.meta.env.VITE_USER_POOL_ID.includes('XXXXXXXXX')) {
  console.warn('⚠️ AWS Cognito configuration not set. Please configure VITE_USER_POOL_ID and VITE_USER_POOL_CLIENT_ID in .env.local');
  console.warn('📝 See env.aws.template for configuration instructions');
}

// Initialize Amplify
Amplify.configure(awsConfig);

export default awsConfig;
