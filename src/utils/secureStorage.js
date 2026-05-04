// Secure storage with encryption (simple version)
// For production, use a proper encryption library

const encrypt = (data) => {
    // In production, use proper encryption
    // This is a simple base64 encoding for demo
    return btoa(JSON.stringify(data));
  };
  
  const decrypt = (encryptedData) => {
    try {
      return JSON.parse(atob(encryptedData));
    } catch {
      return null;
    }
  };
  
  export const secureStorage = {
    setItem: (key, value) => {
      try {
        const encrypted = encrypt(value);
        localStorage.setItem(key, encrypted);
      } catch (error) {
        console.error('Error saving to secure storage:', error);
      }
    },
    
    getItem: (key) => {
      try {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;
        return decrypt(encrypted);
      } catch (error) {
        console.error('Error reading from secure storage:', error);
        return null;
      }
    },
    
    removeItem: (key) => {
      localStorage.removeItem(key);
    },
    
    clear: () => {
      localStorage.clear();
    }
  };