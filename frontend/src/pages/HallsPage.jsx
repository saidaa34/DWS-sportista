import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import Header from "../components/Header";
import Card from "../components/Card";
import logo from "/logo.png";
import Footer from "../components/Footer";
import ClipLoader from "react-spinners/ClipLoader";
import { Link } from "react-router-dom";

function HallsPage() {
    const [token] = useContext(UserContext);
    const [showNav, setShowNav] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    const [loading, setIsLoading] = useState(true);
    const [halls, setHalls] = useState([]);
    const [locations, setLocations] = useState(new Set());
    const [sports, setSports] = useState(new Set());
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedSport, setSelectedSport] = useState("");
    const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
    const [playerNum, setPlayerNum] = useState(0);
    const [sortOrder, setSortOrder] = useState("newest");
    const api_link = import.meta.env.VITE_API_URL || `http://localhost:8000`;

    const handleNavChange = () => setShowNav((prevState) => !prevState);

    useEffect(() => {
        axios
            .get(`${api_link}/halls/all`)
            .then((res) => {
                setHalls(res.data);
                const locationsSet = new Set();
                const sportsSet = new Set();
                res.data.forEach((hall) => {
                    locationsSet.add(hall.location);
                    hall.sports.forEach((sport) => sportsSet.add(sport));
                });
                setLocations(locationsSet);
                setSports(sportsSet);
                setIsLoading(false);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    setHalls([]);
                    setIsLoading(false);
                } else {
                    console.log(err);
                }
            });
    }, [api_link]);

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

    const sortedHalls = halls.sort((a, b) => {
        if (sortOrder === "newest") {
            return new Date(b.ad_added_date) - new Date(a.ad_added_date);
        } else {
            return new Date(a.ad_added_date) - new Date(b.ad_added_date);
        }
    });

    const filteredHalls = sortedHalls.filter((hall) => {
        const maxPrice = priceRange.max || Infinity;
        return (
            (!selectedLocation || hall.location === selectedLocation) &&
            (!selectedSport || hall.sports.includes(selectedSport)) &&
            hall.price >= priceRange.min &&
            hall.price <= maxPrice &&
            hall.no_of_players >= playerNum
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
                        Tereni
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
                                className="border-b-2 flex items-center gap-0 md:gap-2 justify-between cursor-pointer text-xl 2xl:text-2xl font-sans md:hover:opacity-50 transition-all select-none mx-2 "
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
                                    min={0}
                                    placeholder="Minimalna cijena"
                                    onChange={(e) =>
                                        setPriceRange((prev) => ({
                                            ...prev,
                                            min: e.target.value,
                                        }))
                                    }
                                    className="px-2 py-1 bg-gray-500 border-b-2 text-white rounded"
                                />
                                <input
                                    type="number"
                                    min={parseInt(priceRange.min) + 1}
                                    placeholder="Maksimalna cijena"
                                    onChange={(e) =>
                                        setPriceRange((prev) => ({
                                            ...prev,
                                            max: e.target.value || Infinity,
                                        }))
                                    }
                                    className="px-2 py-1 bg-gray-500 border-b-2 text-white rounded"
                                />
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
                            <select
                                value={sortOrder}
                                onChange={handleSortChange}
                                className="py-1 bg-transparent border-b-2 text-white text-xl"
                            >
                                <option
                                    value="newest"
                                    className="text-[16px] tracking-widest"
                                >
                                    Najnovije
                                </option>
                                <option
                                    value="oldest"
                                    className="text-[16px] tracking-widest"
                                >
                                    Najstarije
                                </option>
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-4 gap-y-12 min-h-[500px] ">
                        {loading ? (
                            <div className="absolute left-0 w-screen flex justify-center">
                                <ClipLoader color="fff" size={50} />
                            </div>
                        ) : filteredHalls.length > 0 ? (
                            filteredHalls.map((hall) => (
                                <Card
                                    key={hall.id_hall}
                                    id={hall.id_hall}
                                    title={hall.name}
                                    photo={
                                        hall.photos.length > 0
                                            ? hall.photos[0].photo
                                            : undefined
                                    }
                                    lokacija={hall.location}
                                    price={hall.price}
                                    alt={hall.name}
                                    no_of_players={hall.no_of_players}
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

export default HallsPage;
