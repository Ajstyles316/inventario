from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.shortcuts import redirect


def es_administrador(user):
    if not user.is_authenticated:
        return False
    return user.is_superuser or user.groups.filter(name="Administrador").exists()


class AdministradorRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    mensaje_permiso = "Solo el administrador puede hacer esta acción."

    def test_func(self):
        return es_administrador(self.request.user)

    def handle_no_permission(self):
        if self.request.user.is_authenticated:
            messages.error(self.request, self.mensaje_permiso)
            return redirect("inicio")
        return super().handle_no_permission()
