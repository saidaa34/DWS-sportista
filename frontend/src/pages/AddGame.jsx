import { useState, useEffect, useContext } from "react";
import axios from "axios";
import Header from "../components/Header";
import logo from "/logo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";
import { UserContext } from "../context/UserContext";

export default function AddGame() {
    const api_link = import.meta.env.VITE_API_URL || `http://localhost:8000`;
    const [showNav, setShowNav] = useState(true);
    const handleNavChange = () => setShowNav((prevState) => !prevState);
    const [cities, setCities] = useState([]);
    const [sports, setSports] = useState([]);
    const [users, setUsers] = useState([]);
    const [token] = useContext(UserContext)
    const user = jwtDecode(token)
    const [formData, setFormData] = useState({
        no_of_players: 1,
        details: "",
        id_city: 0,
        address: "",
        id_sport: 0,
        players: [],
        game_creator: user.id_user
    });

    const customFilter = (option, searchText) => {
        if (
            option.data.label.toLowerCase().includes(searchText.toLowerCase())
        ) {
            return true;
        } else {
            return false;
        }
    };

    const CustomOption = ({ innerRef, innerProps, data }) => (
        <div
            ref={innerRef}
            {...innerProps}
            className="flex items-center py-2 px-3 border-b-[1px] border-orange-color bg-dark-color"
        >
            {data.label}
        </div>
    );

    const customStylesSelect = {
        control: (baseStyles, state) => ({
            ...baseStyles,
            borderColor: state.isFocused ? "#F5622B" : "#F5622B",
            background: "transparent",
            border: 0,
            ":focus": {
                border: 0,
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? "#F5622B" : "#38393D", // Postavlja pozadinsku boju na plavu ako je opcija odabrana, inače na bijelu
            color: state.isSelected ? "#ffffff" : "#ffffff", // Postavlja boju teksta na bijelu ako je opcija odabrana, inače na crnu
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: "#F5622B",
            color: "#ffffff",
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: "#ffffff",
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: "#ffffff",
            ":hover": {
                color: "#ffffff",
            },
        }),
    };

    useEffect(() => {
        axios
            .get(`${api_link}/cities/all`)
            .then((response) => {
                setCities(response.data);
                setFormData((prevData) => ({
                    ...prevData,
                    id_city: response.data[0].id_city,
                }));
            })
            .catch((error) => {
                console.error("Error fetching cities:", error);
            });

        axios
            .get(`${api_link}/sports`)
            .then((response) => {
                setSports(response.data);
                setFormData((prevData) => ({
                    ...prevData,
                    id_sport: response.data[0].id_sport,
                }));
            })
            .catch((error) => {
                console.error("Error fetching sports:", error);
            });

        axios
            .get(`${api_link}/users`)
            .then((response) => {
                setUsers(response.data);
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const options = {
        autoClose: 6000,
        hideProgressBar: false,
        position: "bottom-right",
        pauseOnHover: true,
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        axios
            .post(`${api_link}/game/create`, formData)
            .then((response) => {
                console.log("Game created successfully:", response.data);
                toast.success("Igra je uspješno kreirana!", options);
                setFormData({
                    no_of_players: 0,
                    details: "",
                    id_city: cities.length > 0 ? cities[0].id_city : 0,
                    address: "",
                    id_sport: sports.length > 0 ? sports[0].id_sport : 0,
                });
            })
            .catch((error) => {
                toast.error(
                    "Došlo je do greške, molimo pokušajte opet",
                    options
                );
                console.error("Error creating game:", error);
            });
    };

    const formatedData = users.map((user) => ({
        value: user.id_user,
        label: user.name + " " + user.surname,
        image: user.profile_photo,
    }));

    const handleChangeSelect = (e) => {
        const values = e.map((option) => option.value);
        setFormData((prevData) => ({
            ...prevData,
            players: values,
        }));
    };

    return (
        <div className="bg-dark-color min-h-dvh pt-[150px]">
            <i
                onClick={handleNavChange}
                className="fa-solid fa-bars fixed top-[20px] right-5 text-4xl z-30 text-gray-color lg:hidden"
            ></i>
            <Header showNav={showNav} />
            <h2 className="mb-10 text-center text-slate-200 text-3xl">
                Objavi oglas za svoj termin
            </h2>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-10 justify-center items-stretch  min-w-[300px] max-w-[700px] w-[50%] mx-auto pb-14"
            >
                <div className="flex flex-col gap-2">
                    <label className="text-slate-200" htmlFor="no_of_players">
                        Broj igraca
                    </label>
                    <input
                        type="number"
                        id="no_of_players"
                        name="no_of_players"
                        min={1}
                        max={100}
                        value={formData.no_of_players}
                        onChange={handleChange}
                        className="bg-transparent border-b border-orange-color  text-slate-200 pb-2 rounded text-[500]"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-slate-200" htmlFor="details">
                        Više informacija
                    </label>
                    <textarea
                        type="text"
                        id="details"
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        className="bg-transparent border border-orange-color  text-slate-200 pb-2 px-2 rounded text-[500]"
                    />
                </div>
                <div className="flex gap-10 lg:items-center flex-col lg:flex-row">
                    <div className="flex flex-col gap-2 grow">
                        <label className="text-slate-200" htmlFor="id_city">
                            Izaberite grad
                        </label>
                        <select
                            id="id_city"
                            name="id_city"
                            value={formData.id_city}
                            onChange={handleChange}
                            className="bg-transparent border-b border-orange-color  text-slate-200 pb-2 rounded text-[500]"
                        >
                            {cities.map((city) => (
                                <option key={city.id_city} value={city.id_city}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2 grow">
                        <label className="text-slate-200" htmlFor="address">
                            Adresa termina
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="bg-transparent border-b border-orange-color  text-slate-200 pb-2 rounded text-[500]"
                        />
                    </div>
                </div>
                <div className="flex gap-2 lg:gap-5 lg:items-center flex-col lg:flex-row">
                    <div className="w-[100%] flex justify-center flex-col gap-2 mb-4">
                        <label className="text-slate-200" htmlFor="players">
                            Izaberi igraca
                        </label>
                        <Select
                            styles={customStylesSelect}
                            isOptionDisabled={() =>
                                formData.players &&
                                formData.players.length >=
                                    formData.no_of_players
                            }
                            isMulti
                            className="bg-transparent border-b border-orange-color  text-slate-200 pb-2 rounded text-[500] w-full"
                            options={formatedData}
                            isSearchable={true}
                            isLoading={users.length < 1 ? true : false}
                            filterOption={customFilter}
                            onChange={(e) => handleChangeSelect(e)}
                            getOptionLabel={(e) => (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    {e.label}
                                </div>
                            )}
                            components={{ Option: CustomOption }}
                            name="players"
                            noOptionsMessage={() => "Nema dostupnih korisnika"}
                        />
                    </div>
                    <div className="flex flex-col gap-2 ">
                        <label className="text-slate-200" htmlFor="id_sport">
                            Izaberite sport
                        </label>
                        <select
                            id="id_sport"
                            name="id_sport"
                            value={formData.id_sport}
                            onChange={handleChange}
                            className="bg-transparent border-b border-orange-color  text-slate-200 pb-2 rounded text-[500]"
                        >
                            {sports.map((sport) => (
                                <option
                                    key={sport.id_sport}
                                    value={sport.id_sport}
                                >
                                    {sport.sport_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-orange-color py-2 text-slate-200 px-5 rounded md:hover:opacity-50 tracking-wide font-[500]"
                >
                    Kreiraj igru
                </button>
            </form>
            <ToastContainer />
            <Footer />
        </div>
    );
}
