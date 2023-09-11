from django.apps import AppConfig
from partypad.settings import MEDIA_ROOT
import os

class BackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend'
    verbose_name = "Backend Server"
    def ready(self):
        if not (os.path.exists(MEDIA_ROOT)):
            os.mkdir(MEDIA_ROOT)

