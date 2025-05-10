const negociosFiltrados = negocios.filter(negocio => {
  // Filtro de distancia
  const distancia = calcularDistancia(
    ubicacionUsuario.lat, 
    ubicacionUsuario.lng,
    negocio.lat,
    negocio.lng
  );
  
  // Filtro de categorías (corregir)
  const coincideCategoria = categoriasSeleccionadas.length === 0 || 
    categoriasSeleccionadas.includes('todas') ||
    categoriasSeleccionadas.some(cat => negocio.categorias.includes(cat));

  return distancia <= radioFiltro && coincideCategoria;
}); 