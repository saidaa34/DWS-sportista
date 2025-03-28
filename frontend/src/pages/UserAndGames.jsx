import React, { useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import Header from "../components/Header";
import Card from "../components/Card";
import logo from "/logo.png";
import Footer from "../components/Footer";
import ClipLoader from "react-spinners/ClipLoader";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";

const decodeToken = (token) => {
    if (!token) {
        console.error("No token provided");
        return " ";
    }

    try {
        const decodedToken = jwtDecode(token);
        return decodedToken;
    } catch (error) {
        console.error("Invalid token specified:", error.message);
        return null;
    }
};

export default function UserAndGames() {
    const token = localStorage.getItem("token");
    console.log(`TOKEN JE ${token}`);
    console.log(typeof token);
    const params = useParams();

    // Ensure the token is a string and log its type and value
    if (token === null || token === undefined) {
        console.error("Token is null or undefined");
    } else {
        console.log(`Token is a ${typeof token} with value: ${token}`);
    }

    // Decode the token if it exists
    const decodedToken = token ? decodeToken(token) : null;

    const [showNav, setShowNav] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    const [loading, setIsLoading] = useState(true);
    const [games, setGames] = useState([]);
    const [locations, setLocations] = useState(new Set());
    const [sports, setSports] = useState(new Set());
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedSport, setSelectedSport] = useState("");
    const [playerNum, setPlayerNum] = useState(0);
    const [sortOrder, setSortOrder] = useState("newest");
    const [apiError, setApiError] = useState(false);

    const api_link = import.meta.env.VITE_API_URL || `http://localhost:8000`;

    const handleNavChange = () => setShowNav((prevState) => !prevState);

    useEffect(() => {
        axios
            .get(`${api_link}/user-and-games/${params.user_id}`)
            .then((res) => {
                console.log(res.data);
                setGames(res.data);
                const locationsSet = new Set();
                const sportsSet = new Set();
                res.data.forEach((game) => {
                    locationsSet.add(game.location);
                    sportsSet.add(game.sport);
                });
                setLocations(locationsSet);
                setSports(sportsSet);
                setIsLoading(false);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    setApiError(true);
                } else {
                    console.log(err);
                }
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setShowNav(false);
        } else {
            setShowNav(true);
        }
    }, [window.innerWidth]);

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    const sortedGames = games.sort((a, b) => {
        if (sortOrder === "newest") {
            return new Date(b.ad_added_date) - new Date(a.ad_added_date);
        } else {
            return new Date(a.ad_added_date) - new Date(b.ad_added_date);
        }
    });

    const filteredGames = sortedGames.filter((game) => {
        return (
            (!selectedLocation || game.location === selectedLocation) &&
            (!selectedSport || game.sport === selectedSport) &&
            game.no_of_players >= playerNum
        );
    });

    return (
        <div className="min-h-screen bg-dark-color font-inter flex flex-col gap-[75px] lg:gap-[125px] overflow-clip">
            <i
                onClick={handleNavChange}
                className="fa-solid fa-bars fixed top-[20px] right-5 text-4xl z-30 text-gray-color lg:hidden"
            ></i>
            <img
                src={logo}
                alt="sportsmate matcher logo"
                className="w-[100px] lg:hidden fixed left-1 top-0 z-30"
            />
            <Header showNav={showNav} />

            <section className="relative min-h-(calc(100dvh-125px)) w-[100%] lg:px-[10%] px-5 mt-[100px] lg:mt-[200px] text-white mx-auto flex flex-col gap-20 pb-[50px]">
                <div className="flex items-center justify-center flex-col">
                    <h1 className="text-4xl xl:text-5xl 2xl:text-6xl  font-[600] tracking-wider pb-5">
                        Termini
                    </h1>
                    <div className="border-b-[3px] border-orange-color w-[50%] h-[5px] min-w-[250px]"></div>
                </div>
                <div className="z-10">
                    {!loading && (
                        <div className="relative flex flex-col md:flex-row md:gap-0 gap-5  md:items-center pb-5 justify-between">
                            <p
                                onClick={() =>
                                    setShowFilter((prevState) => !prevState)
                                }
                                className="border-b-2 flex items-center gap-0 md:gap-2 justify-between cursor-pointer text-xl 2xl:text-2xl font-sans md:hover:opacity-50 transition-all select-none"
                            >
                                Filtriraj{" "}
                                <i
                                    className={`fa-solid fa-chevron-down text-[11px]`}
                                ></i>
                            </p>
                            <div
                                className={`${
                                    showFilter ? "block" : "hidden"
                                } flex gap-5 mb-5 flex-col max-w-[290px] bg-gray-500  py-10 px-10 rounded absolute top-[35px] z-20`}
                            >
                                <select
                                    value={selectedSport}
                                    onChange={(e) =>
                                        setSelectedSport(e.target.value)
                                    }
                                    className="px-2 py-1 bg-gray-500 border-b-2 text-white rounded"
                                >
                                    <option value="">Sve</option>
                                    {[...sports].map((sport) => (
                                        <option key={sport} value={sport}>
                                            {sport}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedLocation}
                                    onChange={(e) =>
                                        setSelectedLocation(e.target.value)
                                    }
                                    className="px-2 py-1 bg-gray-500 border-b-2 text-white rounded"
                                >
                                    <option value="">Sve</option>
                                    {[...locations].map((location) => (
                                        <option key={location} value={location}>
                                            {location}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="number"
                                    min={1}
                                    placeholder="Broj igraca"
                                    onChange={(e) =>
                                        setPlayerNum(
                                            e.target.value >= 1
                                                ? e.target.value
                                                : 0
                                        )
                                    }
                                    className="px-2 py-1 bg-gray-500 border-b-2 text-white rounded"
                                />
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-4 gap-y-12 min-h-[500px] ">
                        {loading ? (
                            <div className="absolute left-0 w-screen flex justify-center">
                                <ClipLoader color="fff" size={50} />
                            </div>
                        ) : apiError ? (
                            <p className="text-xl text-red-400 absolute pt-10 left-1/2 translate-x-[-50%]  text-center">
                                Nema oglasa.
                            </p>
                        ) : filteredGames.length > 0 ? (
                            filteredGames.map((game) => (
                                <Card
                                    key={game.id_game}
                                    id={game.id_game}
                                    title={game.details}
                                    sport={game.sport}
                                    photo={
                                        game.photos && game.photos.length > 0
                                            ? game.photos[0].photo
                                            : undefined
                                    }
                                    creator={game.creator_game}
                                    lokacija={game.location}
                                    alt={game.details}
                                    no_of_players={game.no_of_players}
                                    players={game.users}
                                    is_term={true}
                                    id_game={game.id_game}
                                    id_user={decodedToken?.id_user}
                                />
                            ))
                        ) : (
                            <div>
                                <p className="text-xl text-red-400 absolute pt-10 left-1/2 translate-x-[-50%]  text-center">
                                    Nema oglasa koji odgovaraju kriterijumu.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}
