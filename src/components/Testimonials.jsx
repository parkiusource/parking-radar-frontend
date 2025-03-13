import { useTranslation } from 'react-i18next';

export const Testimonials = () => {
  const { t } = useTranslation();

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">{t('testimonials.title', 'Lo que dicen nuestros usuarios')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                C
              </div>
              <div>
                <h3 className="font-semibold">{t('testimonials.carlos.name', 'Carlos Ramírez')}</h3>
                <p className="text-gray-600 text-sm">{t('testimonials.carlos.role', 'Conductor')}</p>
              </div>
            </div>
            <p className="italic text-gray-700">&ldquo;{t('testimonials.carlos.text', 'ParkiÜ me ha ahorrado mucho tiempo y estrés. Ahora encuentro parqueadero en minutos y puedo planificar mejor mis salidas.')}&rdquo;</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                M
              </div>
              <div>
                <h3 className="font-semibold">{t('testimonials.maria.name', 'María González')}</h3>
                <p className="text-gray-600 text-sm">{t('testimonials.maria.role', 'Administradora de Parqueadero')}</p>
              </div>
            </div>
            <p className="italic text-gray-700">&ldquo;{t('testimonials.maria.text', 'Desde que registré mi parqueadero en ParkiÜ, he aumentado mis clientes en un 30%. La plataforma es intuitiva y fácil de usar.')}&rdquo;</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl mr-4">
                A
              </div>
              <div>
                <h3 className="font-semibold">{t('testimonials.andres.name', 'Andrés Martínez')}</h3>
                <p className="text-gray-600 text-sm">{t('testimonials.andres.role', 'Conductor frecuente')}</p>
              </div>
            </div>
            <p className="italic text-gray-700">&ldquo;{t('testimonials.andres.text', 'Las reseñas y comentarios me ayudan a elegir parqueaderos seguros. La información actualizada de disponibilidad es invaluable.')}&rdquo;</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
