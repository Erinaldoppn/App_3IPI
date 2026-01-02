
import React, { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 'md', light = false }) => {
  const [error, setError] = useState(false);

  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-24 w-24',
    xl: 'h-40 w-40'
  };

  // URL padronizada no bucket 'midia'
  const logoUrl = "https://luvdpnpnzotosndovtry.supabase.co/storage/v1/object/public/midia/logo-3ipi.png";

  if (error) {
    return (
      <div className={`${sizes[size]} ${className} flex items-center justify-center relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 20H60V80H40V20Z" fill={light ? "white" : "currentColor"} />
          <path d="M20 40H80V55H20V40Z" fill={light ? "white" : "currentColor"} />
          <path d="M50 10C55 25 65 30 50 45C35 30 45 25 50 10Z" fill="#FCFC30" />
        </svg>
        <span className={`absolute -bottom-1 font-black tracking-tighter text-[10px] ${light ? 'text-white' : 'text-brand-blue'}`}>3IPI</span>
      </div>
    );
  }

  return (
    <img 
      src={logoUrl} 
      alt="Logo 3IPI" 
      className={`${sizes[size]} ${className} object-contain`}
      onError={() => setError(true)}
    />
  );
};

export default Logo;
