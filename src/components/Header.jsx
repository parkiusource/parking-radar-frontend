import logo from '../assets/smart-parking-logo4.png';

const Header = () => (
  <header className="app-header">
    <img src={logo} alt="Logo" style={{ width: '70px', height: 'auto' }} className="app-logo" />
    <h1>Smart Parking Radar</h1>
  </header>
);

export default Header;
