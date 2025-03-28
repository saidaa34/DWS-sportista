import axios from "axios";
import { Link } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import AdminGameCard from "./AdminGameCard";
import { jwtDecode } from "jwt-decode";
import { React, useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";


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

const AdminGameAdsList = ({reported}) => {
    const [token] = useContext(UserContext);
    const decodedToken = decodeToken(token);
    const [games, setGames] = useState([]);
    const [locations, setLocations] = useState(new Set());
    const [sports, setSports] = useState(new Set());
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedSport, setSelectedSport] = useState("");
    const [playerNum, setPlayerNum] = useState(0);
    const [sortOrder, setSortOrder] = useState("newest");
    const [apiError, setApiError] = useState(false); // State to handle API error
    const [loading, setIsLoading] = useState(true);
    
    const api_link = import.meta.env.VITE_API_URL || `http://localhost:8000`;
    useEffect(() => {
        axios
            .get(`${api_link}/games/all`)
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
                    setApiError(true); // Set API error to true if 404 status
                } else {
                    console.log(err);
                }
                setIsLoading(false);
            });
    }, []);

    const deleteAd = (id_hall, index) => {
        axios.delete(`http://127.0.0.1:8000/halls/delete-hall/${id_hall}`)
            .then((res) => {
                setHallAds(hallAds.filter((hall, i) => i !== index));
            })
            .catch((error) => {
                console.error(error);
            });

        console.log("deleteAd");
        
    }
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

    const handleDeleteAd = (id) => {
        setGames(games.filter((game, i) => game.id_game != id));
    }
    

    return (
        <div className="z-10">
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
                                <AdminGameCard
                                    key={game.id_game}
                                    id={game.id_game}
                                    id_ad={game.id_ad}
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
                                    id_user={decodedToken.id_user}
                                    handleDeleteAd={handleDeleteAd}
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
    );
};

export default AdminGameAdsList