import React, { useState } from 'react';

const ClientManagement = ({ clients, onAddClient, onDeleteClient, onImportClients, onClearClients }) => {
  const [newSocialReason, setNewSocialReason] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [searchClientTerm, setSearchClientTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleAddClient = () => {
    if (newSocialReason && newAddress) {
      onAddClient({ id: Date.now(), socialReason: newSocialReason, address: newAddress });
      setNewSocialReason('');
      setNewAddress('');
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const importedClients = [];
        const lines = text.split('\n').filter(line => line.trim() !== '');

        lines.forEach(line => {
          // Regex para manejar CSV que puede tener comas dentro de campos encerrados en comillas dobles
          // Ejemplo: "Casa de Toño, S.A. de C.V.", "Dirección con, comas"
          const parts = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
          
          if (parts && parts.length >= 2) {
            const socialReason = parts[0].replace(/"/g, '').trim();
            const address = parts.slice(1).map(p => p.replace(/"/g, '').trim()).join(', '); // Une el resto de partes como dirección
            importedClients.push({ id: Date.now() + Math.random(), socialReason, address });
          }
        });
        
        onImportClients(importedClients);
        alert(`Se importaron ${importedClients.length} clientes.`);
      };
      reader.readAsText(file);
    }
  };

  const handleSearchClients = () => {
    if (searchClientTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const results = Array.isArray(clients) ? clients.filter(client =>
      client.socialReason && client.socialReason.toLowerCase().includes(searchClientTerm.toLowerCase())
    ) : [];
    setSearchResults(results);
  };

  const handleDeleteFromSearch = (clientId) => {
    onDeleteClient(clientId);
    setSearchResults(searchResults.filter(client => client.id !== clientId)); // Actualiza los resultados de búsqueda
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mb-5">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Gestión de Clientes</h3>

      {/* Conteo total de clientes */}
      <div className="mb-5 p-3 bg-gray-100 rounded-lg text-center">
        <p className="text-lg font-semibold text-gray-800">Total de Clientes: {Array.isArray(clients) ? clients.length : 0}</p>
      </div>

      {/* Importar Clientes */}
      <div className="mb-5">
        <label className="block text-gray-700 text-base font-medium mb-2">Importar Clientes (CSV)</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileImport}
          className="w-full text-gray-700 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black transition text-base"
        />
        <button
          onClick={onClearClients}
          className="mt-3 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-200 text-base font-semibold"
        >
          Limpiar Clientes
        </button>
      </div>

      {/* Agregar Cliente Manualmente */}
      <div className="mb-5">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Agregar Cliente Manualmente</h4>
        <input
          type="text"
          placeholder="Razón Social"
          value={newSocialReason}
          onChange={(e) => setNewSocialReason(e.target.value)}
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition text-base"
        />
        <input
          type="text"
          placeholder="Dirección"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition text-base"
        />
        <button
          onClick={handleAddClient}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition duration-200 text-base font-semibold"
        >
          Agregar Cliente
        </button>
      </div>

      {/* Buscar y Eliminar Clientes */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Buscar y Eliminar Clientes</h4>
        <input
          type="text"
          placeholder="Buscar cliente por Razón Social"
          value={searchClientTerm}
          onChange={(e) => setSearchClientTerm(e.target.value)}
          className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition text-base"
        />
        <button
          onClick={handleSearchClients}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition duration-200 text-base font-semibold mb-3"
        >
          Buscar Cliente
        </button>

        {searchResults.length > 0 && (
          <ul className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg p-2">
            {searchResults.map((client) => (
              <li key={client.id} className="flex justify-between items-center py-2 border-b last:border-b-0 border-gray-100">
                <div>
                  <p className="font-bold text-gray-800 text-base">{client.socialReason}</p>
                  <p className="text-sm text-gray-600">{client.address}</p>
                </div>
                <button
                  onClick={() => handleDeleteFromSearch(client.id)}
                  className="text-red-500 hover:text-red-700 transition duration-200 text-xs"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
        {searchClientTerm.trim() !== '' && searchResults.length === 0 && (
          <p className="text-gray-600 text-center py-3 text-base">No se encontraron clientes con ese nombre.</p>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;