import { Button } from '@/components/common';
import Logo from '@/components/Logo';
import { FaInstagram, FaSquareFacebook } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

import { twMerge } from 'tailwind-merge';

const getHeaderclassName = ({ className } = {}) => {
  return twMerge([
    'fixed top-0 z-10',
    'w-full h-50 p-4',
    'bg-secondary',
    'flex justify-between items-center',
    'text-white',
    className,
  ]);
};

const Header = () => (
  <header className={getHeaderclassName()}>
    <Link className="font-medium text-2xl flex items-center gap-2" to="/">
      <Logo />
      <span className="translate-y-1">Parkify</span>
    </Link>
    <div className="items-center gap-8 hidden md:flex">
      <Link to="/about">Nosotros</Link>
      <Link to="/parking">
        <Button>Inicia ahora</Button>
      </Link>

      <div className="text-xl flex items-center gap-4 pr-2">
        <Link
          href="https://www.facebook.com/profile.php?id=100009699556618"
          target="_blank"
        >
          <FaSquareFacebook />
        </Link>

        <Link
          href="https://www.facebook.com/profile.php?id=100009699556618"
          target="_blank"
        >
          <FaInstagram />
        </Link>
      </div>
    </div>
  </header>
);

export default Header;
