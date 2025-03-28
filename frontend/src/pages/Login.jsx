import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useContext, useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../context/UserContext";
import logo from "/logo.png";

export default function Login() {
    const [userLogin, setUserLogin] = useState({ email: "", password: "" });
    const [token, setToken] = useContext(UserContext);
    const handleNavChange = () => setShowNav((prevState) => !prevState);
    const api_link = import.meta.env.VITE_API_URL || "http://localhost:8000";

    const handleChangeUserLogin = (e) => {
        const { name, value } = e.target;
        setUserLogin((prevUser) => ({ ...prevUser, [name]: value }));
    };
    const options = {
        autoClose: 6000,
        hideProgressBar: false,
        position: "bottom-right",
        pauseOnHover: true,
    };
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (userLogin.email == "" || userLogin.password == "") {
            toast.error("Molimo ispunite sva polja!", options);
        }
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: JSON.stringify(
                `grant_type=&username=${userLogin.email}&password=${userLogin.password}&scope=&client_id=&client_secret=`
            ),
        };

        const response = await fetch(`${api_link}/api/token`, requestOptions);
        const data = await response.json();

        if (!response.ok) {
            toast.error(data.detail, options);
        } else {
            setToken(data.access_token);
            const token = data.access_token;
        const user = jwtDecode(token);

        console.log("Logged in user", user);

        if (user.user_position === "admin") {
            window.location.href = "/admin";
        } else {
            navigate("/");
        }
        }
    };

    const [showNav, setShowNav] = useState(true);

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setShowNav(false);
        } else {
            setShowNav(true);
        }
    }, [window.innerWidth]);

    return (
        <>
            <div className="min-h-[100vh] bg-dark-color absolute top-0 w-full font-inter text-white">
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
                <div className="flex bg-dark-color flex-col-reverse mt-20 items-center mb-20 w-10/12 m-auto  md:w-full sm:flex-row">
                    <div className="flex flex-col justify-center items-center w-full m-auto sm:w-1/2 pt-20">
                        <div className="text-center p-3 mb-10">
                            <h1 className="text-2xl mb-5">DOBRODOŠLI NAZAD</h1>
                            <h1 className="text-xl">
                                Prijavite se na svoj račun i nastavite sa novim
                                fizičkim aktivnostima
                            </h1>
                        </div>

                        <div className="w-full flex flex-col items-center shadow-2xl shadow-orange-color py-10 px-5 border-t-2 border-orange-color rounded-xl ">
                            <h1 className="text-2xl uppercase mb-10">
                                Prijavite se
                            </h1>

                            <form
                                onSubmit={(e) => handleLogin(e)}
                                className="flex text-black w-10/12 sm:w-1/2  flex-col items-end"
                            >
                                <input
                                    onChange={(e) => handleChangeUserLogin(e)}
                                    type="email"
                                    name="email"
                                    className="w-full bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                                    required
                                    placeholder="example@email.com"
                                />
                                <input
                                    onChange={(e) => handleChangeUserLogin(e)}
                                    type="password"
                                    name="password"
                                    className="w-full bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                                    required
                                    placeholder="********"
                                />
                                <button className="bg-orange-color w-fit py-2 px-4 text-white mb-3 placeholder:text-black rounded-md">
                                    Prijavite se
                                </button>
                            </form>

                            <p className="text-md font-semibold mt-5">
                                Još uvijek nemate račun?
                                <Link to="/register">
                                    <span className="text-orange-color">
                                        {" "}
                                        Registrujte se!
                                    </span>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
                <Footer />
                <ToastContainer />
            </div>
        </>
    );
}
