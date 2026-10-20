from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import LoginView, LogoutView
from decimal import Decimal

from django.db.models import Count, DecimalField, ExpressionWrapper, F, Q, Sum
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse_lazy
from django.utils import timezone
from django.views import View
from django.views.generic import CreateView, DetailView, ListView, TemplateView, UpdateView

from .forms import CategoriaForm, MovimientoForm, ProductoForm
from .mixins import AdministradorRequiredMixin
from .models import Categoria, Movimiento, Producto
from .services import productos_con_stock, stock_de


class LoginUsuarioView(LoginView):
    template_name = "inventario/login.html"
    redirect_authenticated_user = True


class LogoutUsuarioView(LogoutView):
    next_page = reverse_lazy("login")


class InicioView(LoginRequiredMixin, TemplateView):
    template_name = "inventario/inicio.html"

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        productos = productos_con_stock()
        activos = productos.filter(activo=True)
        hoy = timezone.localdate()
        ctx.update(
            {
                "total_productos": activos.count(),
                "total_categorias": Categoria.objects.filter(activo=True).count(),
                "alertas": activos.filter(stock__lt=F("stock_minimo")).count(),
                "movimientos_hoy": Movimiento.objects.filter(fecha__date=hoy).count(),
                "valor_inventario": activos.aggregate(
                    total=Sum(
                        ExpressionWrapper(
                            F("precio_compra") * F("stock"),
                            output_field=DecimalField(max_digits=14, decimal_places=2),
                        )
                    )
                )["total"]
                or Decimal("0"),
                "ultimos_movimientos": Movimiento.objects.select_related(
                    "producto", "usuario"
                )[:8],
                "productos_alerta": activos.filter(stock__lt=F("stock_minimo")).select_related(
                    "categoria"
                )[:6],
                "categorias_destacadas": Categoria.objects.filter(activo=True).annotate(
                    n_productos=Count("productos", filter=Q(productos__activo=True))
                )[:8],
            }
        )
        return ctx


class CategoriaListView(LoginRequiredMixin, ListView):
    model = Categoria
    template_name = "inventario/categorias/lista.html"
    context_object_name = "categorias"

    def get_queryset(self):
        qs = Categoria.objects.annotate(
            n_productos=Count("productos", filter=Q(productos__activo=True))
        )
        q = self.request.GET.get("q", "").strip()
        estado = self.request.GET.get("estado", "activas")
        if q:
            qs = qs.filter(Q(nombre__icontains=q) | Q(descripcion__icontains=q))
        if estado == "activas":
            qs = qs.filter(activo=True)
        elif estado == "inactivas":
            qs = qs.filter(activo=False)
        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["q"] = self.request.GET.get("q", "")
        ctx["estado"] = self.request.GET.get("estado", "activas")
        return ctx


class CategoriaCreateView(AdministradorRequiredMixin, CreateView):
    model = Categoria
    form_class = CategoriaForm
    template_name = "inventario/categorias/form.html"
    success_url = reverse_lazy("categoria_lista")
    mensaje_permiso = "Solo el administrador puede crear categorías."

    def form_valid(self, form):
        messages.success(self.request, "Categoría creada correctamente.")
        return super().form_valid(form)


class CategoriaUpdateView(AdministradorRequiredMixin, UpdateView):
    model = Categoria
    form_class = CategoriaForm
    template_name = "inventario/categorias/form.html"
    success_url = reverse_lazy("categoria_lista")
    mensaje_permiso = "Solo el administrador puede editar categorías."

    def form_valid(self, form):
        messages.success(self.request, "Categoría actualizada correctamente.")
        return super().form_valid(form)


class CategoriaToggleView(AdministradorRequiredMixin, View):
    mensaje_permiso = "Solo el administrador puede desactivar categorías."

    def post(self, request, pk):
        categoria = get_object_or_404(Categoria, pk=pk)
        categoria.activo = not categoria.activo
        categoria.save(update_fields=["activo", "actualizado"])
        if categoria.activo:
            messages.success(request, f"«{categoria.nombre}» volvió a activarse.")
        else:
            messages.warning(request, f"«{categoria.nombre}» quedó desactivada.")
        return redirect("categoria_lista")


class ProductoListView(LoginRequiredMixin, ListView):
    template_name = "inventario/productos/lista.html"
    context_object_name = "productos"

    def get_queryset(self):
        qs = productos_con_stock().select_related("categoria")
        q = self.request.GET.get("q", "").strip()
        categoria = self.request.GET.get("categoria", "")
        estado = self.request.GET.get("estado", "activos")
        if q:
            qs = qs.filter(Q(nombre__icontains=q) | Q(codigo__icontains=q))
        if categoria:
            qs = qs.filter(categoria_id=categoria)
        if estado == "activos":
            qs = qs.filter(activo=True)
        elif estado == "inactivos":
            qs = qs.filter(activo=False)
        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["q"] = self.request.GET.get("q", "")
        ctx["categoria_id"] = self.request.GET.get("categoria", "")
        ctx["estado"] = self.request.GET.get("estado", "activos")
        ctx["categorias"] = Categoria.objects.filter(activo=True)
        return ctx


class ProductoCreateView(AdministradorRequiredMixin, CreateView):
    model = Producto
    form_class = ProductoForm
    template_name = "inventario/productos/form.html"
    success_url = reverse_lazy("producto_lista")
    mensaje_permiso = "Solo el administrador puede crear productos."

    def form_valid(self, form):
        messages.success(self.request, "Producto creado. El stock empieza en 0 hasta registrar una entrada.")
        return super().form_valid(form)


class ProductoUpdateView(AdministradorRequiredMixin, UpdateView):
    model = Producto
    form_class = ProductoForm
    template_name = "inventario/productos/form.html"
    success_url = reverse_lazy("producto_lista")
    mensaje_permiso = "Solo el administrador puede editar productos."

    def form_valid(self, form):
        messages.success(self.request, "Producto actualizado correctamente.")
        return super().form_valid(form)


class ProductoDetailView(LoginRequiredMixin, DetailView):
    model = Producto
    template_name = "inventario/productos/detalle.html"
    context_object_name = "producto"

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["stock"] = stock_de(self.object.pk)
        ctx["movimientos"] = self.object.movimientos.select_related("usuario")[:20]
        return ctx


class ProductoToggleView(AdministradorRequiredMixin, View):
    mensaje_permiso = "Solo el administrador puede desactivar productos."

    def post(self, request, pk):
        producto = get_object_or_404(Producto, pk=pk)
        producto.activo = not producto.activo
        producto.save(update_fields=["activo", "actualizado"])
        estado = "activado" if producto.activo else "desactivado"
        messages.success(request, f"Producto {estado}.")
        return redirect("producto_detalle", pk=producto.pk)


class MovimientoListView(LoginRequiredMixin, ListView):
    template_name = "inventario/movimientos/lista.html"
    context_object_name = "movimientos"
    paginate_by = 25

    def get_queryset(self):
        qs = Movimiento.objects.select_related("producto", "usuario", "producto__categoria")
        tipo = self.request.GET.get("tipo", "")
        q = self.request.GET.get("q", "").strip()
        if tipo in {Movimiento.Tipo.ENTRADA, Movimiento.Tipo.SALIDA}:
            qs = qs.filter(tipo=tipo)
        if q:
            qs = qs.filter(
                Q(producto__nombre__icontains=q) | Q(producto__codigo__icontains=q)
            )
        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx["tipo"] = self.request.GET.get("tipo", "")
        ctx["q"] = self.request.GET.get("q", "")
        return ctx


class MovimientoCreateView(LoginRequiredMixin, CreateView):
    model = Movimiento
    form_class = MovimientoForm
    template_name = "inventario/movimientos/form.html"
    success_url = reverse_lazy("movimiento_lista")

    def get_initial(self):
        initial = super().get_initial()
        producto = self.request.GET.get("producto")
        if producto:
            initial["producto"] = producto
            initial["tipo"] = Movimiento.Tipo.ENTRADA
            initial["motivo"] = Movimiento.Motivo.COMPRA
        return initial

    def form_valid(self, form):
        form.instance.usuario = self.request.user
        messages.success(self.request, "Movimiento registrado. El historial no se puede editar.")
        return super().form_valid(form)


class AlertaListView(LoginRequiredMixin, ListView):
    template_name = "inventario/alertas/lista.html"
    context_object_name = "productos"

    def get_queryset(self):
        return (
            productos_con_stock()
            .filter(activo=True, stock__lt=F("stock_minimo"))
            .select_related("categoria")
        )
