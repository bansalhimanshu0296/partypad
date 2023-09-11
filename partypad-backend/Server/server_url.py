import os
from dotenv import load_dotenv

load_dotenv()

os.system("python manage.py runserver "+str(os.environ.get('INTERNAL_IP'))+":8000")