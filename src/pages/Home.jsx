// src/pages/Home.jsx
import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>¡Bienvenido a</h1>
      <h1>SMART PARKING RADAR!</h1>
      <p>Encuentra fácilmente espacios de estacionamiento cerca de ti.</p>
      <a href="/map" className="start-button">Comenzar a Buscar</a>
      <p></p>
      <a href="/info" className="start-button">Aprende más sobre nosotros</a>
    </div>
  );
};

export default Home;