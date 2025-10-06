import React from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  icon
}) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border border-border rounded-lg
          bg-card text-foreground placeholder-text-muted
          focus:outline-none focus:ring-2 focus:ring-tesla-red focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : ''}
          ${className}
        `}
      />
    </div>
  );
};
