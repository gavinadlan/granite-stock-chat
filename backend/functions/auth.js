// AWS Lambda function for authentication
const AWS = require('aws-sdk');
const crypto = require('crypto');

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    console.log('Auth Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        const { action } = event.pathParameters || {};
        const body = JSON.parse(event.body || '{}');
        
        switch (action) {
            case 'register':
                return await handleRegister(body);
            case 'login':
                return await handleLogin(body);
            case 'verify':
                return await handleVerify(body);
            case 'profile':
                return await handleProfile(body);
            case 'update-profile':
                return await handleUpdateProfile(body);
            default:
                return {
                    statusCode: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                    },
                    body: JSON.stringify({
                        error: 'Invalid action'
                    })
                };
        }
    } catch (error) {
        console.error('Auth error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Internal server error'
            })
        };
    }
};

async function handleRegister(body) {
    const { email, password, name } = body;
    
    if (!email || !password || !name) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Email, password, and name are required'
            })
        };
    }
    
    try {
        const params = {
            UserPoolId: process.env.USER_POOL_ID,
            Username: email,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                },
                {
                    Name: 'name',
                    Value: name
                }
            ],
            MessageAction: 'SEND',
            TemporaryPassword: password
        };
        
        const result = await cognito.adminCreateUser(params).promise();
        
        // Set permanent password
        await cognito.adminSetUserPassword({
            UserPoolId: process.env.USER_POOL_ID,
            Username: email,
            Password: password,
            Permanent: true
        }).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                message: 'User registered successfully',
                userId: result.User.Username
            })
        };
    } catch (error) {
        console.error('Register error:', error);
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: error.message || 'Registration failed'
            })
        };
    }
}

async function handleLogin(body) {
    const { email, password } = body;
    
    if (!email || !password) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Email and password are required'
            })
        };
    }
    
    try {
        const params = {
            AuthFlow: 'ADMIN_NO_SRP_AUTH',
            UserPoolId: process.env.USER_POOL_ID,
            ClientId: process.env.USER_POOL_CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };
        
        const result = await cognito.adminInitiateAuth(params).promise();
        
        // Get user details
        const userResult = await cognito.adminGetUser({
            UserPoolId: process.env.USER_POOL_ID,
            Username: email
        }).promise();
        
        const userAttributes = {};
        userResult.UserAttributes.forEach(attr => {
            userAttributes[attr.Name] = attr.Value;
        });
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                message: 'Login successful',
                accessToken: result.AuthenticationResult.AccessToken,
                refreshToken: result.AuthenticationResult.RefreshToken,
                user: {
                    userId: userResult.Username,
                    email: userAttributes.email,
                    name: userAttributes.name
                }
            })
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Invalid credentials'
            })
        };
    }
}

async function handleProfile(body) {
    const { accessToken } = body;
    
    if (!accessToken) {
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Access token required'
            })
        };
    }
    
    try {
        const params = {
            AccessToken: accessToken
        };
        
        const result = await cognito.getUser(params).promise();
        
        const userAttributes = {};
        result.UserAttributes.forEach(attr => {
            userAttributes[attr.Name] = attr.Value;
        });
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                user: {
                    userId: result.Username,
                    email: userAttributes.email,
                    name: userAttributes.name
                }
            })
        };
    } catch (error) {
        console.error('Profile error:', error);
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Invalid access token'
            })
        };
    }
}

async function handleUpdateProfile(body) {
    const { accessToken, name } = body;
    
    if (!accessToken || !name) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Access token and name are required'
            })
        };
    }
    
    try {
        const params = {
            AccessToken: accessToken,
            UserAttributes: [
                {
                    Name: 'name',
                    Value: name
                }
            ]
        };
        
        await cognito.updateUserAttributes(params).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                message: 'Profile updated successfully'
            })
        };
    } catch (error) {
        console.error('Update profile error:', error);
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Failed to update profile'
            })
        };
    }
}

async function handleVerify(body) {
    const { email, code } = body;
    
    if (!email || !code) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Email and verification code are required'
            })
        };
    }
    
    try {
        const params = {
            UserPoolId: process.env.USER_POOL_ID,
            Username: email,
            ConfirmationCode: code
        };
        
        await cognito.confirmSignUp(params).promise();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                message: 'Email verified successfully'
            })
        };
    } catch (error) {
        console.error('Verify error:', error);
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Invalid verification code'
            })
        };
    }
}
