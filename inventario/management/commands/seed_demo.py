from decimal import Decimal

from django.contrib.auth.models import User
from django.contrib.sites.models import Site
from django.core.management.base import BaseCommand

from inventario.models import Categoria, Movimiento, Producto

CATEGORIAS = [
    ("Bebidas", "Jugos, aguas, refrescos y café.", "https://images.unsplash.com/photo-1544145945-f90425316c8c?auto=format&fit=crop&w=800&q=80"),
    ("Abarrotes", "Granos, enlatados y despensa seca.", "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=800&q=80"),
    ("Lácteos", "Leche, yogurt, quesos y mantequilla.", "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80"),
    ("Panadería", "Pan, galletas y repostería.", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"),
    ("Carnes", "Res, pollo, cerdo y embutidos.", "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80"),
    ("Frutas y verduras", "Produce fresco de temporada.", "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80"),
    ("Limpieza", "Detergentes, cloro y utensilios.", "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80"),
    ("Cuidado personal", "Jabones, shampoo y higiene.", "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=800&q=80"),
    ("Snacks", "Dulces, papas y golosinas.", "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=800&q=80"),
    ("Congelados", "Helados y alimentos congelados.", "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80"),
    ("Mascotas", "Alimento y accesorios para mascotas.", "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80"),
    ("Hogar", "Artículos para la casa y cocina.", "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80"),
    ("Papelería", "Útiles escolares y oficina.", "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=800&q=80"),
    ("Farmacia", "Botiquín, vitaminas y primeros auxilios.", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"),
    ("Bebé", "Pañales, fórmulas y cuidado infantil.", "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80"),
    ("Electrónica", "Pilas, cables y accesorios.", "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"),
]

PRODUCTOS = [
    ("BEB-001", "Agua 1.5 L", "Bebidas", "12.50", "18.00", 20, 8, "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80"),
    ("BEB-002", "Refresco cola 2 L", "Bebidas", "22.00", "32.00", 15, 40, "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&w=800&q=80"),
    ("BEB-003", "Café molido 250 g", "Bebidas", "85.00", "120.00", 6, 12, "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80"),
    ("ABA-001", "Arroz 1 kg", "Abarrotes", "28.00", "38.00", 25, 60, "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80"),
    ("ABA-002", "Frijol negro 1 kg", "Abarrotes", "32.00", "45.00", 20, 35, "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80"),
    ("LAC-001", "Leche entera 1 L", "Lácteos", "18.00", "26.00", 18, 4, "https://images.unsplash.com/photo-1550583724-1cb9f1b3a3b2?auto=format&fit=crop&w=800&q=80"),
    ("LAC-002", "Yogurt natural 1 L", "Lácteos", "24.00", "35.00", 10, 14, "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80"),
    ("PAN-001", "Pan de caja", "Panadería", "30.00", "42.00", 12, 22, "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"),
    ("FRU-001", "Manzana roja kg", "Frutas y verduras", "35.00", "55.00", 10, 3, "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80"),
    ("LIM-001", "Detergente 1 kg", "Limpieza", "40.00", "58.00", 8, 16, "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80"),
    ("SNA-001", "Papas fritas 150 g", "Snacks", "14.00", "22.00", 15, 50, "https://images.unsplash.com/photo-1566478989037-eec17017d0aa?auto=format&fit=crop&w=800&q=80"),
    ("PET-001", "Croquetas perro 2 kg", "Mascotas", "95.00", "135.00", 5, 9, "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80"),
]


class Command(BaseCommand):
    help = "Carga categorías, productos y movimientos de demostración."

    def handle(self, *args, **options):
        Site.objects.update_or_create(
            id=1,
            defaults={"domain": "127.0.0.1:8000", "name": "NovaStock"},
        )
        for nombre, descripcion, imagen in CATEGORIAS:
            Categoria.objects.update_or_create(
                nombre=nombre,
                defaults={"descripcion": descripcion, "imagen_url": imagen, "activo": True},
            )

        admin = User.objects.filter(is_superuser=True).first() or User.objects.first()
        if not admin:
            self.stdout.write(self.style.ERROR("Crea un usuario admin antes de sembrar movimientos."))
            return

        for codigo, nombre, cat_nombre, compra, venta, minimo, entrada, imagen in PRODUCTOS:
            categoria = Categoria.objects.get(nombre=cat_nombre)
            producto, _ = Producto.objects.update_or_create(
                codigo=codigo,
                defaults={
                    "nombre": nombre,
                    "categoria": categoria,
                    "descripcion": f"{nombre} para el catálogo de demostración.",
                    "precio_compra": Decimal(compra),
                    "precio_venta": Decimal(venta),
                    "stock_minimo": minimo,
                    "imagen_url": imagen,
                    "activo": True,
                },
            )
            if not producto.movimientos.exists():
                Movimiento.objects.create(
                    producto=producto,
                    tipo=Movimiento.Tipo.ENTRADA,
                    cantidad=entrada,
                    motivo=Movimiento.Motivo.INVENTARIO_INICIAL,
                    observacion="Carga inicial de demostración",
                    usuario=admin,
                )

        self.stdout.write(self.style.SUCCESS("Datos de demostración listos."))
