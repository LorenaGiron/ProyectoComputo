import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import bgImage from '../assets/login.png';
import Toast from '../components/Toast';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  usuario: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria')
});

export default function Login() {
  const navigate = useNavigate();
  const { login, usuario: usuarioDelContexto, token } = useAuth();
  const [serverError, setServerError] = useState('');
  const [usuarioLogeado, setUsuarioLogeado] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  // Si ya está logeado, redirigir
  useEffect(() => {
    if (token && usuarioDelContexto) {
      const userRole = usuarioDelContexto?.roleId || usuarioDelContexto?.role;
      if (userRole === 'CLIENTE') {
        navigate('/tienda', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [token, usuarioDelContexto, navigate]);

  useEffect(() => {
    if (serverError) {
      const timer = setTimeout(() => setServerError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [serverError]);

  // Cuando el usuario se actualice en el contexto después del login, navega
  useEffect(() => {
    if (usuarioLogeado && usuarioDelContexto) {
      const userRole = usuarioDelContexto?.roleId || usuarioDelContexto?.role;
      if (userRole === 'CLIENTE') {
        navigate('/tienda', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [usuarioDelContexto, usuarioLogeado, navigate]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: data.usuario,
          password: data.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Credenciales incorrectas. Verifica tus datos.');
      }

      login(result.token, result.user ?? {});
      // Marcar que un usuario fue logeado para disparar el useEffect de navegación
      setUsuarioLogeado(result.user ?? {})

    } catch (error) {
      setServerError(error.message);
    }
  };

  const openModal = (e) => {
    e.preventDefault();
    document.getElementById('forgot_password_modal').showModal();
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      
      <Toast 
        message={serverError} 
        type="error" 
        onClose={() => setServerError('')} 
      />

      {/* Mitad Izquierda: Imagen */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src={bgImage} 
          alt="Aura Storefront" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute top-8 left-12 text-lila text-5xl font-cinzel tracking-widest">
          <a href='Home'>A U R A</a>
        </div>
      </div>

      {/* Mitad Derecha: Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-oscuro text-lila p-6 relative">
        
        <div className="w-full max-w-md text-center z-10">
          <h2 className="font-cinzel text-4xl lg:text-5xl tracking-[-0.02em] text-lila mb-6">
            INICIAR SESIÓN
          </h2>

          <p className="font-baskervville text-sm tracking-widest uppercase mb-12">
            Bienvenido de nuevo
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="text-left space-y-8">
            
            <div className="flex flex-col">
              <label className="mb-2 font-baskervville text-xl text-lila tracking-[-0.02em]">
                Usuario
              </label>

              <input 
                type="text"
                {...register('usuario')}
                disabled={isSubmitting}
                className={`w-full p-3 bg-lila text-oscuro outline-none rounded-xl focus:ring-2 focus:ring-lila focus:ring-offset-2 focus:ring-offset-oscuro transition-all ${errors.usuario ? 'border-2 border-error-text' : 'border border-transparent'}`}
              />
              {errors.usuario && <span className="text-error-text text-sm mt-2 font-baskervville">{errors.usuario.message}</span>}
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-baskervville text-xl text-lila tracking-[-0.02em]">
                Password
              </label>

              <input 
                type="password"
                {...register('password')}
                disabled={isSubmitting}
                className={`w-full p-3 bg-lila text-oscuro outline-none rounded-xl focus:ring-2 focus:ring-lila focus:ring-offset-2 focus:ring-offset-oscuro transition-all ${errors.password ? 'border-2 border-error-text' : 'border border-transparent'}`}
              />
              {errors.password && <span className="text-error-text text-sm mt-2 font-baskervville">{errors.password.message}</span>}
            </div>

            <div className="pt-6 flex justify-center w-full">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full max-w-md h-12 flex justify-center items-center gap-2 bg-transparent border border-lila rounded-xl text-lila font-baskervville text-lg tracking-widest hover:bg-lila hover:text-oscuro transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'CARGANDO...' : 'LOGIN'}
              </button>
            </div>

            <div className="text-center mt-4">
              <Link 
                to="#" 
                onClick={openModal}
                className="font-baskervville text-sm opacity-80 hover:opacity-100 transition-opacity"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>

        <div className="absolute bottom-8 font-baskervville text-sm tracking-widest uppercase opacity-80 text-center w-full left-0 z-10">
          Compromiso con nuestros clientes
        </div>

      </div>

      {/* --- Modal de Recuperación de Contraseña --- */}
      <dialog id="forgot_password_modal" className="modal">
        <div className="modal-box bg-oscuro/60 backdrop-blur-md border border-lila/30 text-lila p-8 sm:p-10 max-w-lg rounded-none shadow-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-6 top-6 text-xl">
              <i className="bi bi-x-lg"></i>
            </button>
          </form>

          <div className="mb-8">
            <div className="w-14 h-14 rounded-full border border-lila flex items-center justify-center">
              <i className="bi bi-lock text-2xl"></i>
            </div>
          </div>

          <h3 className="font-baskervville text-2xl tracking-widest border-b border-lila/30 pb-4 mb-8 leading-snug">
            RECUPERACIÓN DE <br/> CONTRASEÑA
          </h3>

          <div className="font-baskervville space-y-6 text-[15px] leading-relaxed text-center px-2">
            <p>
              Por políticas de seguridad del sistema, el restablecimiento de contraseñas es gestionado exclusivamente por el administrador del sistema.
            </p>
            <p>
              Para obtener nuevas credenciales de acceso, comuníquese con el área de Sistemas o Soporte Técnico de su organización.
            </p>
          </div>

          <div className="mt-10 border-l-2 border-lila/50 pl-4 font-baskervville text-sm text-left opacity-90">
            <p>Si desconoce quién es el administrador asignado,</p>
            <p>contacte al responsable de su área o departamento.</p>
          </div>

          <div className="mt-12 font-cinzel tracking-widest text-xl opacity-90">
            A U R A
          </div>
        </div>
        
        <form method="dialog" className="modal-backdrop">
          <button className="cursor-default">cerrar</button>
        </form>
      </dialog>

    </div>
  );
}
