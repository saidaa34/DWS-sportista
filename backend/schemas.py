from datetime import datetime, time
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import UploadFile

class CountryBase(BaseModel):
    name: str


class CountryCreate(CountryBase):
    pass


class Country(CountryBase):
    id_country: int

    class Config:
        from_attributes = True


class CityBase(BaseModel):
    id_city: int
    name: str
    id_country: Optional[int]  # Promijenjeno u Optional jer je ForeignKey nullable

class CityCreate(CityBase):
    pass

class City(CityBase):
    id_city: int
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    id_user: Optional[int] = None
    user_position: str
    email: str
    password: Optional[str] = None  # Postavljamo polje password kao opcionalno
    selectedSports: Optional[List[dict]] = None  # Postavljamo polje password kao opcionalno
    name: str
    surname: str
    date_of_birth: str
    sex: str
    id_city: int
    height: float
    weight: float
    bio: str 
    profile_photo: bytes
    no_of_games: int 
    no_of_reports: int 

    class Config:
        from_attributes = True

class LevelSport(BaseModel):
    id_level: int
    id_sport: int

class UserBaseRegister(BaseModel):
    id_user: Optional[int] = None
    user_position: str
    email: str
    password: Optional[str] = None  # Postavljamo polje password kao opcionalno
    selectedSports: Optional[List[LevelSport]] = None  # Postavljamo polje password kao opcionalno
    name: str
    surname: str
    date_of_birth: str
    sex: str
    id_city: int
    height: float
    weight: float
    bio: str 
    profile_photo: bytes
    no_of_games: int 
    no_of_reports: int
    
    class Config:
        model_validate = True
        from_attributes = True  # Postavite ovo kako biste omogućili from_orm

    

class UserBaseLogin(BaseModel):
    email: str
    password: str

class TokenSchema(BaseModel):
    mess: str
    status: int
    access_token: str
    refresh_token:str

class Token(BaseModel):
    access_token: str
    token_type: str
    
class  userLogged(BaseModel):
    mess: str
    status: int
    user: Optional[Token] = None

class LevelBase(BaseModel):
    level_name: str

class SportBase(BaseModel):
    id_sport: int
    sport_name: str

class UserAndSportBase(BaseModel):
    id_user: int
    id_sport: int
    id_level: int
class CreateHallRequest(BaseModel):
    name: str
    id_city: int
    address: str
    start_of_working: time = Field(default= datetime.now().time().strftime("%H:%M:%S"))
    end_of_working: time = Field(default= datetime.now().time().strftime("%H:%M:%S"))
    description: str
    no_of_players: int
    dimensions_width: int
    dimensions_height: int
    price: float

class CreateHallAndPhotoRequest(BaseModel):
    id_hall: int
    photo: bytes

class CreateteHallAndSportsRequest(BaseModel):
    id_hall: int
    id_sport: int

class CreateHallAdRequest(BaseModel):
    id_hall: int
    user_email: str # email of

class CreateHallAdAllDataRequest(BaseModel):  # for adding hall ads 
    hall: CreateHallRequest
    photos: List[bytes]
    sports: List[int]
    user_email: str # email of logged user

class UserBase2(BaseModel):
    user_position: str = "user"
    email: str
    password: Optional[str] = None  # Postavljamo polje password kao opcionalno
    name: str
    surname: str
    date_of_birth: str
    sex: str
    id_city: int
    height: float
    weight: float
    bio: str 
    profile_photo: bytes
    no_of_games: int 
    no_of_reports: int 

class EditUserRequest(BaseModel):
    email: str
    name: str
    surname: str
    password: Optional[str] = None
    date_of_birth: str
    sex: str
    id_city: int
    height: float
    weight: float
    bio: str
    profile_photo: bytes

 
class Reservation(BaseModel):
    id_user_renter: int
    starting_time: datetime
    ending_time: datetime


class Game(BaseModel):
    no_of_players: int
    details: str
    id_city: int
    address: str
    id_sport: int
    objavi_igru: bool
    players: List[int]

class CreateReservation(BaseModel):
    reservation: Reservation
    game: Game

class CommentCreate(BaseModel):
    comment: str
    id_user_got_comment: int
    id_user_who_commented: int

class StarRatingCreate(BaseModel):
    id_user_got_stars: int
    id_user_who_rated: int
    no_of_stars: int


class Chat(BaseModel):
    id_user_sender: int
    id_user_recipient: int
    message: str

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    from_user: int
    to_user: int
    message: str
    seen: Optional[bool] = False
    is_accepted: Optional[bool] = None
    notification_type: str

class NotificationUpdate(BaseModel):
    seen: Optional[bool]
    is_accepted: Optional[bool]
    notification_type: Optional[str]
