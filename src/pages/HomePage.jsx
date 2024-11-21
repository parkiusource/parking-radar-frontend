import { Link } from 'react-router-dom';
import { FaAward, FaCalendarCheck, FaSquareParking } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import { CardContent } from '@/components/common/Card';
import { Card } from '@/components/common';
import { Button } from '@/components/common';
import { LuSearch } from "react-icons/lu";
import { LuParkingSquare } from "react-icons/lu";
import img_parkiu from '@/images/img_parkiu.webp';
import bg_map_hero from '@/images/bg_map_hero.webp';

const FeatureCard = ({ children, className, size = "sm", variant = "secondary" }) => {
  return (
    <Card size={size} variant={variant}>
      <CardContent
        className={twMerge(
          'flex flex-col justify-start items-center gap-4 text-center text-lg h-full text-primary-100',
          className,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
};

const HomePage = () => {
  return (
    <>
      <Header />

      <main className="flex flex-col gap-0 justify-center min-h-screen bg-primary text-white">
        {/* Hero Section */}
        <section 
          className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-6 py-12"
          style={{
            backgroundImage: `url(${bg_map_hero})`,
          }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-balance mt-36 mb-8 px-8">
            Disponibilidad en tiempo real de parqueaderos en tu ciudad
          </h2>
          <div className="flex flex-col items-center w-full gap-4 max-w-sm md:max-w-md lg:max-w-2xl">
            <div className="flex items-center bg-white rounded-full shadow-md w-full max-w-sm md:max-w-md lg:max-w-xl px-4 py-2">
              <span className="text-gray-400">
                <LuSearch />
              </span>
              <input
                type="text"
                placeholder="Dirección o lugar"
                className="flex-grow bg-transparent outline-none text-gray-600 px-4"
              />
              <Button
                variant="dark"
              >
                Buscar
              </Button>
            </div>

            <Button
                variant="dark"
                className="flex items-center gap-x-2 border-white hover:bg-white hover:text-blue-500 hover:border-blue-500"
              >
              <span><LuParkingSquare /></span>
              Encontrar parqueadero cerca de mí
            </Button>
          </div>
        </section>

        {/* Admin */}
        <section className="py-20 text-gray-800 bg-white flex justify-center">
          <div className="flex flex-row justify-between w-full max-w-6xl gap-x-12">

            <div className="flex flex-col justify-center max-w-xl gap-y-6">
              <h2 className="text-4xl font-bold mb-4 text-center md:text-left">
                ¡Administra tu parqueadero fácilmente!
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed max-w-md text-center md:text-left">
                Simplifica tu día a día con nuestras herramientas diseñadas para optimizar la gestión de parqueaderos. 
                ¡Aprovecha nuestra plataforma para mejorar tu eficiencia y ofrecer un mejor servicio!
              </p>
              <div className="flex flex-col md:flex-row justify-start items-center gap-6 mt-4">
                <Link to="/admin-landing">
                  <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg transition hover:bg-primary-400 hover:scale-105">
                    Únete como Administrador
                  </button>
                </Link>
                <p className="text-gray-600">
                  ¿Ya tienes una cuenta?{' '}
                  <a href="/" className="text-primary underline hover:text-primary-400">
                    Inicia sesión aquí
                  </a>
                </p>
              </div>
            </div>

            {/* Columna de la imagen */}
            <div className="w-full max-w-md aspect-[1/1] overflow-hidden flex items-center justify-center">
              <img 
                src={img_parkiu} 
                alt="Administrador de parqueaderos" 
                className="h-full object-cover rounded-3xl shadow-md" 
              />
            </div>
          </div>
        </section>


        {/* How It Works Section */}
        <section className="py-16 text-gray-800 bg-white" >
          <h2 className="text-center text-3xl font-bold mb-8">
            Cómo funciona ParkiÜ
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-10 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 w-1/3">
              <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center">
                <span><FaSquareParking className="text-6xl text-white" /></span>
              </div>
              <h3 className="text-xl font-semibold">Busca</h3>
              <p>
                Encuentra estacionamientos disponibles al instante
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 w-1/3">
              <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center">
                <span><FaAward className="text-6xl text-white" /></span>
              </div>
              <h3 className="text-xl font-semibold">Notoriedad</h3>
              <p>
                Conoce la reputación del sitio donde dejarás tu vehículo.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 w-1/3">
              <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center">
                <span><FaCalendarCheck className="text-6xl text-white" /></span>
              </div>
              <h3 className="text-xl font-semibold">Reserva</h3>
              <p>
                Paga de forma segura y recibe un pase de parqueo.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer className="" />
    </>
  );
};

export default HomePage;
