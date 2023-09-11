import sys, os
import pandas as pd
import sqlalchemy, sqlalchemy.orm
from sqlalchemy import *
from sqlalchemy import *
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from models import *
from db_url import Generate_DB_URl

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

def populate():

    populated_list = []

    #establish database connection
    engine = sqlalchemy.create_engine(SQLALCHEMY_HOST,poolclass=sqlalchemy.pool.NullPool)
    session = sqlalchemy.orm.sessionmaker(bind=engine, autoflush=False)()

    try:

        filenames = ["venue_types.csv", "venues.csv"]

        for file in filenames:

            if ("venue" in file) and ("type" in file) and False:
                df = pd.read_csv(file)
                added = 0
                for (v_type, v_desc) in zip(df["venueType"], df["venueTypeDesc"]):
                    try:
                        venue_type_object = Venue_Type(
                            venue_type_name = v_type,
                            venue_type_desc = v_desc,
                        )
                        session.add(venue_type_object)
                        session.commit()
                        added += 1
                    except:
                        print("Coudlnt add VENUE TYPE: "+v_type+"\n")

                if added > 0:
                    populated_list.append("Venue Types")

            #name,description,creationDate,modifiedDate,size,type,peopleCount,price,line1,line2,city,state,zip
            elif ("venues" in file) and True:
                df = pd.read_csv(file)
                added = 0

                for (v_user, v_name, v_desc, v_cd, v_md, v_size, v_type, v_pc, v_price, v_l1, v_l2, v_city, v_state, v_zip ) in zip(df["user"], df["name"], df["description"], df["creationDate"], df["modifiedDate"], df["size"], df["type"], df["peopleCount"], df["price"], df["line1"], df["line2"], df["city"], df["state"], df["zip"]):
                    try:
                        venue_object = Venue(
                            user_id = v_user,
                            venue_name = v_name,
                            venue_description = v_desc,
                            venue_creation_date = v_cd,
                            venue_modified_date = v_md,
                            venue_size = v_size,
                            venue_type = v_type,
                            venue_people_count = v_pc,
                            venue_price = v_price
                        )
                        session.add(venue_object)
                        session.commit()

                        added_venue = session.query(Venue).filter(
                            Venue.venue_name == v_name
                        ).first()

                        venue_addr_object = Venue_Address(
                            venue_id = added_venue.venue_id,
                            venue_addr_line1 = v_l1,
                            venue_addr_line2 = v_l2,
                            venue_addr_city = v_city,
                            venue_addr_state = v_state,
                            venue_addr_zip = v_zip
                        )
                        session.add(venue_addr_object)
                        session.commit()

                        added += 1
                    except Exception as ex:
                        print("Coudlnt add VENUE NAME: "+v_name+"\n")
                        print(ex)

                if added > 0:
                    populated_list.append("Venues")

    except:
        #in case of errors, rollback database changes
        session.rollback()
        raise

    finally:
        #close database connection
        session.close()
        engine.dispose()

    print(populated_list)

populate()
