from enum import unique
from sqlalchemy import *
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, column_property
import os
from dotenv import load_dotenv
import datetime
import json

load_dotenv()

DB_MULTI_SCHEMA = str(os.environ.get('DB_MULTI_SCHEMA'))
DB_SCHEMA = str(os.environ.get('DB_SCHEMA'))
DB_DIALECT = str(os.environ.get('DB_DIALECT'))

if DB_DIALECT == 'POSTGRESQL':
    from sqlalchemy.dialects.postgresql import JSON
    dict_type = JSON

if DB_MULTI_SCHEMA == 'True':
    Base = declarative_base(metadata=MetaData(schema=DB_SCHEMA))
else:
    Base = declarative_base()

from sqlalchemy.ext.declarative import DeclarativeMeta

class AlchemyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj.__class__, DeclarativeMeta):
            dict = {}

            # Remove invalid fields and just get the column attributes
            columns = [x for x in dir(obj) if not x.startswith("_") and x != "metadata" and not x.startswith("r_") and not x == "registry"]

            for column in columns:
                value = obj.__getattribute__(column)

                try:
                    json.dumps(value)
                    dict[column] = value
                except TypeError:
                    if isinstance(value, datetime.datetime):
                        dict[column] = value.isoformat()
                    elif isinstance(value, datetime.date):
                        dict[column] = value.isoformat()
                    else:
                        dict[column] = None
            return dict

        return json.JSONEncoder.default(self, obj)

class User(Base):
    __tablename__ = 'user'
    user_id = Column(Integer(), primary_key=True, autoincrement=True)
    user_email = Column(String(500), unique=True)
    user_password = Column(String(300))
    user_login_type = Column(String(10))
    user_fname = Column(String(100))
    user_lname = Column(String(100))
    user_fullname = column_property(user_fname + " " + user_lname)
    user_member_flag = Column(BOOLEAN)
    user_owner_flag = Column(BOOLEAN)
    user_creation_date = Column(DateTime(timezone=True))

    r_temp_key = relationship("Temporary_Key", back_populates='r_user', cascade="all, delete, delete-orphan")
    r_venue = relationship("Venue", back_populates='r_user', cascade="all, delete, delete-orphan")
    r_profile = relationship("Profile", back_populates='r_user', cascade="all, delete, delete-orphan")
    r_booking = relationship("Booking", back_populates='r_user', cascade="all, delete, delete-orphan")
    r_bookmark = relationship("Bookmark", back_populates='r_user', cascade="all, delete, delete-orphan")

    def __repr__(self):
        return "<User(user_id='{}', user_email='{}', user_password='{}', user_login_type'{}', user_fname'{}', user_lname'{}', user_member_flag'{}', user_owner_flag'{}', user_creation_date'{}')>"\
                .format(self.user_id, self.user_email, self.user_password, self.user_login_type, self.user_fname, self.user_lname, self.user_member_flag, self.user_owner_flag, self.user_creation_date)

class Profile(Base): 
    __tablename__ = 'profile'
    profile_id = Column(Integer(), primary_key=True, autoincrement=True)
    user_id = Column(Integer(), ForeignKey('user.user_id'))
    profile_dob = Column(Date())
    profile_gender = Column(String(50))
    profile_rating = Column(Float())
    profile_addr_line1 = Column(String(500))
    profile_addr_line2 = Column(String(500))
    profile_addr_city = Column(String(100))
    profile_addr_state = Column(String(20))
    profile_addr_zip = Column(String(20))
    profile_phone = Column(String(20))
    profile_bio = Column(String(1000))
    profile_image = Column(JSON)
    
    r_user = relationship("User", back_populates='r_profile')

    def __repr__(self):
        return "<Profile(user_id='{}', profile_id='{}',profile_email='{}', profile_dob='{}', profile_gender'{}', profile_rating'{}', profile_addr_line1 '{}', profile_addr_line2 '{}', profile_addr_city'{}', profile_addr_state'{}', profile_addr_zip'{}', profile_phone'{}', profile_bio'{}', profile_image'{}')>"\
                .format(self.user_id, self.profile_id, self.profile_email, self.profile_dob, self.profile_gender, self.profile_rating, self.profile_addr_line1 , self.profile_addr_line2 , self.profile_addr_city, self.profile_addr_state, self.profile_addr_zip, self.profile_phone, self.profile_bio, self.profile_image)

class Temporary_Key(Base):
    __tablename__ = 'temporary_key'
    user_id = Column(Integer(), ForeignKey('user.user_id'))
    temp_key_id = Column(Integer(), primary_key=True, autoincrement=True)
    temp_key_value = Column(String(6))
    temp_key_timestamp = Column(DateTime(timezone=True))

    r_user = relationship("User", back_populates='r_temp_key')

    def __repr__(self):
        return "<Temporary_Key(user_id='{}', temp_key_id='{}', temp_key_value='{}', temp_key_timestamp='{}')>"\
                .format(self.user_id, self.temp_key_id, self.temp_key_value, self.temp_key_timestamp)

class Venue_Type(Base):
    __tablename__ = 'venue_type'
    venue_type_id = Column(Integer(), primary_key=True, autoincrement=True)
    venue_type_name = Column(String(50), unique=True)
    venue_type_desc = Column(String(1000))

    r_venue = relationship("Venue", back_populates='r_venue_type', cascade="all, delete, delete-orphan")

    def __repr__(self):
        return "<Venue_Type(venue_type_id='{}', venue_type_name='{}', venue_type_desc='{}')>"\
                .format(self.venue_type_id, self.venue_type_name, self.venue_type_desc)

class Venue(Base):
    __tablename__ = 'venue'
    user_id = Column(Integer(), ForeignKey('user.user_id'))
    venue_id = Column(Integer(), primary_key=True, autoincrement=True)
    venue_name = Column(String(500))
    venue_description = Column(String(3000))
    venue_creation_date = Column(DateTime(timezone=True))
    venue_modified_date = Column(DateTime(timezone=True))
    venue_size = Column(Float())
    venue_type = Column(String(50), ForeignKey('venue_type.venue_type_name'))
    venue_people_count = Column(Integer())
    venue_price = Column(Float())
    venue_image = Column(JSON)

    r_venue_address = relationship("Venue_Address", back_populates='r_venue', cascade="all, delete, delete-orphan")
    r_booking = relationship("Booking", back_populates='r_venue', cascade="all, delete, delete-orphan")
    r_bookmark = relationship("Bookmark", back_populates='r_venue', cascade="all, delete, delete-orphan")

    r_user = relationship("User", back_populates='r_venue')
    r_venue_type = relationship("Venue_Type", back_populates='r_venue')

    def __repr__(self):
        return "<Venue(user_id='{}', venue_id='{}', venue_name='{}', venue_description='{}', venue_creation_date='{}', venue_modified_date='{}', venue_size='{}', venue_type='{}',  venue_people_count='{}', venue_price='{}', venue_image='{}')>"\
                .format(self.user_id, self.venue_id, self.venue_name, self.venue_description, self.venue_creation_date, self.venue_modified_date, self.venue_size, self.venue_type,  self.venue_people_count, self.venue_price, self.venue_image)

class Venue_Address(Base):
    __tablename__ = 'venue_address'
    venue_id = Column(Integer(), ForeignKey('venue.venue_id'))
    venue_addr_id = Column(Integer(), primary_key=True, autoincrement=True)
    venue_addr_line1 = Column(String(500))
    venue_addr_line2 = Column(String(500))
    venue_addr_city = Column(String(100))
    venue_addr_state = Column(String(20))
    venue_addr_zip = Column(String(20))

    r_venue = relationship("Venue", back_populates='r_venue_address')

    def __repr__(self):
        return "<Venue_Address(venue_id='{}', venue_addr_id='{}', venue_addr_line1='{}', venue_addr_line2='{}', venue_addr_city='{}', venue_addr_state='{}', venue_addr_zip='{}')>"\
                .format(self.venue_id, self.venue_addr_id, self.venue_addr_line1, self.venue_addr_line2, self.venue_addr_city, self.venue_addr_state, self.venue_addr_zip)

class Bookmark(Base):
    __tablename__ = 'bookmark'
    venue_id = Column(Integer(), ForeignKey('venue.venue_id'))
    user_id = Column(Integer(), ForeignKey('user.user_id'))
    bookmark_id = Column(Integer(), primary_key=True, autoincrement=True)

    r_venue = relationship("Venue", back_populates='r_bookmark')
    r_user = relationship("User", back_populates='r_bookmark')

    def __repr__(self):
        return "<Bookmark(venue_id='{}', user_id='{}', bookmark_id='{}')>"\
                .format(self.venue_id, self.user_id, self.bookmark_id)

class Booking(Base):
    __tablename__ = 'booking'
    venue_id = Column(Integer(), ForeignKey('venue.venue_id'))
    user_id = Column(Integer(), ForeignKey('user.user_id'))
    booking_id = Column(String(10), primary_key=True)
    booking_start_date = Column(Date())
    booking_end_date = Column(Date())

    r_booking_date = relationship("Booking_Date", back_populates='r_booking', cascade="all, delete, delete-orphan")

    r_venue = relationship("Venue", back_populates='r_booking')
    r_user = relationship("User", back_populates='r_booking')

    def __repr__(self):
        return "<Booking(venue_id='{}', user_id='{}', booking_id='{}', booking_start_date='{}', booking_end_date='{}')>"\
                .format(self.venue_id, self.user_id, self.booking_id, self.booking_start_date, self.booking_end_date)

class Booking_Date(Base):
    __tablename__ = 'booking_date'
    booking_id = Column(String(10), ForeignKey('booking.booking_id'))
    booking_date_id = Column(Integer(), primary_key=True, autoincrement=True)
    booking_date_date = Column(Date())

    r_booking = relationship("Booking", back_populates='r_booking_date')

    def __repr__(self):
        return "<Booking_Date(booking_id='{}', booking_date_id='{}', booking_date_date='{}')>"\
                .format(self.booking_id, self.booking_date_id, self.booking_date_date)

class Message(Base):
    __tablename__ = 'message'
    message_id = Column(Integer(), primary_key=True, autoincrement=True)
    message_sender_id = Column(Integer(), ForeignKey('user.user_id'))
    message_receiver_id = Column(Integer(), ForeignKey('user.user_id'))
    message_content = Column(String(5000))
    message_timestamp = Column(DateTime(timezone=True))
    message_delivered = Column(BOOLEAN)

    r_user_sender = relationship("User", foreign_keys=[message_sender_id])
    r_user_receiver = relationship("User", foreign_keys=[message_receiver_id])

    def __repr__(self):
        return "<Message(message_id='{}', message_sender_id='{}', message_receiver_id='{}', message_content='{}', message_timestamp='{}', message_delivered='{}')>"\
                .format(self.message_id, self.message_sender_id, self.message_receiver_id, self.message_content, self.message_timestamp, self.message_delivered)