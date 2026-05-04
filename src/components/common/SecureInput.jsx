import { useState } from 'react';
import { sanitizeInput } from '../../config/security';

const SecureInput = ({ 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  maxLength = 255,
  pattern,
  ...props 
}) => {
  const [error, setError] = useState('');

  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // Sanitize input
    newValue = sanitizeInput(newValue);
    
    // Validate based on type
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
      if (newValue && !emailRegex.test(newValue)) {
        setError('Please enter a valid email address');
      } else {
        setError('');
      }
    } else if (type === 'password' && newValue) {
      if (newValue.length < 8) {
        setError('Password must be at least 8 characters');
      } else if (!/(?=.*[A-Z])/.test(newValue)) {
        setError('Password must contain at least one uppercase letter');
      } else if (!/(?=.*[a-z])/.test(newValue)) {
        setError('Password must contain at least one lowercase letter');
      } else if (!/(?=.*\d)/.test(newValue)) {
        setError('Password must contain at least one number');
      } else {
        setError('');
      }
    } else {
      setError('');
    }
    
    onChange({ target: { name, value: newValue } });
  };

  return (
    <div className="w-full">
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        pattern={pattern}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SecureInput;