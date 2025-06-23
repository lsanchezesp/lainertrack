import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar'; // Corregida la ruta de importación
import AuthLayout from './components/AuthLayout';
import EntregasPage from './pages/EntregasPage';
import AdministradorPage from './pages/AdministradorPage';
import ConsultaPage from './pages/ConsultaPage';
import { getStorageItem, setStorageItem } from './utils/storage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('entregas');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // { username, role, truckId, truckName }
  const [loginUsername, setLoginUsername] = useState(''); // Nuevo estado para el username del login

  const [trucks, setTrucks] = useState(
    getStorageItem('trucks', [
      { id: 'truck1', name: 'Camioneta 1', driver: 'Beto', password: '123', color: '#EF4444' },
      { id: 'truck2', name: 'Camioneta 2', driver: 'Juan', password: '123', color: '#3B82F6' },
      { id: 'truck3', name: 'Camioneta 3', driver: 'Pedro', password: '123', color: '#22C55E' },
    ])
  );

  const [clients, setClients] = useState(getStorageItem('clients', []));
  const [assignedRoutes, setAssignedRoutes] = useState(getStorageItem('assignedRoutes', [])); // { truckId, deliveries: [] }
  const [allTruckDeliveries, setAllTruckDeliveries] = useState({}); // { truckId: [delivery, ...] }

  // Obtener las contraseñas actualizadas del almacenamiento local
  const adminPassword = getStorageItem('adminPassword', '654321');
  // La contraseña de consultas ahora es fija para el usuario "Consultas"
  const consultPassword = getStorageItem('consultPassword', '2025'); // Cargar la contraseña de consultas desde localStorage

  useEffect(() => {
    setStorageItem('trucks', trucks);
    const updatedAllTruckDeliveries = {};
    trucks.forEach(truck => {
      updatedAllTruckDeliveries[truck.id] = getStorageItem(`truckDeliveries_${truck.id}`, []);
    });
    setAllTruckDeliveries(updatedAllTruckDeliveries);
  }, [trucks]);

  useEffect(() => {
    setStorageItem('clients', clients);
  }, [clients]);

  useEffect(() => {
    setStorageItem('assignedRoutes', assignedRoutes);
    const updatedAllTruckDeliveries = { ...allTruckDeliveries };
    assignedRoutes.forEach(route => {
      updatedAllTruckDeliveries[route.truckId] = route.deliveries;
    });
    trucks.forEach(truck => {
      if (!updatedAllTruckDeliveries[truck.id]) {
        updatedAllTruckDeliveries[truck.id] = getStorageItem(`truckDeliveries_${truck.id}`, []);
      }
    });
    setAllTruckDeliveries(updatedAllTruckDeliveries);
  }, [assignedRoutes, trucks]);

  const handleLogin = (username, password) => {
    // Normalizar el nombre de usuario para eliminar espacios extra
    const trimmedUsername = username.trim();

    // Validar Admin
    if (trimmedUsername === 'admin' && password === adminPassword) {
      setIsAuthenticated(true);
      setCurrentUser({ username: trimmedUsername, role: 'admin' });
      setCurrentPage('administrador');
      return true;
    }

    // Validar Choferes
    const foundTruck = trucks.find(
      (truck) => truck.driver.trim() === trimmedUsername && truck.password === password
    );
    if (foundTruck) {
      setIsAuthenticated(true);
      setCurrentUser({ username: trimmedUsername, role: 'driver', truckId: foundTruck.id, truckName: foundTruck.name });
      setCurrentPage('entregas');
      return true;
    }

    // Validar usuario de Consultas
    if (trimmedUsername === 'Consultas' && password === consultPassword) {
      setIsAuthenticated(true);
      setCurrentUser({ username: 'Consultas', role: 'consult' });
      setCurrentPage('consultas');
      return true;
    }

    return false; // Credenciales incorrectas
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage('entregas'); // Default to a non-authenticated page
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleUpdateTruckDeliveries = (truckId, deliveries) => {
    setStorageItem(`truckDeliveries_${truckId}`, deliveries);
    setAllTruckDeliveries(prev => ({
      ...prev,
      [truckId]: deliveries
    }));
  };

  const renderPage = () => {
    if (!isAuthenticated) {
      return <AuthLayout onLogin={handleLogin} onSetUsername={setLoginUsername} />;
    }

    switch (currentPage) {
      case 'entregas':
        return <EntregasPage currentUser={currentUser} trucks={trucks} onUpdateTruckDeliveries={handleUpdateTruckDeliveries} />;
      case 'administrador':
        if (currentUser?.role === 'admin') {
          return (
            <AdministradorPage
              trucks={trucks}
              setTrucks={setTrucks}
              clients={clients}
              setClients={setClients}
              assignedRoutes={assignedRoutes}
              setAssignedRoutes={setAssignedRoutes}
              onUpdateTruckDeliveries={handleUpdateTruckDeliveries}
            />
          );
        }
        return <p className="text-center text-red-500 text-base mt-16">Acceso denegado. Solo administradores.</p>;
      case 'consultas':
        return <ConsultaPage trucks={trucks} allTruckDeliveries={allTruckDeliveries} consultPassword={consultPassword} />;
      default:
        return <AuthLayout onLogin={handleLogin} onSetUsername={setLoginUsername} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && <Navbar currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} userRole={currentUser?.role} />}
      {renderPage()}
    </div>
  );
};

export default App;