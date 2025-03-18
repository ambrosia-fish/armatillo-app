
// Configuration for different environments
const getApiUrl = () => {
  // When running in development mode (local)
  if (__DEV__) {
    // Use the development deployment on Railway
    return 'https://armatillo-api-development.up.railway.app/api';
    
    // Uncomment this if you want to use a local server instead
    // return 'http://localhost:3000/api';
  }
  
  // When running in production (deployed app)
  return 'https://armatillo-api-production.up.railway.app/api';
};

