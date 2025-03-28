
from models import Chat, Notification
import socketio
import time, datetime
from typing import Dict
from database import SessionLocal

sio_server = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[]
)

sio_app = socketio.ASGIApp(
    socketio_server=sio_server,
    socketio_path='sockets'
)


@sio_server.event
async def connect(sid, environ, auth):
    print(f'{sid}: connected')
    await sio_server.emit('join', {'sid': sid})

@sio_server.event
async def chat(sid, message):
    db = SessionLocal()
    try:
        new_mess = Chat(
            id_message=int(time.mktime(datetime.datetime.now().timetuple())),
            id_user_sender=message['id_user_sender'],
            id_user_recipient=message['id_user_recipient'],
            message=message['message'],
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

        await sio_server.emit('chat', {'sid': sid, 'message': new_mess_dict})
    finally:
        db.close()

@sio_server.on('notificationMess')
async def notification(sid, message):
    db = SessionLocal()
    try:
        new_notif = Notification(
            from_user = message['id_user_sender'],
            to_user = message['id_user_recipient'],
            message = message['message'],
            notification_type = 'message' 
        )
        db.add(new_notif)
        db.commit()
        new_notif_dict = {
            "id_notification": new_notif.id_notification,
            "from_user": new_notif.from_user,
            "to_user" : new_notif.to_user,
            "message": new_notif.message,
            "seen": new_notif.seen,
            "is_accepted": new_notif.is_accepted,
            "created_at": new_notif.created_at.isoformat(),
            "notification_type": new_notif.notification_type
        }

        await sio_server.emit('notificationsMess', new_notif_dict)
    finally:
        db.close()


@sio_server.on('updateNotification')
async def notification(sid, data):
    id = data['id']
    notifications = data['notifications']

    for notif in notifications:
        if notif['id_notification'] == id:
            notif['seen'] = True
    
    await sio_server.emit('updatedNotifications', notifications)
        
@sio_server.on('notificationsFromReservation')
async def notification(sid, data):
    db = SessionLocal()
    users = data['users']
    creator= data['creator']
    for user in users:
        new_notif = Notification(
            from_user = creator,
            to_user = user,
            message = "Dodani ste na novi termin ",
            notification_type = 'reservation'
            )
        db.add(new_notif)
        db.commit()
    
    notifications = db.query(Notification).all()
    notifications_serialized = []
    for notif in notifications:
        new_notif_dict = {
            "id_notification": notif.id_notification,
            "from_user": notif.from_user,
            "to_user" : notif.to_user,
            "message": notif.message,
            "seen": notif.seen,
            "is_accepted": notif.is_accepted,
            "created_at": notif.created_at.isoformat(),
            "notification_type": notif.notification_type
        }
        notifications_serialized.append(new_notif_dict)

    await sio_server.emit('reservationNotification', notifications_serialized)

@sio_server.on('reservationRequest')
async def reservationRequest(sid, data):
    print(data)
    db = SessionLocal()
    from_user = data['from_user']
    to_user = data['to_user']
    game_id = data['game_id']
    new_notif = Notification(
            from_user = from_user,
            to_user = to_user,
            message = "Imate zahtjev za pristup vasem terminu ",
            notification_type = str(game_id)
        )
    db.add(new_notif)
    db.commit()
    new_notif_dict = {
            "id_notification": new_notif.id_notification,
            "from_user": new_notif.from_user,
            "to_user" : new_notif.to_user,
            "message": new_notif.message,
            "seen": new_notif.seen,
            "is_accepted": new_notif.is_accepted,
            "created_at": new_notif.created_at.isoformat(),
            "notification_type": new_notif.notification_type
        }

    await sio_server.emit('notificationsReservationRequest', new_notif_dict)
    

@sio_server.on('checkedIn')
async def checkedIn(sid, data):
    to_user = data['to_user']
    from_user = data['from_user']
    db = SessionLocal()
    new_notif = Notification(
            from_user = from_user,
            to_user = to_user,
            message = "Odobren je zahtjev za pristup terminu ",
            notification_type = 'checkedIn'
        )
    db.add(new_notif)
    db.commit()
    new_notif_dict = {
            "id_notification": new_notif.id_notification,
            "from_user": new_notif.from_user,
            "to_user" : new_notif.to_user,
            "message": new_notif.message,
            "seen": new_notif.seen,
            "is_accepted": new_notif.is_accepted,
            "created_at": new_notif.created_at.isoformat(),
            "notification_type": new_notif.notification_type
        }

    await sio_server.emit('checkedInBack', new_notif_dict)
    
    



active_users: Dict[str, str] = {}

@sio_server.on('join')
async def join(sid, user_id):
    active_users[user_id] = sid
    await sio_server.emit('active-users', list(active_users.keys()))
    print(f"User {user_id} joined with socket id {sid}")

@sio_server.event
async def disconnect(sid):
    print(f'{sid}: disconnected')

@sio_server.on('disconnect')
async def disconnect(sid):
    for user_id, socket_id in active_users.items():
        if socket_id == sid:
            del active_users[user_id]
            break
    await sio_server.emit('active-users', list(active_users.keys()))
    print(f"Client {sid} disconnected")

