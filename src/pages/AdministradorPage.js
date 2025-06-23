import React, { useState, useEffect } from 'react'; // Asegúrate de importar React, useState, useEffect
import TruckConfigCard from '../components/TruckConfigCard';
import RouteAssignmentForm from '../components/RouteAssignmentForm';
import AssignedDeliveriesList from '../components/AssignedDeliveriesList';
import ClientManagement from '../components/ClientManagement';
import { getStorageItem, setStorageItem } from '../utils/storage';

const AdministradorPage = ({ trucks, setTrucks, clients, setClients, assignedRoutes, setAssignedRoutes, onUpdateTruckDeliveries }) => {
  const [activeTab, setActiveTab] = useState('rutas'); // Estado para controlar la pestaña activa

  const [adminPassword, setAdminPassword] = useState(getStorageItem('adminPassword', '654321'));
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [consultPassword, setConsultPassword] = useState(getStorageItem('consultPassword', '2025')); // Cargar la contraseña actual, ahora es 2025
  const [newConsultPassword, setNewConsultPassword] = useState('');

  useEffect(() => {
    setStorageItem('adminPassword', adminPassword);
  }, [adminPassword]);

  useEffect(() => {
    // Este useEffect se dispara cada vez que consultPassword cambia,
    // asegurando que el valor en localStorage esté siempre sincronizado.
    setStorageItem('consultPassword', consultPassword); 
  }, [consultPassword]); // Dependencia de consultPassword

  const handleAddTruck = () => {
    const newTruck = {
      id: `truck-${Date.now()}`, // Usar un ID único y consistente para nuevas camionetas
      name: `Camioneta ${trucks.length + 1}`,
      driver: `Chofer ${trucks.length + 1}`,
      password: '123',
      color: '#000000',
    };
    setTrucks([...trucks, newTruck]);
  };

  const handleUpdateTruck = (updatedTruck) => {
    setTrucks(prevTrucks => prevTrucks.map((truck) => (truck.id === updatedTruck.id ? updatedTruck : truck)));
    // No es necesario actualizar assignedRoutes aquí, ya que AssignedDeliveriesList
    // y ConsultaPage obtienen el nombre y color directamente de la lista de `trucks`
    // usando el ID de la camioneta.
  };

  const handleDeleteTruck = (truckId) => {
    setTrucks(prevTrucks => prevTrucks.filter((truck) => truck.id !== truckId));
    // Al eliminar una camioneta, también eliminamos sus rutas asignadas para evitar inconsistencias
    setAssignedRoutes(prevRoutes => prevRoutes.filter(route => route.truckId !== truckId));
    // Clear deliveries for the deleted truck from storage
    localStorage.removeItem(`truckDeliveries_${truckId}`);
  };

  const handleAddDeliveryToRoute = (truckId, newDelivery) => {
    setAssignedRoutes(prevAssignedRoutes => {
      const existingRouteIndex = prevAssignedRoutes.findIndex(route => route.truckId === truckId);
      let updatedRoutes;

      if (existingRouteIndex > -1) {
        updatedRoutes = prevAssignedRoutes.map((route, index) =>
          index === existingRouteIndex
            ? { ...route, deliveries: [...route.deliveries, newDelivery] }
            : route
        );
      } else {
        updatedRoutes = [...prevAssignedRoutes, { truckId, deliveries: [newDelivery] }];
      }
      // Actualizar las entregas individuales de la camioneta en localStorage y en el estado global
      const currentDeliveriesForTruck = updatedRoutes.find(r => r.truckId === truckId)?.deliveries || [];
      onUpdateTruckDeliveries(truckId, currentDeliveriesForTruck);
      return updatedRoutes;
    });
  };

  const handleRemoveDelivery = (truckId, deliveryId) => {
    setAssignedRoutes(prevAssignedRoutes => {
      const updatedRoutes = prevAssignedRoutes.map(route => {
        if (route.truckId === truckId) {
          const updatedDeliveries = route.deliveries.filter(d => d.id !== deliveryId);
          return { ...route, deliveries: updatedDeliveries };
        }
        return route;
      }).filter(route => route.deliveries.length > 0); // Remove route if no deliveries left

      onUpdateTruckDeliveries(truckId, updatedRoutes.find(r => r.truckId === truckId)?.deliveries || []);
      return updatedRoutes;
    });
  };

  const handleClearAllRoutes = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todas las rutas asignadas? Esto no afectará las entregas ya marcadas como entregadas por los choferes.')) {
      const routesToKeep = assignedRoutes.map(route => ({
        ...route,
        deliveries: route.deliveries.filter(delivery => delivery.delivered)
      })).filter(route => route.deliveries.length > 0); // Eliminar rutas que queden vacías

      setAssignedRoutes(routesToKeep);
      
      // Actualizar el localStorage de cada camioneta para reflejar los cambios
      trucks.forEach(truck => {
        const deliveriesToKeepForTruck = routesToKeep.find(r => r.truckId === truck.id)?.deliveries || [];
        onUpdateTruckDeliveries(truck.id, deliveriesToKeepForTruck);
      });
    }
  };

  const handleAddClient = (newClient) => {
    setClients([...clients, newClient]);
  };

  const handleDeleteClient = (clientId) => {
    setClients(clients.filter(client => client.id !== clientId));
  };

  const handleImportClients = (importedClientsArray) => {
    setClients([...clients, ...importedClientsArray]);
  };

  const handleClearClients = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los clientes?')) {
      setClients([]);
    }
  };

  const handleChangeAdminPassword = () => {
    if (newAdminPassword) {
      setAdminPassword(newAdminPassword);
      setNewAdminPassword('');
      alert('Contraseña de Administrador actualizada.');
    }
  };

  const handleChangeConsultPassword = () => {
    if (newConsultPassword) {
      setConsultPassword(newConsultPassword); // Actualiza el estado local de consultPassword
      setNewConsultPassword('');
      alert('Contraseña de Consultas actualizada.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'rutas':
        return (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Gestión de Rutas</h2>
            <RouteAssignmentForm
              trucks={trucks}
              clients={clients}
              onAddDeliveryToRoute={handleAddDeliveryToRoute}
            />
            <div className="mt-7">
              <AssignedDeliveriesList
                assignedRoutes={assignedRoutes}
                trucks={trucks}
                onRemoveDelivery={handleRemoveDelivery}
              />
              <button
                onClick={handleClearAllRoutes}
                className="w-full mt-2.5 bg-red-600 text-white py-1.5 rounded-lg hover:bg-red-700 transition-colors text-base" // Botón Eliminar Rutas en rojo
              >
                Eliminar Rutas
              </button>
            </div>
          </>
        );
      case 'camionetas':
        return (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Configuración de Camionetas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
              {trucks.map((truck) => (
                <TruckConfigCard
                  key={truck.id}
                  truck={truck}
                  onUpdateTruck={handleUpdateTruck}
                  onDeleteTruck={handleDeleteTruck}
                />
              ))}
            </div>
            <button
              onClick={handleAddTruck}
              className="w-full mt-2.5 bg-black text-white py-1.5 rounded-lg hover:bg-gray-800 transition-colors text-base"
            >
              Agregar Nueva Camioneta
            </button>
          </>
        );
      case 'clientes':
        return (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Gestión de Clientes</h2>
            <ClientManagement
              clients={clients}
              onAddClient={handleAddClient}
              onDeleteClient={handleDeleteClient}
              onImportClients={handleImportClients}
              onClearClients={handleClearClients}
            />
          </>
        );
      case 'contrasenas':
        return (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Configuración de Contraseñas</h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Usuario Administrador</h3>
              <p className="text-gray-700 text-base">Usuario: <span className="font-bold">admin</span></p>
              <p className="text-gray-700 text-base">Contraseña Actual: <span className="font-bold">{adminPassword}</span></p>
              <input
                type="text"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full mt-3 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition text-base"
                placeholder="Nueva contraseña de Admin"
              />
              <button
                onClick={handleChangeAdminPassword}
                className="w-full mt-2.5 bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-base" // Botón en azul
              >
                Actualizar Contraseña Admin
              </button>
            </div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Usuario Consultas</h3>
              <p className="text-gray-700 text-base">Usuario: <span className="font-bold">Consultas</span></p>
              <p className="text-gray-700 text-base">Contraseña Actual: <span className="font-bold">{consultPassword}</span></p>
              <input
                type="text"
                value={newConsultPassword}
                onChange={(e) => setNewConsultPassword(e.target.value)}
                className="w-full mt-3 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition text-base"
                placeholder="Nueva contraseña de Consultas"
              />
              <button
                onClick={handleChangeConsultPassword}
                className="w-full mt-2.5 bg-green-600 text-white py-1.5 rounded-lg hover:bg-green-700 transition-colors text-base" // Botón en verde
              >
                Actualizar Contraseña Consultas
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 text-center flex-grow">Panel de Administrador</h1>
        {/* El botón de Consultas se elimina de aquí */}
      </div>

      {/* Pestañas Horizontales */}
      <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6 shadow-inner">
        <button
          onClick={() => setActiveTab('rutas')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
            activeTab === 'rutas'
              ? 'bg-white text-black shadow'
              : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-900'
          }`}
        >
          Gestión de Rutas
        </button>
        <button
          onClick={() => setActiveTab('camionetas')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
            activeTab === 'camionetas'
              ? 'bg-white text-black shadow'
              : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-900'
          }`}
        >
          Configuración de Camionetas
        </button>
        <button
          onClick={() => setActiveTab('clientes')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
            activeTab === 'clientes'
              ? 'bg-white text-black shadow'
              : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-900'
          }`}
        >
          Gestión de Clientes
        </button>
        <button
          onClick={() => setActiveTab('contrasenas')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
            activeTab === 'contrasenas'
              ? 'bg-white text-black shadow'
              : 'text-gray-700 hover:bg-white/[0.12] hover:text-gray-900'
          }`}
        >
          Contraseñas
        </button>
      </div>

      {/* Contenido de la Pestaña Activa */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdministradorPage;