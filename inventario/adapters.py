from django.contrib.auth.models import Group

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter


class InventarioAccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request):
        return False


class InventarioSocialAdapter(DefaultSocialAccountAdapter):
    def is_open_for_signup(self, request, sociallogin):
        return True

    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)
        grupo, _ = Group.objects.get_or_create(name="Operador")
        user.groups.add(grupo)
        return user
