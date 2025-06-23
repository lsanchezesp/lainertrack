import React, { useState, useRef } from 'react'; // Importar useRef

const AuthLayout = ({ onLogin, children, onSetUsername }) => { // Agregamos onSetUsername a las props
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const passwordInputRef = useRef(null); // Crear una ref para el input de contraseña

  const handleLogin = () => {
    if (onLogin(username, password)) {
      setError('');
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handleConsultButtonClick = () => {
    if (typeof onSetUsername === 'function') {
      onSetUsername('Consultas'); // Establece el nombre de usuario en App.js
      setUsername('Consultas'); // También actualiza el estado local para que se vea en el input
    }
    // Enfocar el campo de contraseña después de un pequeño retraso para asegurar que el DOM se actualice
    setTimeout(() => {
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    }, 100); // Pequeño retraso
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Imagen principal del camión en un círculo */}
      <div className="mb-2 w-full max-w-sm flex justify-center px-4 py-2"> {/* Reducido mb para acercar el texto */}
        <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg"> {/* Contenedor circular */}
          <img 
            src="https://i.ibb.co/Vp2PVc42/Lainer-Track-Logo-Header.png" // URL de la imagen del camión
            alt="LainerTrack Camión" 
            className="w-full h-full object-cover" // Ajusta la imagen para cubrir el círculo
          />
        </div>
      </div>
      {/* Nombre de la aplicación debajo del logotipo */}
      <p className="text-gray-700 text-xl font-bold mb-1">LainerTrack</p> {/* Nombre de la app */}
      {/* Versión de la aplicación */}
      <p className="text-gray-500 text-sm mb-8">V-1.0.2</p>

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h2>
        {error && <p className="text-red-500 text-center mb-3 text-sm">{error}</p>}
        <input
          type="text"
          placeholder="Usuario"
          className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition duration-200 shadow-sm text-base"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress} // Añadir el evento keyPress
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full px-3 py-2 mb-5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition duration-200 shadow-sm text-base"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress} // Añadir el evento keyPress
          ref={passwordInputRef} // Asignar la ref al input de contraseña
        />
        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-2.5 rounded-xl hover:bg-gray-800 transition duration-200 text-base font-semibold shadow-md"
        >
          Entrar
        </button>
        
        {/* Botón de Consultas con autocompletado */}
        <button
          onClick={handleConsultButtonClick}
          className="w-full bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition duration-200 text-base font-semibold shadow-md mt-4"
        >
          Consultas
        </button>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;