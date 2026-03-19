import React from 'react';
import Logo from './Logo';

const Navbar = ({ rightContent, title = 'SURAKSHA' }) => (
  <nav className="navbar">
    <div className="navbar__logo">
      <Logo size={28} />
      <span className="navbar__title text-gradient-pink">{title}</span>
    </div>
    {rightContent && <div className="navbar__actions">{rightContent}</div>}
  </nav>
);

export default Navbar;
