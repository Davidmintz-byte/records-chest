const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://records-chest.onrender.com'  // Use the same domain in production
  : 'http://localhost:5000';              // Use localhost in development

export { API_URL };