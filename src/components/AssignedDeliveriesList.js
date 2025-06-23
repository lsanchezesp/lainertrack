import React from 'react';

const AssignedDeliveriesList = ({ assignedRoutes, trucks, onRemoveDelivery }) => {
  const getTruckColor = (truckId) => {
    const truck = trucks.find(t => t.id === truckId);
    return truck ? truck.color : '#cccccc'; // Default color si no se encuentra
  };

  const getTruckName = (truckId) => {
    const truck = trucks.find(t => t.id === truckId);
    return truck ? truck.name : 'Camioneta Desconocida';
  };

  // Función de formateo para metros
  const formatMeters = (value) => {
    if (value === null || value === undefined || isNaN(parseFloat(value))) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(value));
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Rutas Asignadas</h3>
      {assignedRoutes.length === 0 ? (
        <p className="text-gray-600 text-base">No hay entregas asignadas aún.</p>
      ) : (
        assignedRoutes.map((route) => (
          <div key={route.truckId} className="mb-4 p-3 rounded-lg border-l-8" style={{ borderColor: getTruckColor(route.truckId) }}>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">{getTruckName(route.truckId)}</h4> {/* Muestra el título de la camioneta */}
            {route.deliveries.map((delivery) => (
              <div 
                key={delivery.id} 
                className={`bg-gray-50 p-2 rounded-lg mb-2 flex justify-between items-center border border-gray-200 ${
                  delivery.delivered ? 'bg-green-100 border-green-300' : '' // Fondo verde claro y borde verde si está entregado
                }`}
              >
                <div>
                  <p className={`font-bold text-gray-800 text-base ${delivery.delivered ? 'text-green-700' : ''}`}>{delivery.clientName}</p> {/* Nombre del cliente en negritas y verde si entregado */}
                  <p className="text-gray-600 text-sm">{delivery.address}</p> {/* Aumentado a text-sm */}
                  {delivery.isPaqueteria && ( // Muestra el texto si el checkbox está marcado
                    <p className="text-red-600 text-xs font-bold mt-1">Entregar en Paquetería o Transporte</p>
                  )}
                  {delivery.observations && (
                    <p className="text-red-600 text-xs mb-1">Observaciones: {delivery.observations}</p>
                  )}
                  {delivery.invoices && (
                    <p className="text-blue-700 font-bold text-xs mb-1">Facturas: {delivery.invoices}</p>
                  )}
                  {delivery.meters && (
                    <p className="text-blue-700 font-bold text-xs mb-1">Metros: {formatMeters(delivery.meters)}</p>
                  )}
                  {delivery.delivered && delivery.deliveryTime && (
                    <p className="text-green-700 font-bold text-xs mt-1">Entregado: {delivery.deliveryTime}</p>
                  )}
                </div>
                {!delivery.delivered && ( // Solo permitir eliminar si no ha sido entregado
                  <button
                    onClick={() => onRemoveDelivery(route.truckId, delivery.id)}
                    className="text-red-500 hover:text-red-700 transition duration-200 text-xs"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default AssignedDeliveriesList;