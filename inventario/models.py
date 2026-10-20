from django.conf import settings
from django.db import models


class Categoria(models.Model):
    nombre = models.CharField("nombre", max_length=100, unique=True)
    descripcion = models.TextField("descripción", blank=True)
    imagen_url = models.URLField("imagen", max_length=500, blank=True)
    activo = models.BooleanField("activa", default=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name = "categoría"
        verbose_name_plural = "categorías"

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    codigo = models.CharField("código", max_length=30, unique=True)
    nombre = models.CharField("nombre", max_length=150)
    descripcion = models.TextField("descripción", blank=True)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name="productos",
        verbose_name="categoría",
    )
    precio_compra = models.DecimalField("precio de compra", max_digits=10, decimal_places=2)
    precio_venta = models.DecimalField("precio de venta", max_digits=10, decimal_places=2)
    stock_minimo = models.PositiveIntegerField("stock mínimo", default=5)
    imagen_url = models.URLField("imagen", max_length=500, blank=True)
    activo = models.BooleanField("activo", default=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name = "producto"
        verbose_name_plural = "productos"

    def __str__(self):
        return f"{self.codigo} — {self.nombre}"


class Movimiento(models.Model):
    class Tipo(models.TextChoices):
        ENTRADA = "ENTRADA", "Entrada"
        SALIDA = "SALIDA", "Salida"

    class Motivo(models.TextChoices):
        COMPRA = "COMPRA", "Compra"
        INVENTARIO_INICIAL = "INVENTARIO_INICIAL", "Inventario inicial"
        VENTA = "VENTA", "Venta"
        MERMA = "MERMA", "Merma"
        CORRECCION = "CORRECCION", "Corrección"

    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name="movimientos",
    )
    tipo = models.CharField(max_length=10, choices=Tipo.choices)
    cantidad = models.PositiveIntegerField()
    motivo = models.CharField(max_length=30, choices=Motivo.choices)
    observacion = models.TextField("observación", blank=True)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="movimientos",
    )
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-fecha"]
        verbose_name = "movimiento"
        verbose_name_plural = "movimientos"

    def __str__(self):
        return f"{self.tipo} {self.cantidad} {self.producto.codigo}"
