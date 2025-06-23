import React, { useState } from 'react';

const TruckConfigCard = ({ truck, onUpdateTruck, onDeleteTruck }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(truck.name);
  const [driver, setDriver] = useState(truck.driver);
  const [password, setPassword] = useState(truck.password);
  const [color, setColor] = useState(truck.color);

  const handleSave = () => {
    onUpdateTruck({ ...truck, name, driver, password, color });
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mb-3 border-l-8" style={{ borderColor: color }}>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-1.5 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base"
            placeholder="Nombre de la Camioneta"
          />
          <input
            type="text"
            value={driver}
            onChange={(e) => setDriver(e.target.value)}
            className="w-full px-3 py-1.5 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base"
            placeholder="Nombre del Chofer"
          />
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-1.5 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base"
            placeholder="Contraseña"
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-9 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            title="Seleccionar Color"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 text-sm"
            >
              Guardar
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-200 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{truck.name}</h3>
          <p className="text-gray-600 text-base">Chofer: {truck.driver}</p>
          <p className="text-gray-600 text-base">Contraseña: {truck.password}</p>
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm"
            >
              Editar
            </button>
            <button
              onClick={() => onDeleteTruck(truck.id)}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckConfigCard;