import React, { useState, useEffect } from 'react';

const ClientSearchInput = ({ clients, onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (searchTerm.length > 1 && Array.isArray(clients)) {
      const filtered = clients.filter(client =>
        client.socialReason && client.socialReason.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, clients]);

  const handleSelect = (client) => {
    onSelectClient(client);
    setSearchTerm('');
    setSuggestions([]);
  };

  return (
    <div className="relative mb-3">
      <input
        type="text"
        placeholder="Buscar cliente por Razón Social"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition text-base"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">
          {suggestions.map((client) => (
            <li
              key={client.id}
              className="px-3 py-1.5 cursor-pointer hover:bg-gray-100 text-base"
              onClick={() => handleSelect(client)}
            >
              {client.socialReason} - {client.address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientSearchInput;