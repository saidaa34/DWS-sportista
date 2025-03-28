""""
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from fastapi import FastAPI
from database import Base
from sqlalchemy import Table, create_engine, Column, Integer, Float, String, ForeignKey, Boolean, Text, DateTime, Time, DECIMAL, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime



# Define SQLAlchemy models
class Country(Base):
    __tablename__ = "country"
    id_country = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)

    cities = relationship("City", back_populates="country")


class City(Base):
    __tablename__ = "city"
    id_city = Column(Integer, primary_key=True, index=True)
    id_country = Column(Integer, ForeignKey("country.id_country"), nullable=True)
    name = Column(String(50), nullable=False)

    country = relationship("Country", back_populates="cities")
    games = relationship("Game", back_populates="city")


class User(Base):
    __tablename__ = "users"
    id_user = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_position = Column(String(20), nullable=True, default='user')
    email = Column(String(200), nullable=False)
    password = Column(Text, nullable=False)
    name = Column(String(50), nullable=False)
    surname = Column(String(60), nullable=False)
    date_of_birth = Column(String, nullable=False)
    sex = Column(String, nullable=False)
    id_city = Column(Integer, ForeignKey("city.id_city"), nullable=False)
    height = Column(DECIMAL, nullable=True)
    weight = Column(DECIMAL, nullable=True)
    bio = Column(Text)
    profile_photo = Column(LargeBinary, nullable=True)  
    no_of_games = Column(Integer, nullable=True, default=0)
    no_of_reports = Column(Integer, nullable=True, default=0)

    games_and_users = relationship('GamesAndUsers', back_populates='user', cascade='all, delete')
    reservations = relationship("Reservation", back_populates="user_renter")
    ad = relationship("HallAds", back_populates="user")
    comments_received = relationship("Comment", foreign_keys="[Comment.id_user_got_comment]", back_populates="user_got_comment", cascade="all, delete-orphan")
    comments_made = relationship("Comment", foreign_keys="[Comment.id_user_who_commented]", back_populates="user_who_commented", cascade="all, delete-orphan")
    sent_messages = relationship("Chat", foreign_keys="[Chat.id_user_sender]", back_populates="sender")
    received_messages = relationship("Chat", foreign_keys="[Chat.id_user_recipient]", back_populates="recipient")
    notifications = relationship("Notification", foreign_keys="[Notification.to_user]", back_populates="recipient", cascade="all, delete-orphan")
    sent_notifications = relationship("Notification", foreign_keys="[Notification.from_user]", back_populates="sender", cascade="all, delete-orphan")


class Hall(Base):
    __tablename__ = "hall"
    id_hall = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name= Column(Text, nullable=False)
    id_city= Column(Integer, ForeignKey("city.id_city"), nullable=False)
    address= Column(Text, nullable=False)
    start_of_working= Column(Time, nullable=False)
    end_of_working= Column(Time, nullable=False)
    description= Column(Text, nullable=True)
    no_of_players= Column(Integer, nullable=False)
    dimensions_width= Column(DECIMAL, nullable=False)
    dimensions_height= Column(DECIMAL, nullable=False)
    price= Column(DECIMAL, nullable=False)
    ad_added_date= Column(DateTime, nullable=False, default=datetime.now())

    city = relationship("City")  
    photos = relationship("HallAndPhotos")  
    sports_associations = relationship("HallAndSports") 
    
    ads = relationship("HallAds", back_populates="hall")  
 

class HallAndPhotos(Base):
    __tablename__ = "hall_photos"
    id_hall = Column(Integer, ForeignKey("hall.id_hall"))
    photo = Column(LargeBinary, primary_key=True)

    hall = relationship("Hall", back_populates="photos")  

class HallAndSports(Base):
    __tablename__ = "hall_and_sports"
    id_hall = Column(Integer, ForeignKey("hall.id_hall"), primary_key=True)
    id_sport = Column(Integer, ForeignKey("sport.id_sport"), primary_key=True)
    
    hall = relationship("Hall", back_populates="sports_associations")  
    sport = relationship("Sport")  
 
 
class HallAds(Base):  
    __tablename__ = "hall_ads"
    id_ad = Column(Integer, primary_key=True, autoincrement=True, index=True)
    id_hall = Column(Integer, ForeignKey("hall.id_hall"))
    id_user = Column(Integer, ForeignKey("users.id_user"))
    user = relationship("User")  
    hall = relationship("Hall") 
    reservations = relationship("Reservation", back_populates="hall_ad")

class HallReports(Base):
    __tablename__ = "hall_ads_reports"
    id_hall = Column(Integer, ForeignKey("hall.id_hall"), primary_key=True, index=True)
    id_user = Column(Integer, ForeignKey("users.id_user"), primary_key=True, index=True)

class Level(Base):
    __tablename__ = "level"
    id_level = Column(Integer, primary_key=True, index=True)
    level_name = Column(String(50), nullable=False)

    user_sports = relationship("UserSport")

class Sport(Base):
    __tablename__ = "sport"
    id_sport = Column(Integer, primary_key=True, index=True)
    sport_name = Column(String(50), nullable=False)

    users_sports = relationship("UserSport", back_populates="sport")
    games = relationship("Game", back_populates="sport")
    sport = relationship("HallAndSports", back_populates="sport")  
    
class UserSport(Base):
    __tablename__ = "user_and_sport"
    id_user = Column(Integer, ForeignKey("users.id_user"), primary_key=True, index=True)
    id_sport = Column(Integer, ForeignKey("sport.id_sport"), primary_key=True, index=True)
    id_level = Column(Integer, ForeignKey("level.id_level"), nullable=False)

    sport = relationship("Sport", back_populates="users_sports")
    level = relationship("Level")

class UserReports(Base):
    __tablename__ = "user_and_reports"
    id_user_who_is_reported = Column(Integer, ForeignKey("users.id_user"), primary_key=True, index=True)
    id_user_who_reported = Column(Integer, ForeignKey("users.id_user"), primary_key=True, index=True)

class Reservation(Base):
    __tablename__ = 'reservations'

    id_reservation = Column(Integer, primary_key=True, index=True)
    id_hall_ad = Column(Integer, ForeignKey('hall_ads.id_ad', ondelete='CASCADE'), nullable=False)
    id_game = Column(Integer, ForeignKey('game.id_game', ondelete='CASCADE'), nullable=False)
    id_user_renter = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), nullable=False)
    starting_time = Column(DateTime, nullable=False)
    ending_time = Column(DateTime, nullable=False)

    hall_ad = relationship("HallAds", back_populates="reservations")
    game = relationship("Game", back_populates="reservations")
    user_renter = relationship("User", back_populates="reservations")


class Game(Base):
    __tablename__ = 'game'

    id_game = Column(Integer, autoincrement=True, primary_key=True, index=True)
    no_of_players = Column(Integer, nullable=False)
    details = Column(Text)
    id_city = Column(Integer, ForeignKey('city.id_city', ondelete='CASCADE'), nullable=False)
    address = Column(String(200), nullable=False)
    id_sport = Column(Integer, ForeignKey('sport.id_sport', ondelete='CASCADE'), nullable=False)
    game_creator = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), default=None)

    city = relationship("City", back_populates="games")
    sport = relationship("Sport", back_populates="games")
    reservations = relationship("Reservation", back_populates="game")
    ads = relationship('GameAd', back_populates="game")
    users = relationship('GamesAndUsers', back_populates='game', cascade='all, delete')
    games_and_users = relationship('GamesAndUsers', back_populates='game')

class GamesAndUsers(Base):
    __tablename__ = 'games_and_users'
    id_game = Column(Integer, ForeignKey('game.id_game', ondelete='CASCADE'), primary_key=True, nullable=False)
    id_user_player = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), primary_key=True, nullable=False)
    
    game = relationship('Game', back_populates='games_and_users')
    user = relationship('User', back_populates='games_and_users')

class GameAd(Base):
    __tablename__ = 'game_ads'
    id_game_ad = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_game = Column(Integer, ForeignKey('game.id_game', ondelete='CASCADE'), nullable=False)
    
    game = relationship("Game", back_populates="ads")


class Comment(Base):
    __tablename__ = 'user_and_comment'

    id_comment = Column(Integer, autoincrement=True, primary_key=True, index=True)
    id_user_got_comment = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), nullable=False)
    id_user_who_commented = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), nullable=False)
    comment = Column(Text, nullable=False)
    time_of_comment = Column(DateTime, nullable=False, default=datetime.now)

    user_got_comment = relationship("User", foreign_keys=[id_user_got_comment], back_populates="comments_received")
    user_who_commented = relationship("User", foreign_keys=[id_user_who_commented], back_populates="comments_made")

class Stars(Base):
    __tablename__ = 'user_and_stars'

    id_user_got_stars = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), primary_key=True, index=True, nullable=False)
    id_user_who_rated = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), primary_key=True, index=True, nullable=False)
    no_of_stars = Column(Integer, nullable=False)

class EmailSchema(BaseModel):
    email: List[EmailStr]
    subject: str
    body: str
    button_text: str
    button_link: str

class Chat(Base):
    __tablename__ = 'chat'
    id_message = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_user_sender = Column(Integer,  ForeignKey('users.id_user', ondelete='CASCADE'))
    id_user_recipient = Column(Integer,  ForeignKey('users.id_user', ondelete='CASCADE'))
    message = Column(Text, nullable=False)
    sending_time = Column(DateTime, nullable=False, default= datetime.now)
    seen = Column(Boolean, default=False)

    sender = relationship("User", foreign_keys=[id_user_sender], back_populates="sent_messages")
    recipient = relationship("User", foreign_keys=[id_user_recipient], back_populates="received_messages")
        

# SQLAlchemy model for notifications
class Notification(Base):
    __tablename__ = "notifications"
    id_notification = Column(Integer, primary_key=True, index=True, autoincrement=True)
    from_user = Column(Integer, ForeignKey("users.id_user"), nullable=False)
    to_user = Column(Integer, ForeignKey("users.id_user"), nullable=False)
    message = Column(Text, nullable=False)
    seen = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    is_accepted = Column(Boolean, default=None, nullable=True) 
    notification_type = Column(String(50), nullable=False) 

    sender = relationship("User", foreign_keys=[from_user])
    recipient = relationship("User", foreign_keys=[to_user], back_populates="notifications")
"""
from typing import List
from pydantic import BaseModel, EmailStr
from fastapi import FastAPI, Depends, HTTPException
from database import Base
from sqlalchemy import create_engine, Column, Integer, Float, String, ForeignKey, Boolean, Text, DateTime, Time, DECIMAL, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from fastapi import FastAPI
from database import Base
from sqlalchemy import Table, create_engine, Column, Integer, Float, String, ForeignKey, Boolean, Text, DateTime, Time, DECIMAL, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

app = FastAPI()

# Define SQLAlchemy models
class Country(Base):
    __tablename__ = "country"
    id_country = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)

    cities = relationship("City", back_populates="country", cascade="all, delete-orphan")


class City(Base):
    __tablename__ = "city"
    id_city = Column(Integer, primary_key=True, index=True)
    id_country = Column(Integer, ForeignKey("country.id_country", ondelete='CASCADE'), nullable=True)
    name = Column(String(50), nullable=False)

    country = relationship("Country", back_populates="cities")
    games = relationship("Game", back_populates="city", cascade="all, delete-orphan")
    users = relationship("User", back_populates="city", cascade="all, delete-orphan")
    halls = relationship("Hall", back_populates="city", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"
    id_user = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_position = Column(String(20), nullable=True, default='user')
    email = Column(String(200), nullable=False)
    password = Column(Text, nullable=False)
    name = Column(String(50), nullable=False)
    surname = Column(String(60), nullable=False)
    date_of_birth = Column(String, nullable=False)
    sex = Column(String, nullable=False)
    id_city = Column(Integer, ForeignKey("city.id_city", ondelete='CASCADE'), nullable=False)
    height = Column(DECIMAL, nullable=True)
    weight = Column(DECIMAL, nullable=True)
    bio = Column(Text)
    profile_photo = Column(LargeBinary, nullable=True)  
    no_of_games = Column(Integer, nullable=True, default=0)
    no_of_reports = Column(Integer, nullable=True, default=0)

    city = relationship("City", back_populates="users")
    games_and_users = relationship('GamesAndUsers', back_populates='user', cascade='all, delete-orphan')
    reservations = relationship("Reservation", back_populates="user_renter", cascade="all, delete-orphan")
    ads = relationship("HallAds", back_populates="user", cascade="all, delete-orphan")
    comments_received = relationship("Comment", foreign_keys="[Comment.id_user_got_comment]", back_populates="user_got_comment", cascade="all, delete-orphan")
    comments_made = relationship("Comment", foreign_keys="[Comment.id_user_who_commented]", back_populates="user_who_commented", cascade="all, delete-orphan")
    sent_messages = relationship("Chat", foreign_keys="[Chat.id_user_sender]", back_populates="sender", cascade="all, delete-orphan")
    received_messages = relationship("Chat", foreign_keys="[Chat.id_user_recipient]", back_populates="recipient", cascade="all, delete-orphan")
    notifications = relationship("Notification", foreign_keys="[Notification.to_user]", back_populates="recipient", cascade="all, delete-orphan")
    sent_notifications = relationship("Notification", foreign_keys="[Notification.from_user]", back_populates="sender", cascade="all, delete-orphan")
    users_sports = relationship("UserSport", back_populates="user", cascade="all, delete-orphan")


class Hall(Base):
    __tablename__ = "hall"
    id_hall = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(Text, nullable=False)
    id_city = Column(Integer, ForeignKey("city.id_city", ondelete='CASCADE'), nullable=False)
    address = Column(Text, nullable=False)
    start_of_working = Column(Time, nullable=False)
    end_of_working = Column(Time, nullable=False)
    description = Column(Text, nullable=True)
    no_of_players = Column(Integer, nullable=False)
    dimensions_width = Column(DECIMAL, nullable=False)
    dimensions_height = Column(DECIMAL, nullable=False)
    price = Column(DECIMAL, nullable=False)
    ad_added_date = Column(DateTime, nullable=False, default=datetime.now())

    city = relationship("City", back_populates="halls")
    photos = relationship("HallAndPhotos", back_populates="hall", cascade="all, delete-orphan")
    sports_associations = relationship("HallAndSports", back_populates="hall", cascade="all, delete-orphan")
    ads = relationship("HallAds", back_populates="hall", cascade="all, delete-orphan")
    reports = relationship("HallReports", back_populates="hall", cascade="all, delete-orphan")


class HallAndPhotos(Base):
    __tablename__ = "hall_photos"
    id_hall = Column(Integer, ForeignKey("hall.id_hall", ondelete='CASCADE'))
    photo = Column(LargeBinary, primary_key=True)

    hall = relationship("Hall", back_populates="photos")


class HallAndSports(Base):
    __tablename__ = "hall_and_sports"
    id_hall = Column(Integer, ForeignKey("hall.id_hall", ondelete='CASCADE'), primary_key=True)
    id_sport = Column(Integer, ForeignKey("sport.id_sport", ondelete='CASCADE'), primary_key=True)

    hall = relationship("Hall", back_populates="sports_associations")
    sport = relationship("Sport", back_populates="sports_associations")


class HallAds(Base):
    __tablename__ = "hall_ads"
    id_ad = Column(Integer, primary_key=True, autoincrement=True, index=True)
    id_hall = Column(Integer, ForeignKey("hall.id_hall", ondelete='CASCADE'))
    id_user = Column(Integer, ForeignKey("users.id_user", ondelete='CASCADE'))

    user = relationship("User", back_populates="ads")
    hall = relationship("Hall", back_populates="ads")
    reservations = relationship("Reservation", back_populates="hall_ad", cascade="all, delete-orphan")


class HallReports(Base):
    __tablename__ = "hall_ads_reports"
    id_hall = Column(Integer, ForeignKey("hall.id_hall", ondelete='CASCADE'), primary_key=True, index=True)
    id_user = Column(Integer, ForeignKey("users.id_user", ondelete='CASCADE'), primary_key=True, index=True)

    hall = relationship("Hall", back_populates="reports")
    user = relationship("User")


class Level(Base):
    __tablename__ = "level"
    id_level = Column(Integer, primary_key=True, index=True)
    level_name = Column(String(50), nullable=False)

    user_sports = relationship("UserSport", back_populates="level", cascade="all, delete-orphan")


class Sport(Base):
    __tablename__ = "sport"
    id_sport = Column(Integer, primary_key=True, index=True)
    sport_name = Column(String(50), nullable=False)

    users_sports = relationship("UserSport", back_populates="sport", cascade="all, delete-orphan")
    games = relationship("Game", back_populates="sport", cascade="all, delete-orphan")
    sports_associations = relationship("HallAndSports", back_populates="sport", cascade="all, delete-orphan")


class UserSport(Base):
    __tablename__ = "user_and_sport"
    id_user = Column(Integer, ForeignKey("users.id_user", ondelete='CASCADE'), primary_key=True, index=True)
    id_sport = Column(Integer, ForeignKey("sport.id_sport", ondelete='CASCADE'), primary_key=True, index=True)
    id_level = Column(Integer, ForeignKey("level.id_level", ondelete='CASCADE'), nullable=False)

    user = relationship("User", back_populates="users_sports")
    sport = relationship("Sport", back_populates="users_sports")
    level = relationship("Level", back_populates="user_sports")


class UserReports(Base):
    __tablename__ = "user_and_reports"
    id_user_who_is_reported = Column(Integer, ForeignKey("users.id_user", ondelete='CASCADE'), primary_key=True, index=True)
    id_user_who_reported = Column(Integer, ForeignKey("users.id_user", ondelete='CASCADE'), primary_key=True, index=True)


class Reservation(Base):
    __tablename__ = 'reservations'

    id_reservation = Column(Integer, primary_key=True, index=True)
    id_hall_ad = Column(Integer, ForeignKey('hall_ads.id_ad', ondelete='CASCADE'), nullable=False)
    id_game = Column(Integer, ForeignKey('game.id_game', ondelete='CASCADE'), nullable=False)
    id_user_renter = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), nullable=False)
    starting_time = Column(DateTime, nullable=False)
    ending_time = Column(DateTime, nullable=False)

    hall_ad = relationship("HallAds", back_populates="reservations")
    game = relationship("Game", back_populates="reservations")
    user_renter = relationship("User", back_populates="reservations")


class Game(Base):
    __tablename__ = 'game'

    id_game = Column(Integer, autoincrement=True, primary_key=True, index=True)
    no_of_players = Column(Integer, nullable=False)
    details = Column(Text)
    id_city = Column(Integer, ForeignKey('city.id_city', ondelete='CASCADE'), nullable=False)
    address = Column(String(200), nullable=False)
    id_sport = Column(Integer, ForeignKey('sport.id_sport', ondelete='CASCADE'), nullable=False)
    game_creator = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), default=None)

    city = relationship("City", back_populates="games")
    sport = relationship("Sport", back_populates="games")
    reservations = relationship("Reservation", back_populates="game", cascade="all, delete-orphan")
    ads = relationship('GameAd', back_populates="game", cascade="all, delete-orphan")
    users = relationship('GamesAndUsers', back_populates='game', cascade='all, delete-orphan')
    games_and_users = relationship('GamesAndUsers', back_populates='game', cascade='all, delete-orphan')


class GamesAndUsers(Base):
    __tablename__ = 'games_and_users'
    id_game = Column(Integer, ForeignKey('game.id_game', ondelete='CASCADE'), primary_key=True, nullable=False)
    id_user_player = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), primary_key=True, nullable=False)
    
    game = relationship('Game', back_populates='users')
    user = relationship('User', back_populates='games_and_users')


class GameAd(Base):
    __tablename__ = 'game_ads'
    id_game_ad = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_game = Column(Integer, ForeignKey('game.id_game', ondelete='CASCADE'), nullable=False)
    
    game = relationship("Game", back_populates="ads")


class Comment(Base):
    __tablename__ = 'user_and_comment'

    id_comment = Column(Integer, autoincrement=True, primary_key=True, index=True)
    id_user_got_comment = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), nullable=False)
    id_user_who_commented = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), nullable=False)
    comment = Column(Text, nullable=False)
    time_of_comment = Column(DateTime, nullable=False, default=datetime.now)

    user_got_comment = relationship("User", foreign_keys=[id_user_got_comment], back_populates="comments_received")
    user_who_commented = relationship("User", foreign_keys=[id_user_who_commented], back_populates="comments_made")


class Stars(Base):
    __tablename__ = 'user_and_stars'

    id_user_got_stars = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), primary_key=True, index=True, nullable=False)
    id_user_who_rated = Column(Integer, ForeignKey('users.id_user', ondelete='CASCADE'), primary_key=True, index=True, nullable=False)
    no_of_stars = Column(Integer, nullable=False)


class Chat(Base):
    __tablename__ = 'chat'
    id_message = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_user_sender = Column(Integer,  ForeignKey('users.id_user', ondelete='CASCADE'))
    id_user_recipient = Column(Integer,  ForeignKey('users.id_user', ondelete='CASCADE'))
    message = Column(Text, nullable=False)
    sending_time = Column(DateTime, nullable=False, default=datetime.now)
    seen = Column(Boolean, default=False)

    sender = relationship("User", foreign_keys=[id_user_sender], back_populates="sent_messages")
    recipient = relationship("User", foreign_keys=[id_user_recipient], back_populates="received_messages")


class Notification(Base):
    __tablename__ = "notifications"
    id_notification = Column(Integer, primary_key=True, index=True, autoincrement=True)
    from_user = Column(Integer, ForeignKey("users.id_user", ondelete='CASCADE'), nullable=False)
    to_user = Column(Integer, ForeignKey("users.id_user", ondelete='CASCADE'), nullable=False)
    message = Column(Text, nullable=False)
    seen = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    is_accepted = Column(Boolean, default=None, nullable=True) 
    notification_type = Column(String(50), nullable=False) 

    sender = relationship("User", foreign_keys=[from_user], back_populates="sent_notifications")
    recipient = relationship("User", foreign_keys=[to_user], back_populates="notifications")



class EmailSchema(BaseModel):
    email: List[EmailStr]
    subject: str
    body: str
    button_text: str
    button_link: str

