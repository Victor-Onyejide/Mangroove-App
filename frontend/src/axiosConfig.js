import axios from 'axios';

// Configure Axios to include cookies in all requests
axios.defaults.withCredentials = true;
// In development, point axios directly at the backend so the browser receives Set-Cookie headers
if (process.env.NODE_ENV === 'development') {
	axios.defaults.baseURL = 'http://localhost:4000';
}
