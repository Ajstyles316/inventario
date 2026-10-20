from django.urls import path

from . import views

urlpatterns = [
    path("", views.InicioView.as_view(), name="inicio"),
    path("login/", views.LoginUsuarioView.as_view(), name="login"),
    path("logout/", views.LogoutUsuarioView.as_view(), name="logout"),
    path("categorias/", views.CategoriaListView.as_view(), name="categoria_lista"),
    path("categorias/nueva/", views.CategoriaCreateView.as_view(), name="categoria_crear"),
    path("categorias/<int:pk>/editar/", views.CategoriaUpdateView.as_view(), name="categoria_editar"),
    path("categorias/<int:pk>/estado/", views.CategoriaToggleView.as_view(), name="categoria_toggle"),
    path("productos/", views.ProductoListView.as_view(), name="producto_lista"),
    path("productos/nuevo/", views.ProductoCreateView.as_view(), name="producto_crear"),
    path("productos/<int:pk>/", views.ProductoDetailView.as_view(), name="producto_detalle"),
    path("productos/<int:pk>/editar/", views.ProductoUpdateView.as_view(), name="producto_editar"),
    path("productos/<int:pk>/estado/", views.ProductoToggleView.as_view(), name="producto_toggle"),
    path("movimientos/", views.MovimientoListView.as_view(), name="movimiento_lista"),
    path("movimientos/nuevo/", views.MovimientoCreateView.as_view(), name="movimiento_crear"),
    path("alertas/", views.AlertaListView.as_view(), name="alerta_lista"),
]
