import iconAboutUs from '../assets/Icon-AboutUs.png';
import iconGoal from '../assets/Icon-Goal.png';
import iconCelebrate from '../assets/Icon-Celebrate.png';
import iconGuide from '../assets/Icon-Guide.png';
import iconSmartCar from '../assets/Icon-SmartCar.png';
import iconInteresting from '../assets/Icon-Interesting.png';
import iconLogo from '../assets/smart-parking-logo3.png';

const Features = () => {
  return (
    <div className="home-page">
      <main className="container mx-auto mt-24 px-4">
        <section className="bg-white p-6 shadow-lg rounded-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">SOBRE NOSOTROS</h1>

            <div className="flex flex-col md:flex-row justify-center items-center text-justify mb-6">
              <img src={iconAboutUs} alt="Icono de presentación" className="w-20 h-20 mr-4 mb-4 md:mb-0" />
              <p>
                Este proyecto surgió como parte de la Especialización en Ingeniería de Software de la Universidad Antonio Nariño. Fue desarrollado por estudiantes a lo largo del año académico 2024, con el objetivo de aplicar conocimientos adquiridos y crear una solución innovadora.
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center text-justify mb-6">
              <p className="md:order-2 md:ml-4">
                El propósito principal del proyecto es diseñar un sistema que identifique parqueaderos en zonas de interés dentro de Bogotá, mejorando la experiencia de los usuarios al buscar estacionamientos en áreas de alta afluencia, como centros comerciales y zonas de entretenimiento.
              </p>
              <img src={iconGoal} alt="Icono de meta" className="w-20 h-20 mr-4 md:order-1 mb-4 md:mb-0" />
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center text-justify mb-6">
              <img src={iconGuide} alt="Icono de guía" className="w-20 h-20 mr-4 mb-4 md:mb-0" />
              <p>
                La plataforma ofrece acceso a información en tiempo real sobre la disponibilidad de espacios de estacionamiento. Esto permite a los conductores dirigirse rápidamente a lugares cercanos y accesibles, ayudando a reducir el tráfico y apoyando el desarrollo económico de la ciudad.
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center text-justify mb-6">
              <p className="md:order-2 md:ml-4">
                Desde una perspectiva técnica, hemos desarrollado un dispositivo IoT que se instala en los parqueaderos. Este dispositivo envía información en tiempo real a nuestro servicio, que gestiona los datos de forma eficiente. Los usuarios pueden consultar la disponibilidad de los espacios a través de esta página web.
              </p>
              <img src={iconSmartCar} alt="Icono de SmartCar" className="w-20 h-20 mr-4 md:order-1 mb-4 md:mb-0" />
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center text-justify mb-6">
              <img src={iconCelebrate} alt="Icono de celebración" className="w-20 h-20 mr-4 mb-4 md:mb-0" />
              <p>
                Agradecemos profundamente el apoyo recibido durante el desarrollo del proyecto y esperamos que nuestra solución sea útil para todos. Nos emociona la oportunidad de mejorar la experiencia de estacionamiento en Bogotá y confiamos en que esta herramienta facilite la búsqueda de espacios disponibles.
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center text-justify mb-6">
              <img src={iconLogo} alt="Logo de Smart Parking" className="w-20 h-20 mr-4 mb-4 md:mb-0" />
              <p>
                <strong>¡Gracias por interesarse en nuestro proyecto!</strong>
              </p>
              <img src={iconInteresting} alt="Icono de interesante" className="w-20 h-20 ml-4 mb-4 md:mb-0" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Features;
