// Force production URL when deployed
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://records-chest.onrender.com';

console.log('Config - Using API_URL:', API_URL);
console.log('Config - Window Location:', window.location.hostname);

export { API_URL };