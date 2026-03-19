import React from 'react';

const SurakshaSVGLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="15" fill="rgba(225,29,116,0.12)" stroke="rgba(225,29,116,0.45)" strokeWidth="1.5"/>
    <path d="M16 6C16 6 9 9.5 9 15.5V20.5L16 24L23 20.5V15.5C23 9.5 16 6 16 6Z"
      fill="rgba(225,29,116,0.2)" stroke="#E11D74" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="16" cy="16" r="3" fill="#E11D74"/>
    <path d="M13 21H19" stroke="#E11D74" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

export default SurakshaSVGLogo;
