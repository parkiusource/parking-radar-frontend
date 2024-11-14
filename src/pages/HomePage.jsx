import { Link } from 'react-router-dom';
import { Card } from '@/components/common';
import { FaAward, FaCalendarCheck, FaSquareParking } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import Logo from '@/components/Logo';
import { CardContent } from '@/components/common/Card';

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
      <main className="mt-24 pt-8 flex flex-col gap-12 justify-center min-h-screen bg-boxes-secondary md:my-0">
        <section className="w-full text-white text-center space-y-4 flex items-center justify-center mt-12">
          <div className="flex flex-col gap-8 sticky top-1/2">
            <Logo className="w-full h-full px-8 md:h-48" />
            <h2 className="text-2xl md:text-3xl font-light px-8 md:max-w-4xl">
              Disponibilidad en tiempo real de parqueaderos en tu ciudad
            </h2>
          </div>
        </section>
        <section className="mb-4">
          <div className="flex gap-8 flex-wrap items-stretch justify-center px-8 mb-16">
            <Link className="nav-link" to="/map">
              <FeatureCard>
                <FaSquareParking className="text-6xl text-primary-300" />
                <span className="my-auto">
                  Encuentra estacionamientos disponibles al instante
                </span>
              </FeatureCard>
            </Link>
            <Link className="nav-link" to="/map">
              <FeatureCard>
                <FaAward className="text-6xl text-primary-300" />
                <span className="my-auto">
                  Conoce la reputación del sitio donde dejarás tu vehículo
                </span>
              </FeatureCard>
            </Link>
            <Link className="nav-link" to="/map">
              <FeatureCard>
                <FaCalendarCheck className="text-6xl text-primary-300" />
                <span className="my-auto">
                  Reserva incluso con días de anticipación
                </span>
              </FeatureCard>
            </Link>
          </div>
        </section>
        <section className="flex flex-col items-center justify-center text-center py-8 px-8">
          <FeatureCard size="xxl" variant="white" >
            <p className="text-gray-700 text-lg max-w-md mb-6">
              Imagina gestionar tu parqueadero desde cualquier lugar, a cualquier hora. Con nuestra plataforma, tienes el control absoluto para optimizar y hacer crecer tu negocio, adaptándose a tus necesidades.
            </p>

            <h1 className="text-4xl font-bold text-primary mb-4">
              Bienvenido a nuestra plataforma
            </h1>

            <p className="text-gray-600 text-lg max-w-md mb-8">
              Gestiona tu parqueadero con nuestras herramientas, diseñadas para simplificar y mejorar tu día a día.
            </p>

            <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold mb-4 hover:bg-[#0c94d4]">
              Únete como Administrador
            </button>

            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <a href="/" className="text-primary underline hover:text-[#0c94d4]">
                Iniciar sesión
              </a>
            </p>
          </FeatureCard>
        </section>
      </main>
      <Footer className="" />
    </>
  );
};

export default HomePage;
