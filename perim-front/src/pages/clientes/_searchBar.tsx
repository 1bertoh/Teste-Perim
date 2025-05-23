import React from 'react';
import { Input } from "@heroui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, label, placeholder, className }) => {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label={label}
      placeholder={placeholder}
      variant="underlined"
      className={className}
      startContent={
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
    />
  );
};

export default SearchBar;