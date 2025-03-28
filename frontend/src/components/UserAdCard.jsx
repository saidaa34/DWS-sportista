import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { UserContext } from "../context/UserContext";
import sportIcon from "/sport_balls.svg.png";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:8000", {
    path: "/sockets",
});

const decodeToken = (token) => {
    if (!token) {
        console.error("No token provided");
        return null;
    }

    try {
        const decodedToken = jwtDecode(token);
        return decodedToken;
    } catch (error) {
        console.error("Invalid token specified:", error.message);
        return null;
    }
};

const UserAdCard = (props) => {
    const [showPlayers, setShowPlayers] = useState(false);
    const [token] = useContext(UserContext);
    const user = token ? decodeToken(token) : null;
    const api_link = import.meta.env.VITE_API_URL || `http://localhost:8000`;

    const [showEditAd, setShowEditAd] = useState(false);

    useEffect(() => {
        console.log("Neki podaci",props.creator, user?.id_user);
        if (user?.id_user == props.creator) {
            setShowEditAd(true);
        }
    }, []);

    const handleMouseEnter = () => {
        setShowPlayers(true);
    };

    const handleMouseLeave = () => {
        setShowPlayers(false);
    };

    const options = {
        autoClose: 6000,
        hideProgressBar: false,
        position: "bottom-right",
        pauseOnHover: true,
    };

    const handleCheckIn = () => {
        if (!token) {
            toast.error(
                "Morate se prijaviti da biste rezervisali termin!",
                options
            );
            return;
        }

        toast.success("Uspješno ste se poslali zahtjev za termin!", options);
        socket.emit("reservationRequest", {
            from_user: user?.id_user,
            to_user: props.creator,
            game_id: props.id_game,
        });

        if (!props.id_game || !props.id_user) {
            toast.error("Nedostaju podaci o igri ili korisniku", options);
            return;
        }

        axios
            .post(`${api_link}/game/check-in`, {
                id_game: props.id_game,
                id_user: props.id_user,
            })
            .then(function (response) {
                toast.success("Uspješno ste se prijavili na termin", options);
                setTimeout(() => {
                    window.location.reload();
                }, 2500);
            })
            .catch(function (error) {
                toast.error("Greška, molimo pokušajte kasnije", options);
            });
    };

    return (
        <div className="bg-[#47484B] flex flex-col gap-8 pb-10 justify-center items-start text-center h-[100%] rounded relative">
            <div className="w-full h-[200px] lg:h-[250px]">
                {props.photo ? (
                    <img
                        className="w-full h-full object-cover object-center"
                        src={props.photo}
                        alt="Card Photo"
                    />
                ) : (
                    <img
                        className="w-full h-full object-cover object-center "
                        src={sportIcon}
                        alt="Card Photo"
                    />
                )}
            </div>
            <h1 className="text-xl 2xl:text-2xl font-[700] pl-5">
                {props.title}
            </h1>
            <div className="flex flex-col items-start gap-5 w-full px-5">
                <p className="text-base 2xl:text-xl font-[500]">
                    Lokacija: {props.lokacija}
                </p>
                {props.price ? (
                    <p className="text-base 2xl:text-xl font-[500]">
                        Cijena: {props.price} €/h
                    </p>
                ) : (
                    <p className="text-base 2xl:text-xl font-[500]">
                        Sport: {props.sport}
                    </p>
                )}
            </div>
            {props.players && props.players.length > 0 && (
                <div
                    className="flex flex-col items-start gap-5 w-full px-5 relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="text-base 2xl:text-xl font-[500] border-b md:hover:opacity-50 cursor-pointer">
                        Current players
                    </div>
                    <ol
                        className={`${
                            showPlayers ? "" : "hidden"
                        } absolute bg-dark-color border border-red-600 top-10 px-10 py-5 z-40 flex flex-col gap-5  list-decimal rounded max-h-[300px] overflow-y-scroll`}
                    >
                        {props.players.map((player, index) => (
                            <li key={index}>{player}</li>
                        ))}
                    </ol>
                </div>
            )}

            {showEditAd && (
                <button className="px-5">
                    <Link
                        reloadDocument={true}
                        to={`/uredi-oglas-teren/${props.id}`}
                    >
                        Uredi oglas
                    </Link>
                </button>
            )}
                <button
                    onClick={handleCheckIn}
                    className="absolute bottom-0 left-1/2 translate-x-[-50%] mx-auto px-5 py-2 bg-red-color text-base lg:text-xl rounded lg:hover:opacity-50 cursor-pointer transition-all translate-y-[50%] z-30 w-[175px] lg:w-[200px]"
                >
                    {props.is_term ? (
                        <span>Prijavi se</span>
                    ) : (
                        <Link reloadDocument={true} to={`/tereni/${props.id}`}>
                            Pogledaj oglas
                        </Link>
                    )}
                </button>

            
            <ToastContainer style={{zIndex: 9999}}/>
        </div>
    );
};

export default UserAdCard;