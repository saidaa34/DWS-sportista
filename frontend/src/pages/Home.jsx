import HashLoader from "react-spinners/HashLoader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState, useRef, useContext } from "react";
import { gsap } from "gsap";
import MainContent from "../components/MainContent";
import manRunningSRC from "/man-running.svg";
import footballField from "/footballField.jpeg";
import icon1 from "/People.svg";
import icon2 from "/add-friend-svgrepo-com.svg";
import icon5 from "/message-circle-svgrepo-com.svg";
import icon4 from "/sport-centre-svgrepo-com.svg";
import icon3 from "/three-friends-svgrepo-com.svg";
import Card from "../components/Card";
import logo from "/logo.png";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Home() {
    const [decodedToken, setDecodedToken] = useState({});

    const [loading, setIsLoading] = useState(false);
    const [currentMain, setCurrentMain] = useState(0);
    const [showNav, setShowNav] = useState(true);
    const api_link = import.meta.env.VITE_API_URL || `http://localhost:8000`;
    const [halls, setHalls] = useState([]);
    const [games, setGames] = useState([]);

    const updateCurrentMain0 = () => setCurrentMain(0);
    const updateCurrentMain1 = () => setCurrentMain(1);
    const handleNavChange = () => setShowNav((prevState) => !prevState);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setIsLoading(true);
        }, 1500);

        return () => clearTimeout(timerId);
    }, []);

    useEffect(() => {
        axios
            .get(`${api_link}/halls/limited`)
            .then((res) => {
                setHalls(res.data);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    setHalls([]);
                } else {
                    console.log(err);
                }
            });
        axios
            .get(`${api_link}/games/limited`)
            .then((res) => {
                setGames(res.data);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    setHalls([]);
                } else {
                    console.log(err);
                }
            });
    }, [api_link]);

    useEffect(() => {
        localStorage.getItem("token")
            ? setDecodedToken(jwtDecode(localStorage.getItem("token")))
            : setDecodedToken({});
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setShowNav(false);
        } else {
            setShowNav(true);
        }
    }, [window.innerWidth]);

    //vracanje slike u binarne podatke iz tokena gdje je base64 string,
    //ovo koristiti za prikaz slike usera i slicno...
    const [binaryData, setBinaryData] = useState("");
    useEffect(() => {
        if (Object.keys(decodedToken).length !== 0) {
            const img_data = decodedToken.profile_photo;
            setBinaryData(atob(img_data));
        }
    }, []);

    return loading == true ? (
        <div className="min-h-screen bg-dark-color font-inter flex flex-col gap-[75px] lg:gap-[125px] overflow-clip  select-none">
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

            <main className=" min-h-[calc(100dvh-125px)] w-full lg:block flex items-center pt-[100px] lg:pt-[200px] lg:pb-28 ">
                {currentMain == 0 ? (
                    <MainContent
                        title="Povežite se s ljudima koji dijele vaše interese"
                        desc="Pronađite društvo s kojim ćete uživati igrajući sportske igre i stvarajući nezaboravne trenutke zajedničkog veselja."
                        imgSrc={manRunningSRC}
                        currentMain={currentMain}
                        num={0}
                    />
                ) : (
                    <MainContent
                        title="Imate teren koji želite izdati ?"
                        desc="Odaberite Kreiraj Oglas opciju, unesite neophodne podatke i željenu cijenu, zainteresovani korisnici će vam slati ponude za vaš teren."
                        btnText="Kreiraj oglas"
                        imgSrc={footballField}
                        currentMain={currentMain}
                        num={1}
                    />
                )}

                <div className="lg:flex hidden gap-5 absolute bottom-[50px] left-[50%] transform-x-[-50%]">
                    <div
                        className={`${
                            currentMain == 0 ? "bg-white" : "bg-gray-500"
                        } h-[25px] w-[25px] rounded-full lg:cursor-pointer lg:hover:opacity-50 transition-all`}
                        onClick={updateCurrentMain0}
                    ></div>
                    <div
                        className={`${
                            currentMain == 1 ? "bg-white" : "bg-gray-500"
                        } h-[25px] w-[25px] rounded-full lg:cursor-pointer lg:hover:opacity-50 transition-all`}
                        onClick={updateCurrentMain1}
                    ></div>
                </div>
            </main>
            <img src={binaryData} alt="" />
            <section className="min-h-(calc(100dvh-125px)) w-[100%] lg:px-[10%] px-5 mx-auto flex flex-col-reverse items-center lg:flex-row  lg:justify-center lg:items-center relative gap-20 lg:gap-0">
                <div className="lg:w-[60%] grid grid-cols-2 grid-rows-2 gap-y-[100px] gap-x-[50px] lg:gap-x-[0px] w-full">
                    <div className="flex flex-col text-center items-center text-white font-[800] gap-5">
                        <img
                            src={icon1}
                            alt="basketball court"
                            className="lg:w-[100px] w-[90px] fill-slate-100"
                        />
                        <p className="">Iznajmite prostor</p>
                    </div>
                    <div className="flex flex-col text-center items-center text-white font-[800] gap-5">
                        <img
                            src={icon2}
                            alt="basketball court"
                            className="lg:w-[100px] w-[90px] fill-slate-100"
                        />
                        <p className="">Kreiraj termin</p>
                    </div>
                    <div className="flex flex-col text-center items-center text-white font-[800] gap-5">
                        <img
                            src={icon3}
                            alt="basketball court"
                            className="lg:w-[100px] w-[90px] fill-slate-100"
                        />
                        <p className="">Dovedite svoju ekipu</p>
                    </div>
                    <div className="flex flex-col text-center items-center text-white font-[800] gap-5">
                        <img
                            src={icon4}
                            alt="basketball court"
                            className="lg:w-[100px] w-[90px] fill-slate-100"
                        />
                        <p className="">Pridružite se nekoj ekipi</p>
                    </div>
                </div>
                <div className="lg:w-[40%] text-right text-white flex flex-col justify-stretch items-end gap-10 z-10">
                    <h1 className="border-b-4 border-orange-color text-3xl 2xl:text-5xl font-[700] lg:w-[50%] pb-2">
                        ŠTA NUDIMO
                    </h1>
                    <p className="text-base 2xl:text-xl">
                        Uživate u sportskim aktivnostima i rado provodite
                        vrijeme s prijateljima igrajući se ili razmišljate o
                        pridruživanju novim osobama koje također cijene zdrav
                        način života kroz sport? Ili imate prostor koji želite
                        da iznajmite osobama koje će ga iskoristiti na najbolji
                        način igrajući omiljene sportove?
                    </p>
                </div>
            </section>

            <section className="min-h-(calc(100dvh-125px)) w-[100%] lg:px-[10%] px-5 text-white mx-auto flex flex-col items-center justify-center gap-20 relative overflow-hidden">
                <div className="rectangle2 absolute top-[20px] z-10 lg:top-[-70px] right-[-20px] rotate-[320deg]"></div>
                <div className="rectangle2 absolute top-[20px] z-10 lg:top-[-70px] right-[120px] rotate-[320deg]"></div>
                <div className="rectangle2 absolute top-[20px] z-10 lg:top-[-70px] right-[260px] rotate-[320deg]"></div>
                <div className="absolute top-[295px] bg-dark-color h-32 w-full"></div>
                <h1 className="font-[700] text-4xl 2xl:text-5xl uppercase z-10">
                    Aktuelno
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 z-10 ">
                    <div className="bg-[#47484B] flex flex-col gap-16 justify-center items-center p-5 text-center py-16">
                        <h1 className="text-xl 2xl:text-2xl font-[700]">
                            NOVI TERENI
                        </h1>
                        <p className="text-base 2xl:text-xl font-[500]">
                            Pretražite teremne po svojim potrebama i namjeni
                        </p>
                        <Link
                            to={"/oglasi/tereni"}
                            className="px-5 py-2 bg-red-color text-base 2xl:text-xl rounded lg:hover:opacity-50 cursor-pointer transition-all"
                        >
                            Pogledaj terene
                        </Link>
                    </div>
                    <div className="bg-[#47484B] flex flex-col gap-16 justify-center items-center p-5 text-center">
                        <h1 className="text-xl 2xl:text-2xl font-[700]">
                            NOVI TERMINI
                        </h1>
                        <p className="text-base 2xl:text-xl font-[500]">
                            Pogledajte termine kojima se možete pridružiti već
                            danas
                        </p>
                        <Link
                            to={"/oglasi/termini"}
                            className="px-5 py-2 bg-red-color text-base 2xl:text-xl rounded lg:hover:opacity-50 cursor-pointer transition-all"
                        >
                            Pogledaj termine
                        </Link>
                    </div>
                </div>
            </section>

            {halls && halls.length > 0 && (
                <section className="relative min-h-(calc(100dvh-125px)) w-[100%] lg:px-[10%] px-5 mt-[100px] text-white mx-auto flex flex-col gap-20 ">
                    <div className="left-0 top-[110px] lg:top-0 rotate-[180deg] absolute triangle2"></div>

                    <div className="z-10">
                        <h1 className="text-3xl 2xl:text-5xl mb-10 text-right font-[800] uppercase">
                            Izdvojeni Oglasi
                        </h1>

                        <h2 className="font-[500] text-2xl lg:text-3xl uppercase pb-5">
                            izdvojeni tereni
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 lg:gap-5 max-w-[300px] lg:max-w-full mx-auto">
                            {halls.map((hall) => (
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
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {games && games.length > 0 && (
                <section className="relative min-h-(calc(100dvh-125px)) w-[100%] lg:px-[10%] px-5 mt-[100px] text-white mx-auto flex flex-col gap-20 ">
                    <div className="right-0 top-[40px] lg:top-0 rotate-[180deg] absolute triangle"></div>

                    <div className="z-10">
                        <h2 className="font-[500] text-2xl lg:text-3xl uppercase pb-5">
                            izdvojeni termini
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 lg:gap-5 5  max-w-[300px] lg:max-w-full mx-auto">
                            {games.map((game) => (
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
                                    lokacija={game.location}
                                    alt={game.details}
                                    no_of_players={game.no_of_players}
                                    players={game.users}
                                    is_term={true}
                                    id_game={game.id_game}
                                    id_user={decodedToken.id_user}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    ) : (
        <div className="h-dvh bg-dark-color flex items-center justify-center">
            <HashLoader color="#B3C8CF" />
        </div>
    );
}
