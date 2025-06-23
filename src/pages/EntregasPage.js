import React, { useState, useEffect } from 'react';
import DeliveryCard from '../components/DeliveryCard';
import { getStorageItem, setStorageItem } from '../utils/storage';

const EntregasPage = ({ currentUser, trucks, onUpdateTruckDeliveries }) => {
  const [currentTruckDeliveries, setCurrentTruckDeliveries] = useState([]);
  const [truckColor, setTruckColor] = useState('#cccccc');
  const [draggingIndex, setDraggingIndex] = useState(null); // Índice del elemento que se está arrastrando
  const [dragOverIndex, setDragOverIndex] = useState(null); // Índice sobre el que se está arrastrando

  useEffect(() => {
    if (currentUser && trucks) {
      const truck = trucks.find(t => t.driver === currentUser.username);
      if (truck) {
        const loadedDeliveries = getStorageItem(`truckDeliveries_${truck.id}`, []);
        setCurrentTruckDeliveries(loadedDeliveries);
        setTruckColor(truck.color);
      }
    }
  }, [currentUser, trucks]);

  const handleToggleDelivered = (deliveryId, location) => { // Recibe la ubicación
    const updatedDeliveries = currentTruckDeliveries.map(delivery => {
      if (delivery && delivery.id === deliveryId) {
        const newDeliveredState = !delivery.delivered;
        let newDeliveryTime = delivery.deliveryTime;
        let newLocation = delivery.location;

        if (newDeliveredState) {
          newDeliveryTime = formatTime(new Date());
          newLocation = location; // Usa la ubicación capturada
        } else {
          newDeliveryTime = null;
          newLocation = null;
        }

        return {
          ...delivery,
          delivered: newDeliveredState,
          deliveryTime: newDeliveryTime,
          location: newLocation,
        };
      }
      return delivery;
    });

    // Reordenar la lista: entregados al final
    const reorderedDeliveries = updatedDeliveries.filter(d => d && !d.delivered).concat(updatedDeliveries.filter(d => d && d.delivered));
    
    setCurrentTruckDeliveries(reorderedDeliveries);
    setStorageItem(`truckDeliveries_${currentUser.truckId}`, reorderedDeliveries);
    onUpdateTruckDeliveries(currentUser.truckId, reorderedDeliveries); // Notificar a App.js para actualizar allTruckDeliveries
  };

  const formatTime = (date) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(date).toLocaleTimeString('es-MX', options);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, index) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("deliveryIndex", index);
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // No resetear dragOverIndex aquí para que la línea se mantenga
    // hasta que se arrastre sobre otro elemento o se suelte.
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const targetIndex = parseInt(e.currentTarget.dataset.index);
    if (draggingIndex !== null && draggingIndex !== targetIndex) {
      setDragOverIndex(targetIndex);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("deliveryIndex"));
    
    if (dragIndex === dropIndex || dragIndex === null) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newDeliveries = [...currentTruckDeliveries];
    const [draggedDelivery] = newDeliveries.splice(dragIndex, 1);
    newDeliveries.splice(dropIndex, 0, draggedDelivery);
    
    setCurrentTruckDeliveries(newDeliveries);
    setStorageItem(`truckDeliveries_${currentUser.truckId}`, newDeliveries);
    onUpdateTruckDeliveries(currentUser.truckId, newDeliveries); // Notificar a App.js para actualizar allTruckDeliveries
    
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  // Filtrar y ordenar para mostrar pendientes primero, luego entregados
  const sortedDeliveries = currentTruckDeliveries
    .filter(d => d && typeof d.delivered !== 'undefined') // Filtrar nulos/indefinidos
    .sort((a, b) => {
      // Los no entregados van primero, luego los entregados
      if (a.delivered === b.delivered) {
        return 0; // Mantener el orden original si ambos tienen el mismo estado
      }
      return a.delivered ? 1 : -1; // Los entregados van al final
    });

  const pendingDeliveries = sortedDeliveries.filter(d => !d.delivered);
  const deliveredDeliveries = sortedDeliveries.filter(d => d.delivered);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Ruta del día: {currentUser?.truckName}
      </h1>

      {sortedDeliveries.length === 0 ? (
        <p className="text-center text-gray-600 text-base">No hay entregas asignadas para hoy.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Entregas Pendientes</h2>
            {pendingDeliveries.length === 0 ? (
              <p className="text-gray-600 text-base">¡Todas las entregas han sido completadas!</p>
            ) : (
              <div className="space-y-4">
                {pendingDeliveries.map((delivery, index) => (
                  <React.Fragment key={delivery.id}>
                    {/* Indicador de destino: solo si se está arrastrando y el índice de arrastre es el actual */}
                    {draggingIndex !== null && dragOverIndex === currentTruckDeliveries.indexOf(delivery) && (
                      <div className="border-t-2 border-red-500 my-1 transition-all duration-100"></div>
                    )}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, currentTruckDeliveries.indexOf(delivery))}
                      onDragEnter={(e) => handleDragEnter(e, currentTruckDeliveries.indexOf(delivery))}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, currentTruckDeliveries.indexOf(delivery))}
                      onDragEnd={handleDragEnd}
                      data-index={currentTruckDeliveries.indexOf(delivery)}
                      className={`cursor-grab active:cursor-grabbing ${
                        draggingIndex === currentTruckDeliveries.indexOf(delivery) ? 'font-bold opacity-50' : ''
                      }`}
                    >
                      <DeliveryCard
                        delivery={delivery}
                        onToggleDelivered={handleToggleDelivered}
                        isDriverView={true}
                        truckColor={truckColor}
                      />
                    </div>
                    {/* Indicador de destino al final de la lista si se arrastra al último lugar */}
                    {draggingIndex !== null && dragOverIndex === pendingDeliveries.length - 1 && index === pendingDeliveries.length - 1 && (
                      <div className="border-b-2 border-red-500 my-1 transition-all duration-100"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Entregas Realizadas</h2>
            {deliveredDeliveries.length === 0 ? (
              <p className="text-gray-600 text-base">Aún no hay entregas completadas.</p>
            ) : (
              <div className="space-y-4">
                {deliveredDeliveries.map((delivery) => (
                  <DeliveryCard
                    key={delivery.id}
                    delivery={delivery}
                    onToggleDelivered={handleToggleDelivered}
                    isDriverView={true}
                    truckColor={truckColor}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EntregasPage;