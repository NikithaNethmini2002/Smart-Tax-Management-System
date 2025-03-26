export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user && user.token) {
    // For Spring Boot back-end
    // return { Authorization: 'Bearer ' + user.token };
    
    // For Node.js Express back-end
    return { 'x-auth-token': user.token };
  } else {
    return {};
  }
} 