from decouple import config
from datetime import date, datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel
from database import Base, SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from models import Notification, Chat ,Comment, Game, GameAd, GamesAndUsers, GameAd, HallAds, HallAndSports, Level, Reservation, Stars, User, City, Hall, Sport, HallAndPhotos, Sport, UserReports, UserSport, HallReports
import schemas
from schemas import CommentCreate, CreateHallAdAllDataRequest
import bcrypt
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from passlib.context import CryptContext
from starlette.middleware.cors import CORSMiddleware
import base64
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import JSONResponse
from sqlalchemy.orm import joinedload
from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends
from typing import List, Dict
from models import Hall, Sport, City, EmailSchema
from pathlib import Path
from jinja2 import Template
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import logging
import json
from sockets import sio_app
from dependencies import get_db
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

conf = ConnectionConfig( # Configuration for FastMail (from .env file)
    MAIL_USERNAME=config("MAIL_USERNAME"),
    MAIL_PASSWORD=config("MAIL_PASSWORD"),
    MAIL_FROM=config("MAIL_FROM"),
    MAIL_PORT=config("MAIL_PORT", cast=int),
    MAIL_SERVER=config("MAIL_SERVER"),
    MAIL_STARTTLS=config("MAIL_STARTTLS", cast=bool),
    MAIL_SSL_TLS=config("MAIL_SSL_TLS", cast=bool),
    USE_CREDENTIALS=config("USE_CREDENTIALS", cast=bool),
    VALIDATE_CERTS=config("VALIDATE_CERTS", cast=bool),
    TEMPLATE_FOLDER=Path(__file__).parent / './email_templates'
)
"""
def start_application():
    app = FastAPI()
    origins = ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )
    return app
"""
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()
origins = [
    "http://localhost:3000",
    "https://medic-web-sigma.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def read_root():
    get_db()
    return "Dobro dosli"

def bytea_to_base64(bytea_data):
    return base64.b64encode(bytea_data).decode('utf-8')

@app.get('/cities/all') # returns all cities from database
def get_all_cities(db: Session = Depends(get_db)):
    cities = db.query(City).all()
    if cities is None:
        raise HTTPException(status_code=404, detail="Nema gradova")
    else: return cities

@app.get('/sports/all') # returns all sports from database
def get_all_sports(db: Session = Depends(get_db)):
    sports = db.query(Sport).all()
    if sports is None:
        raise HTTPException(status_code=404, detail="Nema sportova")
    else: return sports


@app.post('/hall/add-all') # adds new hall, new hall ad, hall photos and hall sports
def add_hall_all(request: CreateHallAdAllDataRequest , db: Session = Depends(get_db)):

    id_user = db.query(User.id_user).filter(User.email == request.user_email).first()

    new_hall = Hall(
        name=request.hall.name,
        id_city=request.hall.id_city,
        address=request.hall.address,
        start_of_working=request.hall.start_of_working,
        end_of_working=request.hall.end_of_working,
        description=request.hall.description,
        no_of_players=request.hall.no_of_players,
        dimensions_width=request.hall.dimensions_width,
        dimensions_height=request.hall.dimensions_height,
        price = request.hall.price
    )
    db.add(new_hall)
    db.flush()
    db.refresh(new_hall)

    new_ad = HallAds(
        id_hall=new_hall.id_hall,
        id_user=id_user[0]
    )
    db.add(new_ad)
    db.flush()
    db.refresh(new_ad)

    for photo in request.photos:
        new_photo = HallAndPhotos(
            id_hall=new_hall.id_hall,
            photo=photo
        )
        db.add(new_photo)
        db.flush()
        db.refresh(new_photo)

    for sport in request.sports:
        new_sport = HallAndSports(
            id_hall=new_hall.id_hall,
            id_sport=sport
        )
        db.add(new_sport)
        db.flush()
        db.refresh(new_sport)
    
    db.commit()

    return {"id_hall": new_hall.id_hall}

@app.get('/users/{user_id}', response_model=schemas.UserBase)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id_user == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    date_of_birth_str = user.date_of_birth.strftime("%Y-%m-%d")
    user_dict = {
        'user_position': user.user_position,
        'email': user.email,
        'name': user.name,
        'surname': user.surname,
        'date_of_birth': date_of_birth_str,
        'sex': user.sex,
        'id_city': user.id_city,
        'height': user.height,
        'weight': user.weight,
        'bio': user.bio,
        'profile_photo': user.profile_photo,
        'no_of_games': user.no_of_games,
        'no_of_reports': user.no_of_reports
    }
    return user_dict

@app.get('/user_sports', response_model=List[schemas.UserAndSportBase])
def get_cities(db: Session = Depends(get_db)):
    cities = db.query(UserSport).all()
    return cities

@app.get('/city', response_model=List[schemas.CityBase])
def get_cities(db: Session = Depends(get_db)):
    cities = db.query(City).order_by(City.name).all()
    return cities

@app.get('/sports', response_model=List[schemas.SportBase])
def get_sports(db: Session = Depends(get_db)):
    sports = db.query(Sport).order_by(Sport.sport_name).all()
    return sports

@app.get('/levels')
def get_levels(db: Session = Depends(get_db)):
    levels = db.query(Level).all()
    return levels


@app.get('/users', response_model=List[schemas.UserBase])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    users_serialized = []
    for user in users:
        date_of_birth_str = user.date_of_birth.strftime("%Y-%m-%d")
        base64_string = bytea_to_base64(user.profile_photo)
        user_dict = user.__dict__
        user_dict['date_of_birth'] = date_of_birth_str
        user_dict['profile_photo'] = base64_string
        users_serialized.append(user_dict)
    return users_serialized


@app.post('/register')
async def register(data:schemas.UserBaseRegister, db: Session = Depends(get_db)):
    print("register data",data)
    hashed_pass = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt())

    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        return {"mess":"Email already registred", "status": 409}
    
    new_user = User(
    user_position = data.user_position,
    email = data.email,
    password = hashed_pass.decode('utf-8'),
    name = data.name,
    surname = data.surname,
    date_of_birth = data.date_of_birth,
    sex = data.sex,
    id_city = data.id_city,
    height = data.height,
    weight = data.weight,
    bio = data.bio,
    profile_photo =data.profile_photo,
    no_of_games = data.no_of_games,
    no_of_reports = data.no_of_reports
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    for sport in data.selectedSports:
        user_sport = UserSport(id_sport=sport.id_sport, id_user=new_user.id_user, id_level=sport.id_level)
        db.add(user_sport)
    db.commit()
    
    date_of_birth_str = new_user.date_of_birth.strftime("%Y-%m-%d")
    user = new_user.__dict__
    user["date_of_birth"] = date_of_birth_str
    
    token = await utils.create_token(user)



    return {"status": 200, "token": token.access_token}



import utils 

@app.post('/api/token')
async def generate_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username "
        )

    if not pwd_context.verify(form_data.password.encode("UTF-8"), user.password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )
    
    users_serialized = []
    date_of_birth_str = user.date_of_birth.strftime("%Y-%m-%d")
    
    encoded_image_str = base64.b64encode(user.profile_photo).decode('utf-8')

    user_dict = user.__dict__
    user_dict['date_of_birth'] = date_of_birth_str
    user_dict['profile_photo'] = encoded_image_str
    users_serialized.append(user_dict)
    return await utils.create_token(users_serialized[0])

@app.get('/api/user/me', response_model=schemas.UserBase)
def read_current_user(user: schemas.UserBase = Depends(utils.get_current_user_2)):
    date_of_birth_str = user.date_of_birth.strftime("%Y-%m-%d")
    user_dict = user.__dict__
    user_dict['date_of_birth'] = date_of_birth_str

    return user_dict

@app.get('/users2/{user_id}', response_model=schemas.UserBase2)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id_user == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    date_of_birth_str = user.date_of_birth.strftime("%Y-%m-%d")
    base64_string = bytea_to_base64(user.profile_photo)
    user_dict = {
        'user_position': user.user_position,
        'email': user.email,
        'name': user.name,
        'surname': user.surname,
        'date_of_birth': date_of_birth_str,
        'sex': user.sex,
        'id_city': user.id_city,
        'height': user.height,
        'weight': user.weight,
        'bio': user.bio,
        'profile_photo': base64_string,
        'no_of_games': user.no_of_games,
        'no_of_reports': user.no_of_reports
    }
    return user_dict

@app.get('/city/{city_id}', response_model=schemas.CityBase)
def get_city(city_id: str, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id_city == city_id).first()
    if city is None:
        raise HTTPException(status_code=404, detail="Grad nije pronađen")
    return city

@app.get('/all-users')
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    if users is None:
        raise HTTPException(status_code=404, detail="Korisnici nisu pronađeni")
    
    users_serialized = []
    for user in users:
        date_of_birth_str = user.date_of_birth.strftime("%Y-%m-%d")
        base64_string = bytea_to_base64(user.profile_photo)
        user_dict = {
            'user_position': user.user_position,
            'email': user.email,
            'name': user.name,
            'surname': user.surname,
            'date_of_birth': date_of_birth_str,
            'sex': user.sex,
            'id_city': user.id_city,
            'height': user.height,
            'weight': user.weight,
            'bio': user.bio,
            'profile_photo': base64_string,
            'no_of_games': user.no_of_games,
            'no_of_reports': user.no_of_reports
        }
        users_serialized.append(user_dict)
    
    return users_serialized

@app.get('/all-reported-users')
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.no_of_reports > 0).all()
    if users is None:
        raise HTTPException(status_code=404, detail="Korisnici nisu pronađeni")
    
    users_serialized = []
    for user in users:
        date_of_birth_str = user.date_of_birth.strftime("%Y-%m-%d")
        base64_string = bytea_to_base64(user.profile_photo)
        user_dict = {
            'id_user': user.id_user,
            'user_position': user.user_position,
            'email': user.email,
            'name': user.name,
            'surname': user.surname,
            'date_of_birth': date_of_birth_str,
            'sex': user.sex,
            'id_city': user.id_city,
            'height': user.height,
            'weight': user.weight,
            'bio': user.bio,
            'profile_photo': base64_string,
            'no_of_games': user.no_of_games,
            'no_of_reports': user.no_of_reports
        }
        users_serialized.append(user_dict)
    
    return users_serialized

@app.get('/all-city-names')
def get_all_city_names(db: Session = Depends(get_db)):
    cities = db.query(City).all()

    if cities is None:
        raise HTTPException(status_code=404, detail="Gradovi nisu pronađeni")
    city_names = []
    for city in cities:
        city_names.append(city.name)

    return city_names

@app.post('/user-reports/{user_who_reported}/{user_who_is_reported}')
def user_reports(user_who_reported: int, user_who_is_reported: int, db: Session = Depends(get_db)):
    rez = db.query(UserReports).filter(
        UserReports.id_user_who_reported == user_who_reported,
        UserReports.id_user_who_is_reported == user_who_is_reported
    ).first()
    if rez is None:
        new_report = UserReports(
            id_user_who_is_reported=user_who_is_reported,
            id_user_who_reported=user_who_reported
        )
        db.add(new_report)
        db.commit()
        return {"status": 200, "message": "User reported successfully"}
    else:
        return {"status": 409, "message": "User already reported"}

@app.post('/report_user/{user_id}')
def report_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id_user == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    user.no_of_reports += 1
    db.commit()
    return

@app.get('/user_and_sport/{user_id}')
def get_user_and_sport(user_id: str, db: Session = Depends(get_db)):
    lista = db.query(UserSport).filter(UserSport.id_user == user_id).all()
    if not lista:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    return lista

@app.get('/sports/{sport_id}') 
def get_sport(sport_id: str, db: Session = Depends(get_db)):
    sport = db.query(Sport).filter(Sport.id_sport == sport_id).first()
    if sport is None:
        raise HTTPException(status_code=404, detail="Nema sportova")
    return sport

@app.get("/user-sport/{user_id}")
async def get_user_sport(user_id: int, db: Session = Depends(get_db)):
    
    user_sports = db.query(UserSport).options(joinedload(UserSport.sport), joinedload(UserSport.level)).filter(UserSport.id_user == user_id).all()

    if not user_sports:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_sports_response = []
    for user_sport in user_sports:
        user_sports_response.append({
            "sport_name": user_sport.sport.sport_name,
            "level_name": user_sport.level.level_name
        })

    return user_sports_response

@app.get("/user-sport-level/{user_id}")
async def get_user_sport(user_id: int, db: Session = Depends(get_db)):
    
    user_sports_level = db.query(UserSport).options(joinedload(UserSport.level), joinedload(UserSport.sport)).filter(UserSport.id_user == user_id).all()
    
    user_sports_response = []
    for user_sport in user_sports_level:
        user_sports_response.append({
            "id_sport": user_sport.id_sport,
            "id_level": user_sport.id_level,
            "sport_name": user_sport.sport.sport_name,
            "level_name": user_sport.level.level_name
        })

    return user_sports_response


@app.get('/get_hall/{id_hall}') 
def get_hall(id_hall: int, db: Session = Depends(get_db)):
    oglas = db.query(HallAds).options(\
        joinedload(HallAds.hall).options(joinedload(Hall.city),joinedload(Hall.sports_associations).options(joinedload(HallAndSports.sport)) , joinedload(Hall.photos) ), \
        joinedload(HallAds.user)).filter(HallAds.id_hall == id_hall).all()
    
    slicni_oglasi = db.query(Hall).options(joinedload(Hall.photos)).filter(Hall.id_city == oglas[0].hall.city.id_city).limit(5).all() 
    
    
    return {"oglas":oglas,"slicni_oglasi": slicni_oglasi}


@app.get('/hall-sa-vise-slika')
def slike(db: Session = Depends(get_db)):
    slike = db.query(HallAndPhotos).all()

    return {"slike": slike}


@app.get('/halls/all')
def get_all_halls(sport: str = None, location: str = None, db: Session = Depends(get_db)):
    query = db.query(Hall)

    halls = query.all()
    
    if not halls:
        raise HTTPException(status_code=404, detail="Nema dvorana")
    else:
        for hall in halls:
            hall.location = hall.city.name if hall.city else None
            
            hall_photos = db.query(HallAndPhotos).filter(HallAndPhotos.id_hall == hall.id_hall).all()
            hall.photos = hall_photos

            hall_sports = db.query(HallAndSports).filter(HallAndSports.id_hall == hall.id_hall).all()
            hall.sports = [db.query(Sport).filter(Sport.id_sport == sport.id_sport).first().sport_name for sport in hall_sports]
            
        return halls
    

@app.get('/halls/limited')
def get_limited_halls(sport: str = None, location: str = None, db: Session = Depends(get_db)):
    query = db.query(Hall)

    halls = query.limit(3).all()  # Limit the results to 3 halls
    
    if not halls:
        raise HTTPException(status_code=404, detail="Nema dvorana")
    else:
        for hall in halls:
            hall.location = hall.city.name if hall.city else None
            
            hall_photos = db.query(HallAndPhotos).filter(HallAndPhotos.id_hall == hall.id_hall).all()
            hall.photos = hall_photos

            hall_sports = db.query(HallAndSports).filter(HallAndSports.id_hall == hall.id_hall).all()
            hall.sports = [db.query(Sport).filter(Sport.id_sport == sport.id_sport).first().sport_name for sport in hall_sports]
            
        return halls



from sqlalchemy.orm import joinedload

@app.get('/games/all')
def get_all_games(sport: str = None, location: str = None, db: Session = Depends(get_db)):
    query = db.query(Game).join(GameAd, Game.id_game == GameAd.id_game)
    # Filter games based on sport and location
    if sport:
        query = query.filter(Game.sport_name == sport)
    if location:
        query = query.join(Game.city).filter(City.name == location)

    games = query.all()
    if not games:
        raise HTTPException(status_code=404, detail="Nema Termina")
    else:
        for game in games:
            game.location = game.city.name if game.city else None
        # Convert games to a list of dictionaries with sport and location strings
        games_data = [
            {
                "creator_game": game.game_creator,
                "id_game": game.id_game,
                "no_of_players": game.no_of_players,
                "details": game.details,
                "location": game.location,
                "address": game.address,
                "sport": game.sport.sport_name,
                "users": [user.user.name for user in game.games_and_users]  # Corrected line
            }
            for game in games
        ]

        return games_data
    
@app.get('/games/limited')
def get_all_games(sport: str = None, location: str = None, db: Session = Depends(get_db)):
    query = db.query(Game).join(GameAd, Game.id_game == GameAd.id_game)

    # Filter games based on sport and location
    if sport:
        query = query.filter(Game.sport_name == sport)
    if location:
        query = query.join(Game.city).filter(City.name == location)

    games = query.limit(3).all()

    if not games:
        raise HTTPException(status_code=404, detail="Nema Termina")
    else:
        for game in games:
            game.location = game.city.name if game.city else None

        # Convert games to a list of dictionaries with sport and location strings
        games_data = [
            {
                "id_game": game.id_game,
                "no_of_players": game.no_of_players,
                "details": game.details,
                "location": game.location,
                "address": game.address,
                "sport": game.sport.sport_name,
                "users": [user.user.name for user in game.games_and_users]  # Corrected line
            }
            for game in games
        ]

        return games_data


@app.post('/game/check-in')
async def post_game(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        logging.info(f"Received data: {data}")

        id_game = data.get('id_game')
        id_user = data.get('id_user')

        if not id_game or not id_user:
            raise HTTPException(status_code=400, detail="Missing game or user ID")

        # Proverite da li igra postoji
        game = db.query(Game).filter(Game.id_game == id_game).first()
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")

        new_game_and_users = GamesAndUsers(
            id_game=id_game,
            id_user_player=id_user,
        )
        db.add(new_game_and_users)
        
        # Povećajte broj igrača
        game.no_of_players += 1
        
        db.commit()
        db.refresh(new_game_and_users)

        return new_game_and_users

    except Exception as e:
        logging.error(f"Error creating game: {e}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
@app.post('/halls/report/{id_hall}/{id_user}')
def report_hall(id_hall: int, id_user: int, db: Session = Depends(get_db)):
    hall = db.query(Hall).filter(Hall.id_hall == id_hall).first()
    if not hall:
        raise HTTPException(status_code=404, detail="Nema dvorana")
    new_report = HallReports(id_hall=id_hall, id_user=id_user)
    db.add(new_report)
    db.commit()
    return {"status": 200, "message": "Hall ad successfully reported"}

@app.get('/hall/is-reported/{id_hall}/{id_user}')
def is_reported(id_hall: int, id_user: int, db: Session = Depends(get_db)):
    report = db.query(HallReports).filter(HallReports.id_hall == id_hall, HallReports.id_user == id_user).first()
    if report:
        return {"is_reported": True}
    else:
        return {"is_reported": False}
    
@app.get('/halls/all_halls_and_reports')
def get_all_halls_and_reports(db: Session = Depends(get_db)):
    subquery = db.query(
        HallReports.id_hall,
        func.count(HallReports.id_hall).label('no_of_reports')
    ).group_by(HallReports.id_hall).subquery()
    
    query = db.query(
        Hall,
        subquery.c.no_of_reports
    ).outerjoin(subquery, Hall.id_hall == subquery.c.id_hall)

    results = query.all()

    print("rezultatii", results)

    returnData = []
    for hall, no_of_reports in results:
        returnData.append({
            "id_hall": hall.id_hall,
            "name": hall.name,
            "no_of_reports": (no_of_reports if no_of_reports else 0)
        })

        returnData = sorted(returnData, key=lambda x: x['no_of_reports'], reverse=True)

    return returnData

@app.delete('/halls/delete-hall/{id_hall}')
def delete_hall(id_hall: int, db: Session = Depends(get_db)):
    try:
        # Find the hall entry
        hall = db.query(Hall).filter(Hall.id_hall == id_hall).first()
        if not hall:
            raise HTTPException(status_code=404, detail="Hall not found")

        # Find all related hallAds entries
        hallAds = db.query(HallAds).filter(HallAds.id_hall == id_hall).all()

        for hallAd in hallAds:
            db.delete(hallAd)

        db.commit()

        # Now delete the hall entry
        db.delete(hall)
        db.commit()  # Commit after deleting the hall

        return {"status": 200, "message": "Hall and related data successfully deleted"}
    except HTTPException as e:
        raise e  # Reraise HTTP exceptions to send proper error responses
    
    except SQLAlchemyError as e:
        db.rollback()  # Rollback in case of error
        print(f"SQLAlchemyError: {str(e)}")  # Log the SQLAlchemy error
        raise HTTPException(status_code=500, detail="Database error occurred")
    
    except Exception as e:
        db.rollback()  # Rollback in case of any other error
        print(f"Exception: {str(e)}")  # Log the general error
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

@app.get('/user-halls/{user_id}') # only halls that user_id created, used to check can user edit some ad
def get_user_halls(user_id: str, db: Session = Depends(get_db)):
    user_halls = db.query(HallAds).filter(HallAds.id_user == user_id).all()
    
    if not user_halls:
        raise HTTPException(status_code=404, detail="User not found")
    all_hall_ids = [hall.id_hall for hall in user_halls] # getting only the id_hall for the user
    return JSONResponse(content=all_hall_ids)

@app.get('/get-one-hall/{id_hall}') 
def get_hall(id_hall: int, db: Session = Depends(get_db)):
    oglas = db.query(HallAds).options(\
        joinedload(HallAds.hall).options(joinedload(Hall.city),joinedload(Hall.sports_associations).options(joinedload(HallAndSports.sport)) , joinedload(Hall.photos) ), \
        joinedload(HallAds.user)).filter(HallAds.id_hall == id_hall).all()
    
    
    return {"hall":oglas}

@app.put('/update-hall/{id_hall}')
def update_hall(id_hall: int, request: CreateHallAdAllDataRequest, db: Session = Depends(get_db)):
    hall = db.query(Hall).filter(Hall.id_hall == id_hall).first()
    hall.name = request.hall.name
    hall.id_city = request.hall.id_city
    hall.address = request.hall.address
    hall.start_of_working = request.hall.start_of_working
    hall.end_of_working = request.hall.end_of_working
    hall.description = request.hall.description
    hall.no_of_players = request.hall.no_of_players
    hall.dimensions_width = request.hall.dimensions_width
    hall.dimensions_height = request.hall.dimensions_height
    hall.price = request.hall.price
    #db.add(hall)
    db.commit()
    db.refresh(hall)

    photos_to_delete = db.query(HallAndPhotos).filter(HallAndPhotos.id_hall == id_hall).all()
    if not photos_to_delete:
        raise HTTPException(status_code=404, detail="No photos found for this hall")

    for photo in photos_to_delete:
        db.delete(photo)
    
    db.commit()

    for photo in request.photos:
        new_photo = HallAndPhotos(id_hall=id_hall, photo=photo)
        db.add(new_photo)
        db.commit()


    return hall
@app.put('/users2/{user_id}')
async def edit(request:schemas.EditUserRequest, user_id: int, db: Session = Depends(get_db)):
    hashed_pass = bcrypt.hashpw(request.password.encode("utf-8"), bcrypt.gensalt())
   
    user = db.query(User).filter(User.id_user == user_id).first()
    
    user.email = request.email
    user.password = hashed_pass.decode('utf-8')
    user.name = request.name
    user.surname = request.surname
    user.date_of_birth = request.date_of_birth
    user.sex = request.sex
    user.id_city = request.id_city
    user.height = request.height
    user.weight = request.weight
    user.bio = request.bio
    user.profile_photo = request.profile_photo
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user

@app.post('/user-sport/delete-all-sports/{user_id}')
async def delete_user_sport(user_id: int, db: Session = Depends(get_db)):
    db.query(UserSport).filter(UserSport.id_user == user_id).delete()
    db.commit()
    return {"status": 200, "message": "Sports deleted successfully"}
    
@app.post('/user-sport2/{user_id}/{sport_id}/{level_id}')
async def add_user_sport2(user_id: int, sport_id: int, level_id: int, db: Session = Depends(get_db)):
    provjera = db.query(UserSport).filter(UserSport.id_user == user_id, UserSport.id_sport == sport_id).first()

    if provjera:
        return {"status": 409, "message": "Sport already added"}
    else:
        new_user_sport = UserSport(id_sport=sport_id, id_user=user_id, id_level=level_id)
        db.add(new_user_sport)
        db.commit()
        return {"status": 200, "message": "Sport added successfully"}
    
@app.get('/users3/{user_id}', response_model=schemas.UserBase2)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id_user == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Korisnik nije pronađen")
    
    date_of_birth_str = user.date_of_birth.strftime("%Y-%m-%d")
    base64_string = bytea_to_base64(user.profile_photo)
    user_dict = {
        'user_position': user.user_position,
        'email': user.email,
        'name': user.name,
        'surname': user.surname,
        'date_of_birth': date_of_birth_str,
        'sex': user.sex,
        'id_city': user.id_city,
        'height': user.height,
        'weight': user.weight,
        'bio': user.bio,
        'profile_photo': base64_string,
        'no_of_games': user.no_of_games,
        'no_of_reports': user.no_of_reports
    }
    return user_dict

@app.get('/sport/{sport_name}', response_model=schemas.SportBase)
def get_sport_id(sport_name: str, db: Session = Depends(get_db)):
    sport = db.query(Sport).filter(Sport.sport_name == sport_name).first()
    if sport is None:
        raise HTTPException(status_code=404, detail="Sport nije pronađen")
    return sport




#rezervacije

@app.get('/rezervacije/{id_hall}')
async def get_rezervacije(id_hall: int, db: Session = Depends(get_db)):
    hall = await utils.get_reservation_hall(id_hall=id_hall, db=db)
    return hall

@app.post('/rezervacije/{id_hall}')
async def get_rezervacije(id_hall: int,request: schemas.CreateReservation , db: Session = Depends(get_db)):
    reservation = await utils.create_reservation_hall(id_hall=id_hall, request=request, db=db)
    return reservation

@app.delete('/delete_reservation/{reservation_id}')
async def delete_reservation(reservation_id: int, db: Session = Depends(get_db)):
    reservation = await utils.delete_reservation(reservation_id=reservation_id, db=db) 
    return "Uspjesno obrisano"

@app.get('/igre-i-igraci/{id_game}')
async def get_igre_i_igraci(id_game: int, db: Session = Depends(get_db)):
    game = db.query(Game).options(
        joinedload(Game.games_and_users).joinedload(GamesAndUsers.user)
    ).filter(Game.id_game == id_game).all()
    if not game:
        return []

    return game

# komentari user:

@app.get('/komentari/{user_id}')
async def get_komentari(user_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).options(joinedload(Comment.user_who_commented)).filter(Comment.id_user_got_comment == user_id).all()

    if not comments:
        return []

    comments_response = []
    for comment in comments:
        comments_response.append({
            "id_user_who_commented": comment.id_user_who_commented,
            "name": comment.user_who_commented.name,
            "surname": comment.user_who_commented.surname,
            "profile_photo": comment.user_who_commented.profile_photo,
            "comment": comment.comment,
            "time_of_comment": comment.time_of_comment
        })

    return comments_response

@app.post("/komentari/{user_id}")
async def create_comment(user_id: int, comment: CommentCreate):
    db = SessionLocal()
    try:
        db_comment = Comment(
            comment=comment.comment,
            id_user_got_comment=comment.id_user_got_comment,
            id_user_who_commented=comment.id_user_who_commented
        )
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        return {"message": "Komentar uspješno dodan!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        db.close()

@app.get('/zvjezdice/{user_id}/{second_user_id}')
async def get_zvjezdice(user_id: int, second_user_id: int, db: Session = Depends(get_db)):
    zvjezdice = db.query(Stars).filter(Stars.id_user_got_stars == user_id, Stars.id_user_who_rated == second_user_id).first()
    if not zvjezdice:
        return False
    else:
        return True
    
@app.post('/zvjezdice/{user_id}')
async def post_zvjezdice(request_model: schemas.StarRatingCreate, db: Session = Depends(get_db)):
    zvjezdice = Stars(
        id_user_got_stars = request_model.id_user_got_stars,
        id_user_who_rated = request_model.id_user_who_rated,
        no_of_stars = request_model.no_of_stars
    )

    db.add(zvjezdice)
    db.commit()
    db.refresh(zvjezdice)
    return zvjezdice

@app.put('/zvjezdice/{user_id}')
async def put_zvjezdice(request_model: schemas.StarRatingCreate, db: Session = Depends(get_db)):
    zvjezdice = db.query(Stars).filter(
        Stars.id_user_got_stars == request_model.id_user_got_stars,
        Stars.id_user_who_rated == request_model.id_user_who_rated
    ).first()

    if zvjezdice is None:
        # Create a new Stars record if it doesn't exist
        zvjezdice = Stars(
            id_user_got_stars=request_model.id_user_got_stars,
            id_user_who_rated=request_model.id_user_who_rated,
            no_of_stars=request_model.no_of_stars
        )
        db.add(zvjezdice)
    else:
        # Update existing Stars record
        zvjezdice.id_user_got_stars = request_model.id_user_got_stars
        zvjezdice.id_user_who_rated = request_model.id_user_who_rated
        zvjezdice.no_of_stars = request_model.no_of_stars

    db.commit()
    db.refresh(zvjezdice)
    return zvjezdice

@app.get('/prosjek-zvjezdica/{user_id}')
async def get_prosjek_zvjezdica(user_id: int, db: Session = Depends(get_db)):
    lista = db.query(Stars).filter(Stars.id_user_got_stars == user_id).all()
    brojac = 0
    suma = 0
    for zvjezdica in lista:
        suma += zvjezdica.no_of_stars
        brojac += 1
    if brojac == 0:
        return 0
    else:
        prosjek = suma/brojac
        return prosjek
    

@app.post("/email-async", tags=["Send Email Asynchronously"])
async def send_email_async(data: EmailSchema) -> JSONResponse:
    try:
        template_path = Path("./email_templates/email.html")
        if not template_path.exists():
            raise HTTPException(status_code=500, detail="Email template not found")

        with template_path.open("r") as file:
            template_content = file.read()

        template = Template(template_content)
        rendered_content = template.render(
            title=data.subject,
            message=data.body,
            button_link=data.button_link,
            button_text=data.button_text
        )

        message = MessageSchema(
            subject=data.subject,
            recipients=data.email,
            body=rendered_content,
            subtype="html",
            attachments=[{
                "file": "./email_templates/logo2.png",
                "headers": {
                    "Content-ID": "<logo_image>"
                }
            }]
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        return JSONResponse(status_code=200, content={"message": "Email has been sent"})
    
    except HTTPException as he:
        logger.error(f"HTTP Exception: {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@app.post("/email-background", tags=["Send Email using Background Tasks"])
async def send_email_background(data: EmailSchema, background_tasks: BackgroundTasks) -> JSONResponse:
    try:
        template_path = Path("./email_templates/email.html")
        if not template_path.exists():
            raise HTTPException(status_code=500, detail="Email template not found")

        with template_path.open("r") as file:
            template_content = file.read()

        template = Template(template_content)
        rendered_content = template.render(
            title=data.subject,
            message=data.body,
            button_link=data.button_link,
            button_text=data.button_text
        )

        message = MessageSchema(
            subject=data.subject,
            recipients=data.email,
            body=rendered_content,
            subtype="html",
            attachments=[{
                "file": "./email_templates/logo2.png",
                "headers": {
                    "Content-ID": "<logo_image>"
                }
            }]
        )

        fm = FastMail(conf)
        background_tasks.add_task(fm.send_message, message)
        return JSONResponse(status_code=200, content={"message": "Email has been sent"})
    
    except HTTPException as he:
        logger.error(f"HTTP Exception: {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

#chat
from sqlalchemy.orm import aliased
from sqlalchemy.sql import func

@app.get('/chat-with-users/{current_user}')
async def chat_with_users( current_user: int ,db: Session = Depends(get_db)):
    subquery_sender = (
    db.query(
        Chat.id_user_sender.label("user_id"),
        func.max(Chat.sending_time).label('latest_time')
    )
    .group_by(Chat.id_user_sender)
    .subquery()
    )

    subquery_recipient = (
    db.query(
        Chat.id_user_recipient.label("user_id"),
        func.max(Chat.sending_time).label('latest_time')
    )
    .group_by(Chat.id_user_recipient)
    .subquery()
    )

    users = db.query(User).all()

    mess = []

    for user in users:
        latest_message = (
        db.query(Chat)
        .filter(
              or_(
        and_(Chat.id_user_sender == user.id_user, Chat.id_user_recipient == current_user),
        and_(Chat.id_user_sender == current_user, Chat.id_user_recipient == user.id_user)
              ))
        .filter(or_(
            (Chat.id_user_sender == subquery_sender.c.user_id) & (Chat.sending_time == subquery_sender.c.latest_time),
            (Chat.id_user_recipient == subquery_recipient.c.user_id) & (Chat.sending_time == subquery_recipient.c.latest_time)
        ))
        .order_by(Chat.sending_time.desc())
        .first()
    )
    
        if latest_message:
            mess.append({"user": user, "mess": latest_message})
        else:
            mess.append({"user": user, "mess": {"message": "Start a chat"}})

    return {"poruke": mess}

@app.get('/messages/{receiver_id}/{sender_id}')
async def get_messages(receiver_id: int, sender_id: int, db: Session = Depends(get_db)):
    messages = db.query(Chat).filter(
        or_(
        and_(Chat.id_user_sender == sender_id, Chat.id_user_recipient == receiver_id),
        and_(Chat.id_user_sender == receiver_id, Chat.id_user_recipient == sender_id)
        )
         ).order_by(Chat.sending_time.asc()).all()
    if messages is None:
        return "nemate poruka"
    else:
        return messages

import time, datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        await self.broadcast_user_status()

    async def disconnect(self, websocket: WebSocket, user_id: int):
        self.active_connections.pop(user_id, None)
        await self.broadcast_user_status()

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

    async def send_to_user(self, user_id: int, message: str):
        if user_id in self.active_connections:
            connection = self.active_connections[user_id]
            await connection.send_text(message)

    async def broadcast_user_status(self):
        user_status = {"active_users": list(self.active_connections.keys())}
        for connection in self.active_connections.values():
            await connection.send_json(user_status)

manager = ConnectionManager()
notification_manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, db: Session = Depends(get_db)):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            print(data)
            try:
                json_data = json.loads(data)
            except ValueError as e:
                print(f"Invalid JSON: {e}")
                continue

            new_mess = Chat(
                id_message=int(time.mktime(datetime.datetime.now().timetuple())),
                id_user_sender=json_data['id_user_sender'],
                id_user_recipient=json_data['id_user_recipient'],
                message=json_data['message'],
                seen=False
            )
            db.add(new_mess)
            db.commit()

            new_mess_dict = {
                "id_message": new_mess.id_message,
                "id_user_sender": new_mess.id_user_sender,
                "id_user_recipient": new_mess.id_user_recipient,
                "message": new_mess.message,
                "seen": new_mess.seen,
                "sending_time": new_mess.sending_time.isoformat()
            }
            await manager.broadcast(json.dumps(new_mess_dict))

    except WebSocketDisconnect:
        await manager.disconnect(websocket, user_id)

    except Exception as e:
        print(f"Connection error: {e}")

    finally:
        await manager.disconnect(websocket, user_id)

@app.websocket("/wsNotif/{user_id}")
async def websocket_notification_endpoint(websocket: WebSocket, user_id: int, db: Session = Depends(get_db)):
    await notification_manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            print("obavjest je ko je ", data)
            try:
                json_data = json.loads(data)
            except ValueError as e:
                print(f"Invalid JSON: {e}")
                continue

            new_notification = Notification(
                from_user=user_id,
                to_user=json_data['reciver'],
                message="Dobili ste novu poruku",
                notification_type="message"
            )
            db.add(new_notification)
            db.commit()

            new_notification_dict = {
                "from_user": new_notification.from_user,
                "to_user": new_notification.to_user,
                "message": new_notification.message,
                "notification_type": new_notification.notification_type
            }
            await notification_manager.broadcast(json.dumps(new_notification_dict))

    except WebSocketDisconnect:
        await notification_manager.disconnect(websocket, user_id)

    except Exception as e:
        print(f"Connection error: {e}")

    finally:
        await notification_manager.disconnect(websocket, user_id)

@app.put('/update-chat-seen/{receiver_id}/{sender_id}')
async def update_seen(receiver_id: int, sender_id: int, db: Session = Depends(get_db)):
    messages = db.query(Chat).filter(
        or_(
        and_(Chat.id_user_sender == sender_id, Chat.id_user_recipient == receiver_id),
        and_(Chat.id_user_sender == receiver_id, Chat.id_user_recipient == sender_id)
        )
        ).all()    

    for message in messages:
        message.seen = True
        db.commit()
    
    return "messages"

@app.get('/user-and-hall/{user_id}')
def get_user_and_hall(user_id: str, db: Session = Depends(get_db)):
    user_halls = db.query(HallAds).options(
        joinedload(HallAds.user), 
        joinedload(HallAds.hall).joinedload(Hall.city)
    ).filter(HallAds.id_user == user_id).all()
    
    if not user_halls:
        raise HTTPException(status_code=404, detail="Nema dvorana")
    
    for hall_ad in user_halls:
        hall = hall_ad.hall
        hall.location = hall.city.name if hall.city else None
        
        hall_photos = db.query(HallAndPhotos).filter(HallAndPhotos.id_hall == hall.id_hall).all()
        hall.photos = hall_photos if hall_photos else []
        
        hall_sports = db.query(HallAndSports).filter(HallAndSports.id_hall == hall.id_hall).all()
        hall.sports = [db.query(Sport).filter(Sport.id_sport == sport.id_sport).first().sport_name for sport in hall_sports] if hall_sports else []
        
    return user_halls

@app.get('/user-and-games/{user_id}')
def get_user_and_games(user_id: int, sport: str = None, location: str = None, db: Session = Depends(get_db)):
    query = db.query(Game).join(GameAd, Game.id_game == GameAd.id_game)
    if sport:
        query = query.filter(Game.sport_name == sport)
    if location:
        query = query.join(Game.city).filter(City.name == location)

    games = query.all()
    if not games:
        raise HTTPException(status_code=404, detail="Nema Termina")
    else:
        for game in games:
            game.location = game.city.name if game.city else None
        games_data = [
            {
                "creator_game": game.game_creator,
                "id_game": game.id_game,
                "no_of_players": game.no_of_players,
                "details": game.details,
                "location": game.location,
                "address": game.address,
                "sport": game.sport.sport_name,
                "users": [user.user.name for user in game.games_and_users]  # Corrected line
            }
            for game in games if game.game_creator == user_id
        ]

        return games_data


@app.delete('/users2/{user_id}')
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id_user == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@app.post('/game/create')
async def post_game(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        logging.info(f"Received data: {data}")

        no_of_players = data.get('no_of_players')
        details = data.get('details')
        id_city = data.get('id_city')
        address = data.get('address')
        id_sport = data.get('id_sport')
        players = data.get('players')
        game_creator = data.get('game_creator')

        if not (no_of_players and details and id_city and address and id_sport):
            raise HTTPException(status_code=400, detail="Missing fields in request data")

        new_game = Game(
            no_of_players=no_of_players,
            details=details,
            id_city=id_city,
            address=address,
            id_sport=id_sport,
            game_creator= game_creator
        )
        db.add(new_game)
        db.commit()
        db.refresh(new_game)
        new_ad = GameAd(
            id_game=new_game.id_game
        )
        db.add(new_ad)
        db.commit()
        if players and len(players) > 0:
            for player in players:
                new_player = GamesAndUsers(
                    id_game=new_game.id_game,
                    id_user_player=player
                )
                db.add(new_player)
            db.commit()

        return new_game

    except Exception as e:
        logging.error(f"Error creating game: {e}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    

@app.get('/notifications/{user_id}')
async def get_notifications(user_id: int, db:Session = Depends(get_db)):
    notifications = db.query(Notification).filter(Notification.to_user == user_id).order_by(Notification.created_at.desc()).all()
    return notifications

@app.put('/update_notification/{id}')
async def update_notifications(id: int, db:Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id_notification == id).first()
    notification.seen = True
    db.commit()
    return notification


# admin

@app.get('/female-users')
def get_female_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.sex == "female").all()
    return len(users)

@app.get('/male-users')
def get_male_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.sex == "male").all()
    return len(users)

@app.get('/no-of-hall-ads')
def get_number_of_hall_ads(db: Session = Depends(get_db)):
    ads = db.query(HallAds).all()
    return len(ads)

@app.get('/no-of-game-ads')
def get_number_of_game_ads(db: Session = Depends(get_db)):
    ads = db.query(GameAd).all()
    return len(ads)

class ReservationsCount(BaseModel):
    count: int
    date: str

from datetime import datetime, date, timedelta
@app.get("/reservations/last7days", response_model=List[ReservationsCount])
async def get_reservations_last_7_days(db: Session = Depends(get_db)):
    results = []
    trenutni_datum = date.today()

    for i in range(7):
        datum = trenutni_datum - timedelta(days=i)
        start_of_day = datetime.combine(datum, datetime.min.time())
        end_of_day = datetime.combine(datum, datetime.max.time())

        rezervacije = db.query(Reservation).filter(
            Reservation.starting_time >= start_of_day,
            Reservation.starting_time <= end_of_day
        ).count()

        results.append(ReservationsCount(count=rezervacije, date=datum.isoformat()))

    return results

@app.delete('/game-ads/delete/{id}')
async def delete_game_ad(id: int, db: Session = Depends(get_db)):
    game_ad = db.query(GameAd).filter(GameAd.id_game == id).first()
    if not game_ad:
        raise HTTPException(status_code=404, detail="Game ad not found")
    db.delete(game_ad)
    db.commit()
    return {"message": "Game ad deleted"}

   
#ovo mora biti na dnu sve dodatno pisite iznad
app.mount('/', app=sio_app)