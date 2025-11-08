export const ADMIN_CREDENTIALS = {  
  email: 'admin@bingo.com',  
  password: 'admin123'  
};  

export const loginAdmin = (email, password) => {  
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {  
    localStorage.setItem('adminLoggedIn', 'true');  
    return true;  
  }  
  return false;  
};  

export const isAdminLoggedIn = () => {  
  return localStorage.getItem('adminLoggedIn') === 'true';  
};  

export const logoutAdmin = () => {  
  localStorage.removeItem('adminLoggedIn');  
};