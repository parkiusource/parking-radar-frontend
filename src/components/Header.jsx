import logo from '../assets/smart-parking-logo.png';

const Header = () => (
  <header className="app-header">
    <img src={logo} alt="Logo" className="app-logo" />
    <h1>Smart Parking Radar</h1>
  </header>
);

export default Header;
