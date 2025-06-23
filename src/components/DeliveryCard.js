import React, { useState, useEffect } from 'react';

const DeliveryCard = ({ delivery, onToggleDelivered, isDriverView, truckColor }) => {
  const cardColorClass = truckColor ? `border-${truckColor}-500` : 'border-gray-300';
  const textColorClass = delivery.delivered ? 'text-green-700' : 'text-gray-800';
  const deliveredTextClass = delivery.delivered ? 'font-bold' : '';

  // Estado local para el deslizador
  const [sliderValue, setSliderValue] = useState(delivery.delivered ? 100 : 0);
  const [cardBgColor, setCardBgColor] = useState(delivery.delivered ? 'bg-green-50' : 'bg-white');
  const [isProcessing, setIsProcessing] = useState(false); // Nuevo estado para evitar clics duplicados

  // Función de formateo para metros
  const formatMeters = (value) => {
    if (!value) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(value));
  };

  // Sincronizar el estado del slider y color de fondo con la prop 'delivered'
  useEffect(() => {
    setSliderValue(delivery.delivered ? 100 : 0);
    setCardBgColor(delivery.delivered ? 'bg-green-50' : 'bg-white');
  }, [delivery.delivered]);

  // Función para obtener la ubicación con Promise y timeout
  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Geolocation no soportada por este navegador."));
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    });

  const handleSliderChange = async (e) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);

    // Solo permitir el cambio si no está ya entregado y no se está procesando
    if (value === 100 && !delivery.delivered && !isProcessing) {
      setIsProcessing(true); // Bloquear el botón
      let newLocation = null;
      let locationError = false;

      try {
        const position = await getLocation();
        newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch (error) {
        console.error("Error obteniendo ubicación:", error);
        alert(`No se pudo obtener la ubicación: ${error.message || error}. Asegúrate de que la geolocalización esté activada.`);
        locationError = true;
        // Si falla la ubicación, el deslizador vuelve a 0 y no se marca como entregado
        setSliderValue(0); 
        setIsProcessing(false);
        return; 
      }

      if (!locationError) {
        onToggleDelivered(delivery.id, newLocation); // Pasar la ubicación a la función padre
      }
      setIsProcessing(false); // Desbloquear el botón
    } else if (value === 0 && delivery.delivered && !isProcessing) {
      // Si se desliza de vuelta a 0 y ya estaba entregado, se puede implementar lógica para "deshacer entrega"
      // Para este caso, si ya está entregado y se desliza a 0, lo regresamos a 100 visualmente
      setSliderValue(100); 
    }
  };

  // Calcular el tamaño del círculo y la posición
  const containerWidth = 170; // Nuevo ancho
  const containerHeight = 35; // Nueva altura
  const circleDiameter = containerHeight * 0.8; // 80% de la altura
  const circleMargin = (containerHeight - circleDiameter) / 2; // Margen para centrar verticalmente
  const maxTranslateX = containerWidth - circleDiameter - (circleMargin * 2); // Ancho total - diámetro - márgenes

  return (
    <div className={`${cardBgColor} p-3 rounded-lg shadow-md mb-3 border-l-8 ${cardColorClass} transition-colors duration-500`}>
      <div className="relative flex justify-between items-center mb-1">
        {isDriverView && (
          <div 
            className="relative rounded-full overflow-hidden ml-auto"
            style={{
              width: `${containerWidth}px`,
              height: `${containerHeight}px`,
              background: delivery.delivered 
                ? 'linear-gradient(to right, #689F38, #558B2F)' 
                : 'linear-gradient(to right, #FDE68A, #FCD34D)', // Amarillo claro para OFF
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)', // Sombra interior para profundidad
            }}
          >
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={handleSliderChange}
              onMouseUp={() => { // Para desktop
                if (sliderValue < 100 && !delivery.delivered) setSliderValue(0);
              }}
              onTouchEnd={() => { // Para mobile
                if (sliderValue < 100 && !delivery.delivered) setSliderValue(0);
              }}
              className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent cursor-pointer z-10"
              style={{
                WebkitAppearance: 'none', // Para Safari
                background: 'transparent',
              }}
              disabled={delivery.delivered || isProcessing} // Deshabilitar si ya está entregado o procesando
            />
            <div
              className="absolute rounded-full shadow-md border border-gray-300 transition-transform duration-300 flex items-center justify-center"
              style={{
                height: `${circleDiameter}px`,
                width: `${circleDiameter}px`,
                top: `${circleMargin}px`,
                left: `${circleMargin}px`,
                transform: `translateX(${sliderValue / 100 * maxTranslateX}px)`,
                background: 'radial-gradient(circle at center, #f0f0f0 0%, #cccccc 100%)',
                boxShadow: '0px 1px 3px rgba(0,0,0,0.3), inset 0px 0px 0px 0.5px rgba(255,255,255,0.5)', // Sombra externa para relieve
              }}
            >
              {isProcessing && ( // Spinner de carga
                <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white z-0">
              {delivery.delivered ? 'Entregado' : 'Desliza para Confirmar'}
            </span>
          </div>
        )}
      </div>
      <h3 className={`text-lg font-bold ${textColorClass} mt-2`}>{delivery.clientName}</h3> {/* Nombre del cliente en negritas */}
      <p className="text-gray-600 text-sm mb-1">{delivery.address}</p> {/* Aumentado a text-sm */}
      {delivery.isPaqueteria && (
        <p className="text-red-600 text-xs font-bold mb-1">Entregar en Paquetería o Transporte</p>
      )}
      {delivery.observations && (
        <p className="text-red-600 text-xs mb-1">Observaciones: {delivery.observations}</p>
      )}
      {delivery.invoices && (
        <p className="text-blue-700 font-bold text-xs mb-1">Facturas: {delivery.invoices}</p>
      )}
      {delivery.meters && (
        <p className="text-blue-700 font-bold text-xs mb-1">
          Metros: {formatMeters(delivery.meters)}
        </p>
      )}
      {delivery.delivered && delivery.deliveryTime && (
        <p className={`text-green-700 ${deliveredTextClass} text-xs mt-1 flex items-center justify-between`}>
          <span>Entregado: {delivery.deliveryTime}</span>
          {/* Ícono de Google Maps solo se muestra si NO es la vista del chofer */}
          {!isDriverView && delivery.location && (
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${delivery.location.latitude},${delivery.location.longitude}`, '_blank')}
              className="ml-2 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
              title="Ver en Google Maps"
            >
              {/* SVG del ícono de Google Maps con tamaño w-7 h-7 (30x30px aprox) */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-blue-600">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </button>
          )}
        </p>
      )}
    </div>
  );
};

export default DeliveryCard;