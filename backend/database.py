from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import databases
import sqlalchemy
from sqlalchemy.dialects.postgresql import dialect

DATABASE_URL = "postgresql://avnadmin:AVNS_RsM5owGNqy4CFRgT6kI@pg-36d099d8-adn-4698.d.aivencloud.com:22961/defaultdb?sslmode=require"

engine = create_engine(DATABASE_URL)

database = databases.Database(DATABASE_URL)

metadata = sqlalchemy.MetaData()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

