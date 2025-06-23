import React from 'react';

const Navbar = ({ currentPage, onNavigate, onLogout, userRole }) => {
  const navItems = [
    { name: 'Entregas', page: 'entregas', roles: ['driver'] },
    { name: 'Administrador', page: 'administrador', roles: ['admin'] },
    // { name: 'Consultas', page: 'consultas', roles: ['admin', 'consult'] }, // Botón de Consultas eliminado
  ];

  return (
    <nav className="bg-black p-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden mr-2">
            <img 
              src="https://i.ibb.co/Vp2PVc42/Lainer-Track-Logo-Header.png" // URL de la imagen del camión
              alt="LainerTrack Logo" 
              className="w-full h-full object-cover" // Ajusta la imagen para cubrir el círculo
            />
          </div>
          <span className="text-white text-xl font-bold">LainerTrack</span>
        </div>
        <div className="flex items-center space-x-3">
          {navItems.map((item) => (
            (item.roles.includes(userRole)) && (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`px-3 py-1.5 rounded-lg text-base font-medium transition duration-200 ${
                  currentPage === item.page
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.name}
              </button>
            )
          ))}
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg text-base font-medium text-red-400 hover:bg-red-700 hover:text-white transition duration-200"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;