import os
from dotenv import load_dotenv

load_dotenv()

DB_NAME = str(os.environ.get('DB_NAME'))
DB_USER = str(os.environ.get('DB_USER'))
DB_PASSWORD = str(os.environ.get('DB_PASSWORD'))
DB_HOST = str(os.environ.get('DB_HOST'))
DB_DIALECT = str(os.environ.get('DB_DIALECT'))

def Generate_DB_URl():
    db_url = ''

    if DB_DIALECT == 'POSTGRESQL':
        DB_LIBRARIES = 'postgresql+psycopg2'
        DB_PORT = '5432'
        db_url = DB_LIBRARIES + '://' + DB_USER + ':' + DB_PASSWORD + '@' + DB_HOST + ':' + DB_PORT + '/' + DB_NAME

    return db_url

def Generate_DB_Dict():
    database = {}

    if DB_DIALECT == 'POSTGRESQL':
        database = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': DB_NAME,
            'USER': DB_USER,
            'PASSWORD': DB_PASSWORD,
            'HOST' : DB_HOST,
            }
        }

    return database