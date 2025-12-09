/**
 * SIMPLE BUTTON COMPONENT
 * 
 * A reusable button component we'll use throughout the app.
 * This is what we'll test!
 */

import React from 'react';

const Button = ({ label, onClick, disabled, variant = 'primary' }) => {
  const baseClasses = 'px-4 py-2 rounded font-semibold transition';
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
  }`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
      type="button"
    >
      {label}
    </button>
  );
};

export default Button;
