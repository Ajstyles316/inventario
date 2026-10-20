from django.conf import settings
from django.db.models import F

from .mixins import es_administrador
from .services import productos_con_stock


def roles(request):
    admin = es_administrador(request.user)
    alertas = 0
    if request.user.is_authenticated:
        alertas = productos_con_stock().filter(activo=True, stock__lt=F("stock_minimo")).count()
    return {
        "es_administrador": admin,
        "alertas_count": alertas,
        "google_login_disponible": bool(getattr(settings, "GOOGLE_CLIENT_ID", "")),
    }
