import React, { useContext, useState } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import sportIcon from "/sport_balls.svg.png";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { io } from "socket.io-client";
import { jwtDecode } from 'jwt-decode';
import { UserContext } from '../context/UserContext';

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:8000", {
  path: "/sockets",
});

const decodeToken = (token) => {
    if (!token) {
      console.error('No token provided');
      return null;
    }
  
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken;
    } catch (error) {
      console.error('Invalid token specified:', error.message);
      return null;
    }
  };

export default function AdminGameCard(props) {
    const [showPlayers, setShowPlayers] = useState(false);
    const api_link = import.meta.env.VITE_API_URL || `http://localhost:8000`;
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
    const [token ] = useContext(UserContext)
    const user = decodeToken(token)  

    const handleDelete = (id) => {
        console.log("deleting id game ", id)
        axios.delete(`http://127.0.0.1:8000/game-ads/delete/${id}`)
            .then((res) => {
                //setHallAds(hallAds.filter((hall, i) => i !== index));
                props.handleDeleteAd(id)
            })
            .catch((error) => {
                console.error(error);
            });

        console.log("deleteAd");
        };

    return (
        <div className="bg-[white] flex flex-col gap-8 pb-10 mt-5 pt-7 justify-center items-start text-center h-[100%] rounded relative">
            
            <h1 className="text-xl 2xl:text-2xl font-[700] pl-5 text-black">
                {props.title}
            </h1>
            <div className="flex flex-col items-start gap-5 w-full px-5">
                <p className="text-base 2xl:text-xl font-[500] text-black">
                    Lokacija: {props.lokacija}
                </p>
                
                {props.price ? (
                    <p className="text-base 2xl:text-xl font-[500] text-black">
                        Cijena: {props.price} €/h
                    </p>
                ) : (
                    <p className="text-base 2xl:text-xl font-[500] text-black">
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
                    <div className="text-base 2xl:text-xl font-[500] border-b md:hover:opacity-50 cursor-pointer text-black">
                        Lista igrača
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
            <button
                onClick={() => handleDelete(props.id_game)}
                className="absolute bottom-0 left-1/2 translate-x-[-50%] mx-auto px-5 py-2 bg-[#f5622b] text-base lg:text-xl rounded lg:hover:opacity-50 cursor-pointer transition-all translate-y-[50%] z-30 w-[175px] lg:w-[200px]"
            >
                Obriši oglas
            </button>
            <ToastContainer />
        </div>
    );
}
