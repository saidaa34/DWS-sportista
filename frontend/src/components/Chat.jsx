import { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { jwtDecode } from "jwt-decode";
import { CircleLoader } from "react-spinners";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:8000", {
    path: "/sockets",
});

export default function Chat({ userId, user2 }) {
    const receiver_id = userId;
    const [isConnected, setIsConnected] = useState(socket.connected);

    const api_link = import.meta.env.VITE_API_URL || `http://localhost:8000`;
    const [isValidUser, setIsValidUser] = useState({});
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const ulRef = useRef(null);
    const [loadingMess, setLoadingMess] = useState(true);
    const [activeUsers, setActiveUsers] = useState([]);
    const token = localStorage.getItem("token");
    const user = jwtDecode(token);
    const handleChange = (e) => {
        setInput(e.target.value);
    };

    useEffect(() => {
        socket.on("chat", (data) => {
            console.log(data);
            setMessages((prevMessages) => [...prevMessages, data.message]);
        });

        return () => {
            socket.off("chat");
        };
    }, []);

    useEffect(() => {
        if (receiver_id) {
            axios
                .get(`${api_link}/messages/${receiver_id}/${user?.id_user}`)
                .then((res) => {
                    if (res.status == 200) {
                        setLoadingMess(false);
                        setMessages(res.data);
                    }
                })
                .catch((err) => console.log(err));

            axios
                .put(
                    `${api_link}/update-chat-seen/${receiver_id}/${user?.id_user}`
                )
                .then((res) => {
                    console.log(res.data);
                })
                .catch((err) => console.log(err));
        }
    }, [receiver_id]);

    const sendMessage = () => {
        const message = {
            id_user_sender: user?.id_user,
            id_user_recipient: parseInt(receiver_id),
            message: input,
        };
        if (input && input.length) {
            socket.emit("chat", message);
            socket.emit("notificationMess", message);
            setInput("");
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        if (ulRef.current) {
            ulRef.current.scrollTop = ulRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="grow bg-[#4A4B50] flex flex-col font-inter">
            {user2 && (
                <div className="flex gap-5 items-center py-6 box-shadow-2xl mb-5 px-5 text-gray-color text-xl font-[600] bg-dark-color">
                    {!user2.name ? (
                        "Izaberite korisnika"
                    ) : (
                        <div className="flex gap-5 items-center box-shadow-2xl text-gray-color text-xl font-[600] bg-dark-color">
                            <img
                                src={user2.profile_photo}
                                alt=""
                                className="rounded-full w-[60px] h-[60px] "
                            />
                            <span>
                                {user2.name} {user2.surname}
                            </span>
                        </div>
                    )}
                </div>
            )}
            <ul
                className="grow max-h-dvh overflow-y-scroll scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-sky-300 flex flex-col gap-5 p-5"
                ref={ulRef}
            >
                {userId == 0 ? (
                    <div className="w-full flex items-center justify-center">
                        <img src="./robot.gif" className="h-48 w-fit"></img>
                    </div>
                ) : (
                    <>
                        {loadingMess ? (
                            <div className="text-white absolute top-1/2 left-1/2">
                                <CircleLoader color="white" />
                            </div>
                        ) : messages.length < 1 ? (
                            <div className="w-full flex items-center justify-center">
                                <img
                                    src="./robot.gif"
                                    className="h-48 w-fit"
                                ></img>
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                if (
                                    (msg.id_user_sender === receiver_id ||
                                        msg.id_user_recipient ===
                                            receiver_id) &&
                                    (msg.id_user_sender === user.id_user ||
                                        msg.id_user_recipient === user.id_user)
                                ) {
                                    return (
                                        <li
                                            className={`${
                                                msg.id_user_sender ===
                                                receiver_id
                                                    ? "bg-[rgb(110,110,120)] self-end"
                                                    : "bg-dark-color self-start"
                                            } text-gray-color rounded px-3 py-2`}
                                            key={i}
                                        >
                                            <p>{msg.message}</p>
                                            <div className="flex text-[12px] justify-between items-center">
                                                <span>
                                                    {new Date(
                                                        msg.sending_time
                                                    ).toLocaleString()}
                                                </span>
                                                <span>
                                                    {msg.seen ? (
                                                        <>
                                                            <i className="fa-solid fa-check"></i>
                                                            <i className="fa-solid fa-check"></i>
                                                        </>
                                                    ) : (
                                                        <i className="fa-solid fa-check"></i>
                                                    )}
                                                </span>
                                            </div>
                                        </li>
                                    );
                                } else {
                                    return null; // Dodajte ovaj dio da biste izbjegli renderiranje elemenata koji ne zadovoljavaju uvjet
                                }
                            })
                        )}
                    </>
                )}
            </ul>

            <div className="flex gap-5 items-end pb-5 pr-5 pl-5">
                <textarea
                    type="text"
                    onChange={(e) => handleChange(e)}
                    onKeyDown={handleKeyDown}
                    value={input}
                    placeholder="Type a message"
                    className="w-3/4 p-2 mx-auto resize-none bg-[rgb(110,110,120)] text-gray-color rounded"
                />
                <button
                    onClick={sendMessage}
                    className="bg-dark-color h-full text-slate-200 w-1/4 font-[700] px-5 py-2 rounded"
                >
                    Pošalji poruku
                </button>
            </div>
        </div>
    );
}
