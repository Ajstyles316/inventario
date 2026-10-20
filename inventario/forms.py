from django import forms
from django.core.exceptions import ValidationError

from .models import Categoria, Movimiento, Producto
from .services import stock_de


def control(widget, **attrs):
    css = attrs.pop("class", "form-control")
    attrs["class"] = css
    return widget(attrs=attrs)


class CategoriaForm(forms.ModelForm):
    class Meta:
        model = Categoria
        fields = ["nombre", "descripcion", "imagen_url"]
        widgets = {
            "nombre": control(forms.TextInput, placeholder="Ej. Bebidas"),
            "descripcion": control(forms.Textarea, rows=3, placeholder="Qué productos agrupa"),
            "imagen_url": control(forms.URLInput, placeholder="https://... imagen de la categoría"),
        }


class ProductoForm(forms.ModelForm):
    class Meta:
        model = Producto
        fields = [
            "codigo",
            "nombre",
            "descripcion",
            "categoria",
            "precio_compra",
            "precio_venta",
            "stock_minimo",
            "imagen_url",
        ]
        widgets = {
            "codigo": control(forms.TextInput, placeholder="SKU-001"),
            "nombre": control(forms.TextInput, placeholder="Nombre del producto"),
            "descripcion": control(forms.Textarea, rows=3),
            "categoria": control(forms.Select, **{"class": "form-select"}),
            "precio_compra": control(forms.NumberInput, step="0.01", min="0"),
            "precio_venta": control(forms.NumberInput, step="0.01", min="0"),
            "stock_minimo": control(forms.NumberInput, min="0"),
            "imagen_url": control(forms.URLInput, placeholder="https://... foto del producto"),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["categoria"].queryset = Categoria.objects.filter(activo=True)


class MovimientoForm(forms.ModelForm):
    class Meta:
        model = Movimiento
        fields = ["producto", "tipo", "cantidad", "motivo", "observacion"]
        widgets = {
            "producto": control(forms.Select, **{"class": "form-select"}),
            "tipo": control(forms.Select, **{"class": "form-select"}),
            "cantidad": control(forms.NumberInput, min="1"),
            "motivo": control(forms.Select, **{"class": "form-select"}),
            "observacion": control(forms.Textarea, rows=2, placeholder="Nota opcional"),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["producto"].queryset = Producto.objects.filter(activo=True)

    def clean(self):
        cleaned = super().clean()
        tipo = cleaned.get("tipo")
        motivo = cleaned.get("motivo")
        producto = cleaned.get("producto")
        cantidad = cleaned.get("cantidad")

        motivos_entrada = {
            Movimiento.Motivo.COMPRA,
            Movimiento.Motivo.INVENTARIO_INICIAL,
            Movimiento.Motivo.CORRECCION,
        }
        motivos_salida = {
            Movimiento.Motivo.VENTA,
            Movimiento.Motivo.MERMA,
            Movimiento.Motivo.CORRECCION,
        }
        if tipo == Movimiento.Tipo.ENTRADA and motivo not in motivos_entrada:
            raise ValidationError("Ese motivo no vale para una entrada.")
        if tipo == Movimiento.Tipo.SALIDA and motivo not in motivos_salida:
            raise ValidationError("Ese motivo no vale para una salida.")
        if tipo == Movimiento.Tipo.SALIDA and producto and cantidad:
            disponible = stock_de(producto.pk)
            if cantidad > disponible:
                raise ValidationError(
                    f"No hay stock suficiente. Disponible: {disponible}."
                )
        return cleaned
