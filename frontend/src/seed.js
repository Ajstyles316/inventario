export const CATEGORIAS = [
  ["Bebidas", "Jugos, aguas, refrescos y café.", "https://images.unsplash.com/photo-1544145945-f90425316c8c?auto=format&fit=crop&w=800&q=80"],
  ["Abarrotes", "Granos, enlatados y despensa seca.", "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=800&q=80"],
  ["Lácteos", "Leche, yogurt, quesos y mantequilla.", "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80"],
  ["Panadería", "Pan, galletas y repostería.", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"],
  ["Carnes", "Res, pollo, cerdo y embutidos.", "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80"],
  ["Frutas y verduras", "Produce fresco de temporada.", "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80"],
  ["Limpieza", "Detergentes, cloro y utensilios.", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80"],
  ["Cuidado personal", "Jabones, shampoo y higiene.", "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80"],
  ["Snacks", "Dulces, papas y golosinas.", "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80"],
  ["Congelados", "Helados y alimentos congelados.", "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80"],
  ["Mascotas", "Alimento y accesorios para mascotas.", "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80"],
  ["Hogar", "Artículos para la casa y cocina.", "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"],
  ["Papelería", "Útiles escolares y oficina.", "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80"],
  ["Farmacia", "Botiquín, vitaminas y primeros auxilios.", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"],
  ["Bebé", "Pañales, fórmulas y cuidado infantil.", "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80"],
  ["Electrónica", "Pilas, cables y accesorios.", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"],
];

export const PRODUCTOS = [
  ["BEB-001", "Agua 1.5 L", "Bebidas", 12.5, 18, 20, 8, "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80"],
  ["BEB-002", "Refresco cola 2 L", "Bebidas", 22, 32, 15, 40, "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80"],
  ["BEB-003", "Café molido 250 g", "Bebidas", 85, 120, 6, 12, "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80"],
  ["ABA-001", "Arroz 1 kg", "Abarrotes", 28, 38, 25, 60, "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"],
  ["ABA-002", "Frijol negro 1 kg", "Abarrotes", 32, 45, 20, 35, "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"],
  ["LAC-001", "Leche entera 1 L", "Lácteos", 18, 26, 18, 4, "https://images.unsplash.com/photo-1550583724-1cb9f1b3a3b2?auto=format&fit=crop&w=800&q=80"],
  ["LAC-002", "Yogurt natural 1 L", "Lácteos", 24, 35, 10, 14, "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80"],
  ["PAN-001", "Pan de caja", "Panadería", 30, 42, 12, 22, "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"],
  ["FRU-001", "Manzana roja kg", "Frutas y verduras", 35, 55, 10, 3, "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80"],
  ["LIM-001", "Detergente 1 kg", "Limpieza", 40, 58, 8, 16, "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80"],
  ["SNA-001", "Papas fritas 150 g", "Snacks", 14, 22, 15, 50, "https://images.unsplash.com/photo-1566478989037-eec17017d0aa?auto=format&fit=crop&w=800&q=80"],
  ["PET-001", "Croquetas perro 2 kg", "Mascotas", 95, 135, 5, 9, "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80"],
];

export function crearDatosIniciales() {
  const categorias = CATEGORIAS.map(([nombre, descripcion, imagen], i) => ({
    id: i + 1,
    nombre,
    descripcion,
    imagen,
    activo: true,
  }));
  const porNombre = Object.fromEntries(categorias.map((c) => [c.nombre, c.id]));
  const productos = PRODUCTOS.map(([codigo, nombre, cat, compra, venta, minimo, , imagen], i) => ({
    id: i + 1,
    codigo,
    nombre,
    descripcion: `${nombre} para el catálogo de demostración.`,
    categoriaId: porNombre[cat],
    precioCompra: compra,
    precioVenta: venta,
    stockMinimo: minimo,
    imagen,
    activo: true,
  }));
  const movimientos = PRODUCTOS.map((row, i) => ({
    id: i + 1,
    productoId: i + 1,
    tipo: "ENTRADA",
    cantidad: row[6],
    motivo: "INVENTARIO_INICIAL",
    observacion: "Carga inicial de demostración",
    usuario: "admin",
    fecha: new Date().toISOString(),
  }));
  return { categorias, productos, movimientos, nextIds: { categoria: 17, producto: 13, movimiento: 13 } };
}
