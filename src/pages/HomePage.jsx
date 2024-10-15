import { Link } from "react-router-dom";
import Card from "@/components/Card";
import { FaAward, FaCalendarCheck, FaSquareParking } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

const FeatureCard = ({ children, className }) => {
  return (
    <Card
      className={twMerge(
        "flex flex-col justify-start items-center gap-4 text-center text-lg h-full text-primary-100 bg-secondary",
        className
      )}
      size="sm"
    >
      {children}
    </Card>
  );
};

const HomePage = () => {
  return (
    <div className="home-page">
      <main className="flex flex-col gap-32 justify-center min-h-screen">
        <section className="w-full text-white text-center space-y-4 flex items-center justify-center">
          <div className="flex flex-col gap-12 sticky top-1/2">
            <h1 className="card-title text-7xl font-bold text-primary-50 text-shadow-primary">Parkify</h1>
            <h2 className="text-3xl font-light">
              El único sistema que te da en tiempo real la disponibilidad de parqueaderos en tu ciudad
            </h2>
          </div>
        </section>
        <section className="mb-4">
          <div className="flex gap-8 flex-wrap items-stretch justify-center px-8">
            <Link className="nav-link" to="/map">
              <FeatureCard>
                <FaSquareParking className="text-6xl text-primary" />
                <span className="my-auto">Encuentra estacionamientos disponibles al instante</span>
              </FeatureCard>
            </Link>
            <Link className="nav-link" to="/map">
              <FeatureCard>
                <FaAward className="text-6xl text-primary" />
                <span className="my-auto">Conoce la reputación del sitio donde dejarás tu vehículo</span>
              </FeatureCard>
            </Link>
            <Link className="nav-link" to="/map">
              <FeatureCard>
                <FaCalendarCheck className="text-6xl text-primary" />
                <span className="my-auto">Reserva incluso con días de anticipación</span>
              </FeatureCard>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
