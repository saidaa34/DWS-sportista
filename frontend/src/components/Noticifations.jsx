import React, { useState, useEffect, useContext } from "react";

import { io } from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { UserContext } from "../context/UserContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:8000", {
    path: "/sockets",
});
const Noticifations = ({ activeNotifications }) => {
    const options = {
        autoClose: 6000,
        hideProgressBar: false,
        position: "bottom-right",
        pauseOnHover: true,
    };
    const api_link = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");
    const user = jwtDecode(String(token));
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        axios
            .get(`${api_link}/notifications/${user?.id_user}`)
            .then((res) => {
                setNotifications(res.data);
            })
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        socket.on("notificationsMess", (data) => {
            setNotifications((prevNotification) => [data, ...prevNotification]);
        });

        socket.on("updatedNotifications", (data) => {
            setNotifications(data);
        });
        socket.on("reservationNotification", (data) => {
            setNotifications(data);
        });
        socket.on("notificationsReservationRequest", (data) => {
            setNotifications((prevNotification) => [data, ...prevNotification]);
        });
        socket.on("checkedInBack", (data) => {
            setNotifications((prevNotification) => [data, ...prevNotification]);
        });

        return () => {
            socket.off("updatedNotifications");
            socket.off("reservationNotification");
            socket.off("notificationsReservationRequest");
            socket.off("notificationsMess");
            socket.off("checkedInBack");
        };
    }, []);

    const updateSeenNotification = (id) => {
        axios
            .put(`${api_link}/update_notification/${id}`)
            .then((res) => {
                console.log("Updateovano");
            })
            .catch((err) => console.log(err));

        socket.emit("updateNotification", {
            id: id,
            notifications: notifications,
        });
    };
    console.log("userrrrrr1", user.name)
    const handleCheckIn = (e, id_user, id_game) => {
        e.preventDefault();
        if (!id_game || !id_user) {
            toast.error("Nedostaju podaci o igri ili korisniku", options);
            return;
        }

        axios
            .post(`${api_link}/game/check-in`, {
                id_game: id_game,
                id_user: id_user,
            })
            .then(function (response) {
                toast.success("Uspješno ste dodali osobu na termin", options);
                socket.emit("checkedIn", {
                    to_user: id_user,
                    from_user: user.id_user
                });
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            })
            .catch(function (error) {
                toast.error("Greška, molimo pokušajte kasnije", options);
            });
    };

    return (
        <ul
            className={`${
                activeNotifications ? "flex" : "hidden"
            } absolute top-[100px] right-[-30px]  w-[300px] bg-gray-500 flex flex-col rounded pb-2 h-[200px] overflow-y-scroll`}
        >
            {notifications.length > 0
                ? notifications.map((notif) =>
                    
                      notif.to_user == user.id_user ? (
                          <li
                              key={notif.id_notification}
                              onClick={() =>
                                  updateSeenNotification(notif.id_notification)
                              }
                              className={
                                  notif.seen
                                      ? "border-b border-slate-200 flex flex-col gap-2 text-[15px] items-center py-2"
                                      : "border-b border-slate-200 bg-slate-600 flex flex-col gap-2 text-[15px] items-center py-2"
                              }
                          >
                              {notif.notification_type == "message" ? (
                                  <p>
                                      Dobili ste novu poruku od korisnika{" "}
                                      {notif.from_user}
                                  </p>
                              ) : notif.notification_type == "reservation" ? (
                                  <p>
                                      Dodani ste na novu igru od korisnika{" "}
                                      {notif.from_user}
                                  </p>
                              ) : notif.notification_type == "checkedIn" ? (
                                  <p>
                                      Prihvaceni ste na igru od korisnika{" "}
                                      {notif.from_user}
                                  </p>
                              ) : (
                                  <>
                                      <p>
                                          {" "}
                                          Imate zahtjev za igru od korisnika{" "}
                                          {notif.from_user}{" "}
                                      </p>

                                      <form
                                          className="flex gap-10"
                                          onSubmit={(e) =>
                                              handleCheckIn(
                                                  e,
                                                  notif.from_user,
                                                  parseInt(
                                                      notif.notification_type
                                                  )
                                              )
                                          }
                                      >
                                          <button>
                                              <i className="fa-solid md:hover:opacity-50 text-green-500 fa-check"></i>
                                          </button>
                                          <button>
                                              <i className="fa-solid md:hover:opacity-50 text-red-500 fa-close"></i>
                                          </button>
                                      </form>
                                  </>
                              )}
                              <p className="text-[12px]">
                                  {new Date(notif.created_at).toLocaleString()}
                              </p>
                          </li>
                      ) : (
                          ""
                      )
                  )
                : "Nemate obavjesti"}
            <ToastContainer />
        </ul>
    );
};

export default Noticifations;
