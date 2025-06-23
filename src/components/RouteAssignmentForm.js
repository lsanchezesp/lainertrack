import React, { useState } from 'react';
import ClientSearchInput from './ClientSearchInput';

const RouteAssignmentForm = ({ trucks, clients, onAddDeliveryToRoute }) => {
  const [selectedTruckId, setSelectedTruckId] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isPaqueteria, setIsPaqueteria] = useState(false);
  const [observations, setObservations] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [meters, setMeters] = useState('');

  const handleAddDelivery = () => {
    if (!selectedTruckId || !selectedClient) {
      alert('Por favor, selecciona una camioneta y un cliente.');
      return;
    }

    const newDelivery = {
      id: Date.now(),
      clientId: selectedClient.id,
      clientName: selectedClient.socialReason,
      address: selectedClient.address,
      isPaqueteria, // Se guarda el estado del checkbox
      observations,
      invoices: invoiceNumber,
      meters: parseFloat(meters.replace(/,/g, '') || 0),
      delivered: false,
      deliveryTime: null,
      location: null,
    };

    onAddDeliveryToRoute(selectedTruckId, newDelivery);

    // Limpiar formulario
    setSelectedClient(null);
    setIsPaqueteria(false);
    setObservations('');
    setInvoiceNumber('');
    setMeters('');
  };

  // Función para manejar el cambio del campo de facturas
  const handleInvoiceChange = (e) => {
    const rawValue = e.target.value;
    // Permite cualquier carácter, pero asegura que empiece con FE00 si no lo hace
    if (!rawValue.startsWith('FE00')) {
      setInvoiceNumber('FE00' + rawValue);
    } else {
      setInvoiceNumber(rawValue);
    }
  };

  const formatMeters = (value) => {
    const num = value.replace(/[^0-9.]/g, '');
    const parts = num.split('.');
    if (parts.length > 2) {
      parts[1] = parts[1].substring(0, 2);
      return `${parts[0]}.${parts[1]}`;
    }
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2);
    }
    return parts.join('.');
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mb-5">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Asignar a Rutas de Camionetas</h3>

      <div className="mb-3">
        <label className="block text-gray-700 text-base font-medium mb-2">Seleccionar Camioneta</label>
        <select
          value={selectedTruckId}
          onChange={(e) => setSelectedTruckId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition text-base"
        >
          <option value="">-- Selecciona una camioneta --</option>
          {trucks.map((truck) => (
            <option key={truck.id} value={truck.id}>
              {truck.name}
            </option>
          ))}
        </select>
      </div>

      <ClientSearchInput clients={clients} onSelectClient={setSelectedClient} />

      {selectedClient && (
        <div className="bg-blue-50 p-3 rounded-lg mb-3 border border-blue-200">
          <h4 className="text-base font-bold text-gray-800">Cliente Seleccionado:</h4>
          <p className="text-gray-700 text-sm">{selectedClient.socialReason}</p>
          <p className="text-gray-600 text-sm">{selectedClient.address}</p>
          {isPaqueteria && ( // Muestra el texto si el checkbox está marcado
            <p className="text-red-600 text-xs font-bold mt-1">Entregar en Paquetería o Transporte</p>
          )}
        </div>
      )}

      <div className="mb-3">
        <label className="inline-flex items-center text-gray-700 text-base font-medium">
          <input
            type="checkbox"
            checked={isPaqueteria}
            onChange={(e) => setIsPaqueteria(e.target.checked)}
            className="form-checkbox h-4 w-4 text-black rounded focus:ring-black"
          />
          <span className="ml-2">Entregar en Paquetería o transporte</span>
        </label>
      </div>

      <div className="mb-3">
        <label className="block text-gray-700 text-base font-medium mb-2">Observaciones</label>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition resize-none text-base bg-yellow-50" // Fondo amarillo claro
          rows="2"
        ></textarea>
      </div>

      <div className="mb-3">
        <label className="block text-gray-700 text-base font-medium mb-2">Facturas</label>
        <input
          type="text" // Permite cualquier carácter
          value={invoiceNumber}
          onChange={handleInvoiceChange} // Usar la nueva función de manejo de cambio
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition text-base"
          placeholder="FE0012345"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-base font-medium mb-2">Metros</label>
        <input
          type="text" // Se mantiene text para permitir el punto decimal
          inputMode="decimal" // Sugiere teclado numérico con decimal en móviles
          pattern="[0-9]*[.]?[0-9]{0,2}" // Permite números y hasta 2 decimales
          value={meters}
          onChange={(e) => setMeters(formatMeters(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition text-base"
          placeholder="0.00"
        />
      </div>

      <button
        onClick={handleAddDelivery}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition duration-200 text-base font-semibold" // Color azul
      >
        Agregar a Ruta
      </button>
    </div>
  );
};

export default RouteAssignmentForm;