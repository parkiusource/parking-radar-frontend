import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

const AdminLandingPage = () => {
  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-screen bg-boxes-secondary p-4 ">
        <section className="w-full text-white text-center space-y-4 flex flex-col items-center justify-center gap-y-4">
          <h1 className="text-3xl font-bold text-primary-300 mb-4">Únete como Administrador</h1>
          <p className="text-2xl md:text-3xl font-light px-8 md:max-w-4xl">
            Empieza a gestionar tu parqueadero con nuestras herramientas
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full mt-12 px-4">
          {/* CTA: Regístrate ahora */}
          <div className="bg-white text-center p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-primary mb-2">Empieza hoy</h2>
            <p className="text-gray-600 mb-4">Accede instantáneamente a las herramientas de administración de parqueaderos.</p>
            <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
              Registrarse ahora
            </button>
          </div>

          <div className="bg-white text-center p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-primary mb-2">¿Tienes dudas?</h2>
            <p className="text-gray-600 mb-4">Contáctanos para saber cómo podemos ayudarte a crecer.</p>
            <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
              Contáctanos
            </button>
          </div>
        </section>

      </main>
      <Footer className="" />
    </>
  );
};

export default AdminLandingPage;
