import os
import models
import schemas
import jwt
import base64
from fastapi import security, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
import pytz
from datetime import timedelta
JWT_SECRET_KEY="eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcxNTAzMDYyMywiaWF0IjoxNzE1MDMwNjIzfQ"
JWT_REFRESH_SECRET_KEY="eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcxNTAzMDY0OSwiaWF0IjoxNzE1MDMwNjQ5fQ"
ACCES_TOKEN_EXPIRE_MINUTES = 30
ALGORITHM ="HS256"

oauth2schema = security.OAuth2PasswordBearer(tokenUrl='/api/token')


async def create_token(user: models.User):
    user = schemas.UserBase.from_orm(user)
    users_serialized = []
    
    encoded_image_str = base64.b64encode(user.profile_photo).decode('utf-8')

    user_dict = user.__dict__
    user_dict['profile_photo'] = encoded_image_str
    users_serialized.append(user_dict)

    token = jwt.encode(users_serialized[0] ,JWT_SECRET_KEY)
    return schemas.Token(access_token=token, token_type="bearer")

from main import get_db

async def get_current_user_2(
    token: str = Depends(oauth2schema),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        user = db.query(models.User).filter(models.User.email == payload["email"]).first()
    except:
        raise HTTPException(
            status_code=401, detail="Invalid Email or Password"
        )

    return user


async def get_reservation_hall(
        id_hall: int,
        db: Session
):
    hall_ad = db.query(models.HallAds).filter(models.HallAds.id_hall == id_hall).first()
    rezervacije = db.query(models.Reservation)\
                            .options(joinedload(models.Reservation.hall_ad))\
                            .options(joinedload(models.Reservation.game))\
                            .options(joinedload(models.Reservation.user_renter))\
                            .filter(models.Reservation.id_hall_ad == hall_ad.id_ad ).all()

    local_timezone = pytz.timezone("Europe/Belgrade")  # Prilagodite vremensku zonu prema vašim potrebama
    if rezervacije is not None:
        for rezervacija in rezervacije: 
            localized_starting_time = local_timezone.localize(rezervacija.starting_time)
            localized_ending_time = local_timezone.localize(rezervacija.ending_time)

            time_start_shifted = localized_starting_time + timedelta(hours=2)
            time_end_shifted = localized_ending_time + timedelta(hours=2)

            rezervacija.starting_time = time_start_shifted
            rezervacija.ending_time = time_end_shifted
    else:
        rezervacije = []
        
    users = db.query(models.User).all()
    return {'rezervacije': rezervacije, 'users': users}

async def create_reservation_hall(
        request: schemas.CreateReservation,
        id_hall: int,
        db: Session
):
    hall_ad = db.query(models.HallAds).filter(models.HallAds.id_hall == id_hall).first()
    new_game = models.Game(
        no_of_players = request.game.no_of_players,
        details = request.game.details,
        id_city = request.game.id_city, 
        address = request.game.address,
        id_sport = request.game.id_sport,
        game_creator = request.reservation.id_user_renter
    )
    db.add(new_game)
    db.flush()
    db.refresh(new_game)
    
    if(request.game.objavi_igru == True):
        new_game_ad = models.GameAd(
            id_game = new_game.id_game
        )
        db.add(new_game_ad)
        db.flush()
        db.refresh(new_game_ad)

    for user in request.game.players:
        new_player = models.GamesAndUsers(
            id_game = new_game.id_game,
            id_user_player = user
        )
        db.add(new_player)
        db.flush()
        db.refresh(new_player)



    local_tz = pytz.timezone('Europe/Sarajevo')
    local_start_time = request.reservation.starting_time.astimezone(local_tz)
    local_end_time = request.reservation.ending_time.astimezone(local_tz)
    print(local_end_time, local_start_time)

    new_reservation = models.Reservation(
        id_hall_ad = hall_ad.id_ad,
        id_game = new_game.id_game,
        id_user_renter = request.reservation.id_user_renter,
        starting_time = local_start_time,
        ending_time = local_end_time
    )

    db.add(new_reservation)
    db.commit()

    db.refresh(new_reservation)
    db.refresh(new_game)

    return {"rezervacija:": new_reservation, "Igra": new_game}
    
async def delete_reservation(reservation_id:int, db: Session):
    reservation = db.query(models.Reservation).filter(models.Reservation.id_reservation == reservation_id).first()
    if reservation is None:
        raise HTTPException(status_code=404, detail=f"Reservation with id {reservation_id}")
    
    db.delete(reservation)
    db.commit()
    