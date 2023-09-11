import sqlalchemy, sqlalchemy.orm
from sqlalchemy import *
from db_url import Generate_DB_URl
from sqlalchemy import *
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import os
import shutil
from dotenv import load_dotenv

load_dotenv()

DB_MULTI_SCHEMA = str(os.environ.get('DB_MULTI_SCHEMA'))
DB_SCHEMA = str(os.environ.get('DB_SCHEMA'))
DB_MIGRATION = str(os.environ.get('DB_MIGRATION'))

if DB_MULTI_SCHEMA == 'True':
    Base = declarative_base(metadata=MetaData(schema=DB_SCHEMA))
    alembic_table_name = 'alembic_'+DB_SCHEMA+'_migrations'
else:
    Base = declarative_base()
    alembic_table_name = 'alembic_migrations'

SQLALCHEMY_HOST = Generate_DB_URl()

class Alembic(Base):
    __tablename__ = alembic_table_name
    version_num = Column(String(32), primary_key=True)

    def __repr__(self):
        return "<User(version_num='{}')>"\
                .format(self.version_num)

if DB_MIGRATION == 'ON':
    engine = sqlalchemy.create_engine(SQLALCHEMY_HOST, pool_recycle=3600)
    Base.metadata.drop_all(bind=engine, tables=[Alembic.__table__])
    engine.dispose()

    os.system("rm -r migrations/versions")
    os.system("mkdir migrations/versions")

    os.system("alembic stamp head")
    os.system("alembic revision --autogenerate -m 'migration file'")
    os.system("alembic upgrade head")