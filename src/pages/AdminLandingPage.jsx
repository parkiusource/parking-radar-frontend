import { Header } from '@/components/Header';
import { Button } from '@/components/common';
import Footer from '@/components/Footer';
import imgParkiu from '@/images/img-parking.webp';
import imgAdmin from '@/images/img-admin.webp';
import { useTranslation } from 'react-i18next';

const AdminLandingPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <main className="flex flex-col items-center min-h-screen gap-y-8 bg-white">
        <section className="w-full bg-white text-white text-center space-y-4 flex flex-col items-center justify-center min-h-96 gap-y-4 pt-12 ">
          <h1 className="text-3xl font-bold text-primary mb-4 mt-8">{t('admin.landing.title', 'Únete como Administrador')}</h1>
          <p className="text-2xl md:text-3xl text-secondary font-light px-8 md:max-w-4xl">
            {t('admin.landing.subtitle', 'Empieza a gestionar tu parqueadero con nuestras herramientas')}
          </p>
        </section>

        <section className="flex flex-col-reverse sm:flex-row items-center gap-12 bg-white rounded-lg overflow-hidden max-w-5xl">
          {/* Imagen representativa */}
          <div className="w-1/2 aspect-[1/1] overflow-hidden flex items-center justify-center">
            <img
              src={imgAdmin}
              alt={t('admin.landing.personImage', 'Persona utilizando ParkiÜ')}
              className="h-full object-cover rounded-lg"
            />
          </div>

          {/* Contenido de texto */}
          <div className="sm:w-1/2 p-6 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Monitorea y gestiona parqueaderos en tiempo real
            </h1>
            <p className="text-gray-700 mb-6">
              Usa ParkiÜ para visualizar y administrar parqueaderos desde un mapa interactivo con información actualizada en tiempo real.
            </p>
            <Button
              variant="default"
              className="w-full "
            >
              Regístrate para empezar
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              Conoce más sobre cómo gestionar y monitorear tus parqueaderos.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-5xl w-full mb-8">
          <div className="bg-secondary text-center p-6 md:rounded-lg shadow-lg flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold text-primary mb-2">¿Tienes dudas?</h2>
            <p className="text-white mb-4">Contáctanos para saber cómo podemos ayudarte a crecer.</p>
            <Button
              variant="default"
              className="w-full "
            >
              Contáctanos
            </Button>
          </div>

          <div className=" max-w-2xl aspect-[4/3] overflow-hidden flex items-center justify-center">
            <img
              src={imgParkiu}
              alt="Administrador de parqueaderos"
              className="h-full object-cover md:rounded-lg shadow-md"
            />
          </div>
        </section>

      </main>
      <Footer className="" />
    </>
  );
};

export default AdminLandingPage;
