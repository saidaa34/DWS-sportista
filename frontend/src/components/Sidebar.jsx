import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { CircleLoader } from "react-spinners";
import Chat from "./Chat";
import { jwtDecode } from "jwt-decode";
import { UserContext } from "../context/UserContext";
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:8000", {
    path: "/sockets",
});

export default function Sidebar({ funkcija }) {
    const api_link = import.meta.env.VITE_API_URL || `http://localhost:8000`;
    const [data, setData] = useState([]);
    const token = localStorage.getItem("token");
    const [activeUsers, setActiveUsers] = useState([]);
    const user = jwtDecode(token);
    const [sidebar, setSidebar] = useState(false);

    useEffect(() => {
        axios
            .get(`${api_link}/chat-with-users/${user.id_user}`)
            .then((res) => {
                setData(res.data.poruke);
            })
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        socket.on("connect", () => {
            socket.emit("join", user.id_user);
            console.log("Povezan");
        });

        socket.on("disconnect", () => {
            console.log("Otkontektovan");
        });

        socket.on("active-users", (users) => {
            setActiveUsers(users);
            console.log(users);
        });
    }, []);

    const truncateText = (text, maxLength) => {
        if (text.length > maxLength) {
            return text.slice(0, maxLength) + "...";
        }
        return text;
    };

    useEffect(() => {
        if (window.innerWidth > 500) setSidebar(true);
        else setSidebar(false);
    }, [window.innerWidth]);
    const handleChangeSidebar = () => {
        setSidebar(!sidebar);
    };
    return (
        <>
            {!sidebar && (
                <i
                    className=" sm:hidden fa fa-align-right	absolute p-4 text-white"
                    onClick={handleChangeSidebar}
                ></i>
            )}
            {sidebar && (
                <div className="w-[300px] pt-5 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-sky-300 overflow-y-scroll pb-5 bg-dark-color border-r border-gray-500 text-white-color font-inter ">
                    <i
                        className="sm:hidden fa fa-close pl-5"
                        onClick={handleChangeSidebar}
                    ></i>

                    <ul className="flex flex-col gap-5">
                        {data.length < 1 ? (
                            <div className="flex w-full h-full items-center justify-center">
                                <CircleLoader color="white" />
                            </div>
                        ) : (
                            data.map((user) => (
                                <a
                                    onClick={() => funkcija(user.user)}
                                    key={user.user.id_user}
                                >
                                    <li className="flex items-center gap-5 pl-2 border-b  border-gray-500 pb-5">
                                        <img
                                            src={user.user.profile_photo}
                                            className="fa-solid fa-user bg-gray-500 text-slate-300 box-shadow-2xl rounded-full w-[40px] h-[40px] flex items-center justify-center text-xl"
                                        ></img>
                                        <div className="flex flex-col">
                                            <div className="flex items-center">
                                                <p className="text-[16px] font-[800]"></p>
                                                {user.user.name}{" "}
                                                {user.user.surname}
                                                {activeUsers.includes(
                                                    user.user.id_user
                                                ) ? (
                                                    <p className="h-3 w-3 ml-4 rounded-full bg-green-600"></p>
                                                ) : (
                                                    <p className="h-3 w-3 ml-4 rounded-full bg-red-600"></p>
                                                )}
                                            </div>
                                            <p
                                                className={
                                                    user.mess.seen
                                                        ? "text-sm font-[300] text-gray-color"
                                                        : "text-sm font-[800] text-gray-color "
                                                }
                                            >
                                                {truncateText(
                                                    user.mess.message,
                                                    20
                                                )}
                                            </p>
                                            <p className="text-[8px] font-semibold">
                                                {new Date(
                                                    user.mess.sending_time
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    </li>
                                </a>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </>
    );
}
