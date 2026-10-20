from django.db.models import IntegerField, Q, Sum, Value
from django.db.models.functions import Coalesce

from .models import Movimiento, Producto


def stock_de(producto_id):
    qs = Movimiento.objects.filter(producto_id=producto_id)
    entradas = qs.filter(tipo=Movimiento.Tipo.ENTRADA).aggregate(
        total=Coalesce(Sum("cantidad"), Value(0), output_field=IntegerField())
    )["total"]
    salidas = qs.filter(tipo=Movimiento.Tipo.SALIDA).aggregate(
        total=Coalesce(Sum("cantidad"), Value(0), output_field=IntegerField())
    )["total"]
    return entradas - salidas


def productos_con_stock():
    entradas = Coalesce(
        Sum("movimientos__cantidad", filter=Q(movimientos__tipo=Movimiento.Tipo.ENTRADA)),
        Value(0),
        output_field=IntegerField(),
    )
    salidas = Coalesce(
        Sum("movimientos__cantidad", filter=Q(movimientos__tipo=Movimiento.Tipo.SALIDA)),
        Value(0),
        output_field=IntegerField(),
    )
    return Producto.objects.annotate(stock=entradas - salidas)
