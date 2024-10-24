import { Link } from 'react-router-dom';
import { Card } from '@/components/common';
import { FaAward, FaCalendarCheck, FaSquareParking } from 'react-icons/fa6';
import { twMerge } from 'tailwind-merge';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Logo from '@/components/Logo';
import { CardContent } from '@/components/common/Card';

const FeatureCard = ({ children, className }) => {
  return (
    <Card size="sm" variant="secondary">
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
      <main className="mt-24 py-8 flex flex-col gap-12 md:gap-32 justify-center min-h-screen bg-boxes-secondary md:mt-0">
        <section className="w-full text-white text-center space-y-4 flex items-center justify-center">
          <div className="flex flex-col gap-12 sticky top-1/2">
            <Logo className="w-full h-full px-8 md:h-48" />
            <h2 className="text-2xl md:text-3xl font-light px-8 md:max-w-4xl">
              Disponibilidad en tiempo real de parqueaderos en tu ciudad
            </h2>
          </div>
        </section>
        <section className="mb-4">
          <div className="flex gap-8 flex-wrap items-stretch justify-center px-8">
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
      </main>
      <Footer className="md:fixed md:bottom-0" />
    </>
  );
};

export default HomePage;
