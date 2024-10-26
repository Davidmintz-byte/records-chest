const currentEnv = process.env.NODE_ENV;
const apiUrl = process.env.REACT_APP_API_URL;

console.log('Environment Variables:', {
    NODE_ENV: currentEnv,
    REACT_APP_API_URL: apiUrl
});

// Determine API URL based on environment
const API_URL = currentEnv === 'production' 
    ? 'https://records-chest.onrender.com'  // Force production URL
    : 'http://localhost:5000';              // Local development URL

console.log('Using API_URL:', API_URL);

export { API_URL };