"""Ajustes del Sistema de Inventario NovaStock."""

from pathlib import Path
import os

import dj_database_url
from django.contrib.messages import constants as message_constants
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# --- Seguridad básica ---------------------------------------------------
# Por defecto DEBUG es False (producción). En tu .env local pon DEBUG=True.
DEBUG = os.getenv("DEBUG", "False").lower() in {"1", "true", "yes"}

SECRET_KEY = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "clave-insegura-solo-para-desarrollo"
    else:
        raise RuntimeError("Falta la variable de entorno SECRET_KEY")

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if host.strip()
]

CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CSRF_TRUSTED_ORIGINS", "").split(",")
    if origin.strip()
]

# --- Aplicaciones -------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.humanize",
    "django.contrib.sites",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "inventario",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # justo después de Security
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

ROOT_URLCONF = "config.urls"
SITE_ID = 1

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "inventario.context_processors.roles",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# --- Base de datos ------------------------------------------------------
# En Render se usa DATABASE_URL. En local se usan las variables DB_*.
if os.getenv("DATABASE_URL"):
    DATABASES = {"default": dj_database_url.config(conn_max_age=600)}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("DB_NAME", "inventario"),
            "USER": os.getenv("DB_USER", "inventario"),
            "PASSWORD": os.getenv("DB_PASSWORD", ""),
            "HOST": os.getenv("DB_HOST", "localhost"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --- Idioma y zona horaria ---------------------------------------------
LANGUAGE_CODE = "es"
TIME_ZONE = "America/La_Paz"
USE_I18N = True
USE_TZ = True

# --- Archivos estáticos y media ----------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "static"]  # la carpeta static/ debe existir
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"  # en Render se borra en cada despliegue

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- Login --------------------------------------------------------------
LOGIN_URL = "/login/"
LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/login/"
ACCOUNT_LOGOUT_REDIRECT_URL = "/login/"

MESSAGE_TAGS = {message_constants.ERROR: "danger"}

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]

ACCOUNT_ADAPTER = "inventario.adapters.InventarioAccountAdapter"
SOCIALACCOUNT_ADAPTER = "inventario.adapters.InventarioSocialAdapter"
ACCOUNT_EMAIL_VERIFICATION = "none"
ACCOUNT_UNIQUE_EMAIL = True
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_QUERY_EMAIL = True
SOCIALACCOUNT_LOGIN_ON_GET = False
ACCOUNT_DEFAULT_HTTP_PROTOCOL = os.getenv("ACCOUNT_DEFAULT_HTTP_PROTOCOL", "http")

# --- Google OAuth -------------------------------------------------------
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"access_type": "online", "prompt": "select_account"},
        "OAUTH_PKCE_ENABLED": True,
        "FETCH_USERINFO": True,
    }
}
if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    SOCIALACCOUNT_PROVIDERS["google"]["APP"] = {
        "client_id": GOOGLE_CLIENT_ID,
        "secret": GOOGLE_CLIENT_SECRET,
        "key": "",
    }

# --- Seguridad en producción -------------------------------------------
if not DEBUG:
    # Render termina el HTTPS y le pasa HTTP a Django; sin esta línea,
    # SECURE_SSL_REDIRECT provoca un bucle de redirecciones.
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True