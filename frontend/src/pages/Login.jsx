import { Link } from 'react-router-dom';
import bgImage from '../assets/login.png';

export default function Login() {
  return (
    <div className="flex min-h-screen">
      
      {/* Mitad Izquierda: Imagen */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src={bgImage} 
          alt="Aura Storefront" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute top-8 left-12 text-lila text-5xl font-cinzel tracking-widest">
          A U R A
        </div>
      </div>

      {/* Mitad Derecha: Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-oscuro text-lila p-6 relative">
        
        <div className="w-full max-w-md text-center">
          <h2 className="font-cinzel text-4xl lg:text-5xl tracking-[-0.02em] text-lila mb-6">
            INICIAR SESIÓN
          </h2>

          <p className="font-baskervville text-sm tracking-widest uppercase mb-12">
            Bienvenido de nuevo
          </p>

          <form className="text-left space-y-8">
            <div className="flex flex-col">
              <label className="mb-2 font-baskervville text-xl text-lila tracking-[-0.02em]">
                Usuario
              </label>

              <input 
                type="text" 
                className="w-full p-3 bg-lila text-oscuro outline-none rounded-xl focus:ring-2 focus:ring-lila focus:ring-offset-2 focus:ring-offset-oscuro"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-baskervville text-xl text-lila tracking-[-0.02em]">
                Password
              </label>

              <input 
                type="password" 
                className="w-full p-3 bg-lila text-oscuro outline-none rounded-xl focus:ring-2 focus:ring-lila focus:ring-offset-2 focus:ring-offset-oscuro"
              />
            </div>

            <div className="pt-6 flex justify-center w-full">
              <button 
                type="button" 
                className="w-full max-w-md h-12 flex justify-center items-center gap-2 bg-transparent border border-lila rounded-xl text-lila font-baskervville text-lg tracking-widest hover:bg-lila hover:text-oscuro transition-colors cursor-pointer"
              >
                LOGIN
              </button>
            </div>

            <div className="text-center mt-4">
              <Link to="#" className="font-baskervville text-sm opacity-80 hover:opacity-100 transition-opacity">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>

        <div className="absolute bottom-8 font-baskervville text-sm tracking-widest uppercase opacity-80 text-center w-full left-0">
          Compromiso con nuestros clientes
        </div>

      </div>
    </div>
  );
}