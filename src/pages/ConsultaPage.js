import React, { useState, useEffect } from 'react';
import DeliveryCard from '../components/DeliveryCard';
import AuthLayout from '../components/AuthLayout';
import { getStorageItem, setStorageItem } from '../utils/storage'; // Importar setStorageItem

const ConsultaPage = ({ trucks, allTruckDeliveries, consultPassword }) => {
  const [currentLocationData, setCurrentLocationData] = useState({});

  // Función de formateo para metros (duplicada para ConsultaPage)
  const formatMeters = (value) => {
    if (value === null || value === undefined || isNaN(parseFloat(value))) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(value));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        trucks.forEach(truck => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: new Date().toLocaleString(),
              };
              setCurrentLocationData(prev => ({
                ...prev,
                [truck.id]: newLocation
              }));
              // Guardar la última ubicación de la camioneta en localStorage
              setStorageItem(`truckLocation_${truck.id}`, newLocation);
            },
            (error) => {
              console.warn(`ERROR(${error.code}): ${error.message}`);
              // No actualizar si hay error, para mantener la última ubicación conocida
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );
        });
      } else {
        console.warn("Geolocation is not supported by this browser.");
      }
    }, 300000); // Actualiza cada 5 minutos (300 segundos)

    // Cargar las últimas ubicaciones guardadas al inicio
    trucks.forEach(truck => {
      const storedLocation = getStorageItem(`truckLocation_${truck.id}`, null);
      if (storedLocation) {
        setCurrentLocationData(prev => ({
          ...prev,
          [truck.id]: storedLocation
        }));
      }
    });


    return () => clearInterval(interval);
  }, [trucks]);

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const totalDeliveries = trucks.reduce((acc, truck) => {
    const deliveries = allTruckDeliveries[truck.id] || [];
    return acc + deliveries.length;
  }, 0);

  const totalDelivered = trucks.reduce((acc, truck) => {
    const deliveries = allTruckDeliveries[truck.id] || [];
    return acc + deliveries.filter(d => d.delivered).length;
  }, 0);

  const totalPending = totalDeliveries - totalDelivered;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-7 text-center">
        Dashboard de Consultas - {today}
      </h1>

      {/* Resumen General */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-7">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Progreso General de Entregas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-blue-100 rounded-lg"> {/* Fondo azul claro */}
            <p className="text-xl font-bold text-gray-800">{totalDeliveries}</p>
            <p className="text-gray-600 text-base">En Ruta</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <p className="text-xl font-bold text-green-700">{totalDelivered}</p>
            <p className="text-green-600 text-base">Entregados</p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg">
            <p className="text-xl font-bold text-red-700">{totalPending}</p>
            <p className="text-red-600 text-base">Pendientes</p>
          </div>
        </div>
      </div>

      {/* Progreso Individual por Camioneta */}
      <div className="mb-7">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Progreso por Camioneta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trucks.map((truck) => {
            const deliveries = allTruckDeliveries[truck.id] || [];
            const deliveredCount = deliveries.filter(d => d.delivered).length;
            const pendingCount = deliveries.length - deliveredCount;
            const progress = deliveries.length > 0 ? (deliveredCount / deliveries.length) * 100 : 0;

            return (
              <div key={truck.id} className="bg-white p-5 rounded-lg shadow-md border-l-8" style={{ borderColor: truck.color }}>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{truck.name}</h3>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: truck.color }}
                    ></div>
                  </div>
                  <p className="text-right text-gray-600 text-xs mt-1">{progress.toFixed(0)}% completado</p>
                </div>
                <div className="flex justify-between text-base font-medium">
                  <p className="text-gray-800">Total: {deliveries.length}</p>
                  <p className="text-green-700">Entregados: {deliveredCount}</p>
                  <p className="text-red-700">Pendientes: {pendingCount}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visualización por Vehículo y Mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-5">Detalle de Rutas</h2>
          {trucks.map((truck) => {
            const deliveries = allTruckDeliveries[truck.id] || [];
            // Separar entregados y pendientes
            const delivered = deliveries.filter(d => d.delivered).sort((a, b) => new Date(a.deliveryTime) - new Date(b.deliveryTime));
            const pending = deliveries.filter(d => !d.delivered);

            return (
              <div key={truck.id} className="mb-7 bg-white p-5 rounded-lg shadow-md border-l-8" style={{ borderColor: truck.color }}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{truck.name}</h3>
                <div className="space-y-4">
                  {delivered.length > 0 && (
                    <>
                      <h4 className="text-lg font-semibold text-green-700">Entregados</h4>
                      {delivered.map((delivery) => (
                        <div 
                          key={delivery.id} 
                          className="p-2 rounded-lg border border-green-300 bg-green-50" // Fondo verde para entregados
                        >
                          <p className="font-bold text-base text-green-700">{delivery.clientName}</p>
                          <p className="text-gray-600 text-sm">{delivery.address}</p>
                          {delivery.isPaqueteria && (
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
                            <p className="text-green-700 font-bold text-xs mt-1 flex items-center justify-between">
                              <span>Entregado: {delivery.deliveryTime}</span>
                              {delivery.location && (
                                <button
                                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${delivery.location.latitude},${delivery.location.longitude}`, '_blank')}
                                  className="ml-2 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                                  title="Ver en Google Maps"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-blue-600">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                  </svg>
                                </button>
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                  {pending.length > 0 && (
                    <>
                      <h4 className="text-lg font-semibold text-red-700 mt-5">Pendientes</h4>
                      {pending.map((delivery) => (
                        <div 
                          key={delivery.id} 
                          className="p-2 rounded-lg border border-gray-200 bg-gray-50" // Fondo gris para pendientes
                        >
                          <p className="font-bold text-base text-gray-800">{delivery.clientName}</p>
                          <p className="text-gray-600 text-sm">{delivery.address}</p>
                          {delivery.isPaqueteria && (
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
                        </div>
                      ))}
                    </>
                  )}
                  {deliveries.length === 0 && delivered.length === 0 && pending.length === 0 && ( // Si no hay entregas de ningún tipo
                    <p className="text-gray-600 text-base">No hay entregas para esta camioneta.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mapa de Geolocalización */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-5">Ubicación de Camionetas</h2>
          <div className="bg-gray-200 rounded-lg shadow-md overflow-hidden" style={{ height: '450px' }}>
            {/* Aquí iría la integración con Google Maps. Por simplicidad, se muestra un placeholder. */}
            <div className="flex items-center justify-center h-full text-gray-600 text-xl">
              Mapa de Google Maps (Integración con API)
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {trucks.map(truck => (
              <div key={truck.id} className="flex items-center p-2.5 bg-white rounded-lg shadow-sm border-l-4" style={{ borderColor: truck.color }}>
                <span className="font-semibold text-gray-800 mr-2 text-base">{truck.name}:</span>
                {currentLocationData[truck.id] ? (
                  <span className="text-gray-700 text-sm">
                    Lat: {currentLocationData[truck.id].latitude.toFixed(4)}, Lon: {currentLocationData[truck.id].longitude.toFixed(4)} ({currentLocationData[truck.id].timestamp})
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${currentLocationData[truck.id].latitude},${currentLocationData[truck.id].longitude}`, '_blank')}
                      className="ml-2 text-blue-500 hover:underline text-xs"
                    >
                      Ver
                    </button>
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm">Ubicación no disponible</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultaPage;