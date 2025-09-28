// Simple admin authentication utility
// In a real application, this would connect to a proper database

const ADMIN_USERS = [
  {
    id: 1,
    email: 'murai@admin.com',
    password: 'muraitestadmin123', // In production, this would be hashed
    name: 'MURAi Administrator',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastLogin: null,
    isActive: true
  }
];

export const authenticateAdmin = (email, password) => {
  return new Promise((resolve, reject) => {
    // Simulate async database call
    setTimeout(() => {
      const user = ADMIN_USERS.find(u => 
        u.email === email && 
        u.password === password && 
        u.isActive
      );

      if (user) {
        // Update last login (in real app, this would update the database)
        user.lastLogin = new Date().toISOString();
        
        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 500); // Simulate network delay
  });
};

export const validateAdminSession = (token) => {
  return new Promise((resolve, reject) => {
    try {
      // In a real app, this would validate a JWT token
      const adminAuth = JSON.parse(token);
      const user = ADMIN_USERS.find(u => u.email === adminAuth.email);
      
      if (user && user.isActive) {
        const { password: _, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } else {
        reject(new Error('Invalid session'));
      }
    } catch (error) {
      reject(new Error('Invalid token format'));
    }
  });
};

export const getAllAdminUsers = () => {
  return ADMIN_USERS.map(({ password: _, ...user }) => user);
};

export const createAdminUser = (userData) => {
  const newUser = {
    id: ADMIN_USERS.length + 1,
    ...userData,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    isActive: true
  };
  
  ADMIN_USERS.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const updateAdminUser = (id, updates) => {
  const userIndex = ADMIN_USERS.findIndex(u => u.id === id);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  ADMIN_USERS[userIndex] = { ...ADMIN_USERS[userIndex], ...updates };
  const { password: _, ...userWithoutPassword } = ADMIN_USERS[userIndex];
  return userWithoutPassword;
};

export const deactivateAdminUser = (id) => {
  return updateAdminUser(id, { isActive: false });
};
