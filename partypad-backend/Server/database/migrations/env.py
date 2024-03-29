from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import sys, os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import models
# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel

from db_url import Generate_DB_URl
# url = config.get_main_option("sqlalchemy.url")
url = Generate_DB_URl()

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config
config.set_main_option('sqlalchemy.url', url)
# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)

# target_metadata = mymodel.Base.metadata
target_metadata = models.Base.metadata
app_name = str(os.environ.get('DB_SCHEMA'))
# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.
def include_object(object, name, type_, reflected, compare_to):
    if type_ == 'table' and (object.schema != app_name):
        return False

    return True

def run_migrations_offline():
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        # connect_args={'options': f'-csearch_path={app_name}'}
    )

    with connectable.connect() as connection:
        multi_schema = os.environ.get('DB_MULTI_SCHEMA') or cnfg('DB_MULTI_SCHEMA')
        if multi_schema == 'True':
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                include_schemas=True,
                include_object=include_object,
                version_table_schema=app_name,
                version_table="alembic_"+app_name+"_migrations",
            )
        else:
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                version_table="alembic_migrations",
            )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
