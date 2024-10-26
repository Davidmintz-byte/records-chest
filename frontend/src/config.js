console.log('Current environment:', process.env.NODE_ENV);
console.log('Current API URL:', process.env.REACT_APP_API_URL);

const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
    console.error('API URL not configured!');
}

export { API_URL };