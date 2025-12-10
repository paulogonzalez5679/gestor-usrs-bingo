import React from 'react';
import { useLocation } from 'react-router-dom';
import BuscarParticipante from './BuscarParticipante';

const PublicBuscar = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const cedula = params.get('cedula') || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded shadow p-6">
        <BuscarParticipante initialCedula={cedula} />
      </div>
    </div>
  );
};

export default PublicBuscar;
