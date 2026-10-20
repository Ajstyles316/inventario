from django.contrib import admin

from .models import Categoria, Movimiento, Producto


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "activo", "actualizado")
    search_fields = ("nombre",)
    list_filter = ("activo",)


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("codigo", "nombre", "categoria", "activo")
    search_fields = ("codigo", "nombre")
    list_filter = ("activo", "categoria")


@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ("fecha", "tipo", "producto", "cantidad", "motivo", "usuario")
    list_filter = ("tipo", "motivo")
    search_fields = ("producto__codigo", "producto__nombre")

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
