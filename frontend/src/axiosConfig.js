import axios from 'axios';

// Configure Axios to include cookies in all requests
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:4000'; // Update with your backend URL