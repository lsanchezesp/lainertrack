export const formatTime = (date) => {
  if (!date) return '';
  const options = { hour: '2-digit', minute: '2-digit', hour12: true };
  return new Date(date).toLocaleTimeString('es-MX', options);
};

export const formatMeters = (value) => {
  if (typeof value !== 'number') return '';
  return value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};