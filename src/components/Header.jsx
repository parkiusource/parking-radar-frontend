import logo from "@/assets/Parkify.svg";
import { Link } from "react-router-dom";

import { twMerge } from "tailwind-merge";

const getHeaderclassName = ({ className } = {}) => {
  return twMerge(["fixed top-0", "w-full h-50 p-4", "bg-secondary", "flex justify-between items-center", "text-white", className]);
};

const Header = () => (
  <header className={getHeaderclassName()}>
    <div className="flex items-center gap-2">
      <img src={logo} alt="Logo" style={{ width: "40px", height: "auto" }} className="app-logo" />
      <Link className="font-medium text-lg" to="/">
        Parkify
      </Link>
    </div>
    <div className="items-center gap-8 hidden md:flex">
      <Link className="nav-link" to="/">
        Inicio
      </Link>
      <Link className="nav-link" to="/map">
        Mapa
      </Link>
      <Link className="nav-link" to="/features">
        Nosotros
      </Link>
      <Link className="nav-link" to="/pqrs">
        Contacto
      </Link>
      <Link className="nav-link" to="/register-admin">
        Registro
      </Link>
    </div>
  </header>
);

export default Header;
