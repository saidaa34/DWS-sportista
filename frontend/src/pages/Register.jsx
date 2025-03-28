import { useContext, useState, useEffect, useRef } from "react";
import Footer from "../components/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import logo from "/logo.png";
import { jwtDecode } from "jwt-decode";

export default function Register() {
  const options = {
    autoClose: 6000,
    hideProgressBar: false,
    position: "bottom-right",
    pauseOnHover: true,
  };
  const navigate = useNavigate();
  const inputFileRef = useRef(null);
  const api_link = import.meta.env.VITE_API_URL;
  //const [selected, setSelected] = useState([]);
  const [cities, setCities] = useState([]);

  const [sports, setSports] = useState([]); // all sports from database
  const [selectedSports, setSelectedSports] = useState([]); // sports that user selected
  const [levels, setLevels] = useState([]); // all levels from database

  const [nextRegister, setNextRegister] = useState(false);
  const [, setToken] = useContext(UserContext);
  const [showNav, setShowNav] = useState(true);
  const handleNavChange = () => setShowNav((prevState) => !prevState);
  const [registrationData, setRegistrationData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    date_of_birth: "",
    sex: "",
    height: 0,
    weight: 0,
    id_city: "2", // default Banjaluka ?
    bio: "",
    profile_photo: "",
    no_of_games: 0,
    no_of_reports: 0,
    selectedSports: selectedSports, // sports that user selected and levels of that sport
    user_position: "user",
  });


  const handleChange = (e) => {
    setRegistrationData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleChangeFile = (e) => {
    console.log(e.target);
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (upload) => {
      console.log(upload.target.result);
      const img_data = upload.target.result;
      setRegistrationData((prevData) => ({
        ...prevData,
        profile_photo: img_data,
      }));
    };
    reader.readAsDataURL(file);
  };

  const goNextForm = () => {
    if (
      registrationData.name == "" ||
      registrationData.surname == "" ||
      registrationData.email == "" ||
      registrationData.password == "" ||
      registrationData.confirmPassword == ""
    ) {
      toast.error("Molimo Vas ispunite sva polja!", options);
    } else if (registrationData.password != registrationData.confirmPassword) {
      toast.error("Lozinke moraju biti iste!", options);
    } else {
      setNextRegister(true);
    }
  };

  const cleanSelectedSports = async() => {
    const formattedSports = selectedSports
      .filter(option => option.id_level !== "") // Filter out invalid entries
      .map(option => ({
        id_sport: parseInt(option.id_sport),
        id_level: parseInt(option.id_level)
      }));
    
    setSelectedSports(formattedSports);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      registrationData.name == "" ||
      registrationData.surname == "" ||
      registrationData.id_city == "" ||
      registrationData.date_of_birth == "" ||
      registrationData.bio == "" ||
      registrationData.password == "" ||
      registrationData.confirmPassword == "" ||
      registrationData.email == ""
    ) {
      toast.error("Molimo Vas ispunite sva polja!", options);
    }
    if (registrationData.password != registrationData.confirmPassword) {
      toast.error("Lozinke trebaju biti iste!", options);
    }
    console.log("sportovi koje saljem", registrationData.selectedSports);

    cleanSelectedSports();
    console.log("selected sports after cleaning:", selectedSports);
    registrationData.selectedSports = selectedSports
    console.log("registration data:", registrationData);
    await axios
      .post(`${api_link}/register`, registrationData)
      .then(async (res) => {
        if (res.data.status != 200) {
          toast.error(res.data.mess, options);
          setNextRegister(false);
          setRegistrationData((prevData) => ({ ...prevData }));
        } else {
          console.log(res.data);
          setToken(res.data.token);

          // Send welcome email to new user
          const emailData = {
            "email": [registrationData.email],
            "subject": "Dobro dosli u Sportsmate Matcher!",
            "body": "Uspješno ste se registrovali. Nastavite dalje na aplikaciju i iskoristite sve povlastice prijavljenih korisnika!",
            "button_text": "Idi na aplikaciju", 
            "button_link": "https://localhost:5173/"
          }
          axios
            .post(`${api_link}/email-async`, emailData)
            .then((res2) => {
              if (res2.status != 200) {
                toast.error(res2.data.mess, options);
                
              } else {
                navigate("/");
              }
            })
        }
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setShowNav(false);
    } else {
      setShowNav(true);
    }
  }, [window.innerWidth]);

  useEffect(() => {
    const fetchCities = () => {
      axios
        .get(`${api_link}/city`)
        .then((res) => {
          if (res.status == 200) {
            setCities(res.data);
          } else {
            console.log(res.statusText);
          }
        })
        .catch((err) => console.log(err));
    };
    fetchCities();
  }, []);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = () => {
    axios
      .get(`${api_link}/sports`)
      .then((res) => {
        if (res.status === 200) {
          const modifiedSports = res.data.map((sport) => ({
            ...sport,
            id_level: 1,
            level_name: "Početnik", // default value
            selected: false
          }));

          setSports(modifiedSports);
        } else {
          console.log(res.statusText);
        }
      })
      .catch((error) => {
        console.error("Error fetching sports data", error);
      });
  };

  useEffect(() => {
    const fetchLevels = () => {
      axios
        .get(`${api_link}/levels`)
        .then((res) => {
          if (res.status == 200) {
            setLevels(res.data);
            console.log("Svi leveli", res.data);
          } else {
            console.log(res.statusText);
          }
        })
        .catch((err) => console.log(err));
    };
    fetchLevels();
  }, []);
  
  const handleChangeSelect = (e, index) => {
    const { name, value } = e.target;
    const updatedSports = [...selectedSports];
    updatedSports[index][name] = value;
    setSelectedSports(updatedSports);
  };

  const handleRemoveSport = (index) => {
    const updatedSports = selectedSports.filter((_, i) => i !== index);
    setSelectedSports(updatedSports);
  };  
  
  const dodajNoviSport = () => {
    setSelectedSports([
      ...selectedSports,
      { id_sport: "", id_level: 1, level_name: "Početnik" }
    ]);
  };

  const set_avatar = (e) => {
    fetch(
      registrationData.sex == "male"
        ? "./man-profile-icon.png"
        : "./woman-profile-icon.png"
    )
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = (upload) => {
          const img_data = upload.target.result;
          setRegistrationData((prevData) => ({
            ...prevData,
            profile_photo: img_data,
          }));
        };
        reader.readAsDataURL(blob);
      })
      .catch((error) => console.error("Error fetching image:", error));
  };

  return (
    <>
      <div className="bg-dark-color min-h-[100vh] absolute font-inter text-white w-full">
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

        <div className="mt-[125px] pt-10 flex z-10 relative flex-col items-center">
          <h1 className="text-2xl z-10 text-white font-semibold uppercase">
            Dobro došli!
          </h1>
          <h1 className="text-2xl text-center mb-10 z-10 text-white uppercase">
            Započnite svoju sportsku avanturu
          </h1>

          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col z-10 shadow-orange-color  mb-20 border-t-2 items-center border-orange-color rounded-xl shadow-2xl p-10 w-11/12 sm:w-1/2"
          >
            <h1 className="text-2xl text-white-color text-center  uppercase mb-4">
              Kreirajte račun
            </h1>
            {nextRegister ? null : (
              <>
                <div className="flex flex-col md:flex-row w-full items-center md:justify-between md:w-9/12 space-x-2">
                  <input
                    onChange={(e) => handleChange(e)}
                    value={registrationData.name}
                    className="w-full md:w-9/12 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                    type="text"
                    name="name"
                    placeholder="Unesite vaše ime..."
                    required
                  ></input>
                  <input
                    value={registrationData.surname}
                    onChange={(e) => handleChange(e)}
                    className="w-full md:w-9/12 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                    type="text"
                    name="surname"
                    placeholder="Unesite vaše prezime..."
                    required
                  ></input>
                </div>
                <div className="flex flex-col md:flex-row w-full md:w-9/12 items-center sm:space-x-6 justify-between">
                  <input
                    onChange={(e) => handleChange(e)}
                    value={registrationData.date_of_birth}
                    className="w-full md:w-1/2 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                    type="date"
                    name="date_of_birth"
                    required
                  ></input>

                  <div className=" w-full my-3 md:mb-0 md:w-1/2 flex justify-around ">
                    <label>
                      <input
                        type="radio"
                        name="sex"
                        value="male"
                        className="text-dark-color mr-2 bg-gray-color border-b-[1px]  border-dark-color p-2"
                        checked={registrationData.sex === "male"}
                        onChange={(e) => handleChange(e)}
                      />
                      Muško
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="sex"
                        value="female"
                        className="text-dark-color mr-2 bg-gray-color border-b-[1px]  border-dark-color p-2"
                        checked={registrationData.sex === "female"}
                        onChange={(e) => handleChange(e)}
                      />
                      Žensko
                    </label>
                  </div>
                </div>

                <input
                  value={registrationData.email}
                  onChange={(e) => handleChange(e)}
                  className="w-full md:w-9/12 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                  type="email"
                  name="email"
                  placeholder="example@domain.com"
                  required
                ></input>
                <input
                  value={registrationData.password}
                  onChange={(e) => handleChange(e)}
                  className="w-full md:w-9/12 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                ></input>
                <input
                  value={registrationData.confirmPassword}
                  onChange={(e) => handleChange(e)}
                  className="w-full md:w-9/12 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  required
                ></input>
                <p
                  className="text-white mt-6 bg-orange-color p-4 rounded-lg w-1/3 text-center hover:cursor-pointer"
                  onClick={() => goNextForm()}
                >
                  Nastavite
                </p>
              </>
            )}
            {nextRegister ? (
              <>
                <select
                  value={registrationData.id_city}
                  onChange={(e) => handleChange(e)}
                  name="id_city"
                  className="w-full md:w-9/12 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                >
                  {cities?.map((city) => {
                    return (
                      <option
                        key={city.id_city}
                        className="bg-dark-color"
                        value={city.id_city}
                      >
                        {city.name}
                      </option>
                    );
                  })}
                </select>
                
                <div className="w-full md:w-9/12 mt-4">
                  <label className="block">Odaberite level atletskih sposobnosti u odabranim sportovima</label>
                  {selectedSports.map((sport, index) => (
                    <div className="flex space-x-2" key={index}>
                      <select
                        onChange={(e) => handleChangeSelect(e, index)}
                        name="id_sport"
                        className="block w-1/2 bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent hall-ads-select"
                        value={sport.id_sport}
                      >
                        <option value="">Odaberite sport</option>
                        {sports?.map(sportOption => (
                          !sportOption.selected && (
                            <option key={sportOption.id_sport} value={sportOption.id_sport}>
                              {sportOption.sport_name}
                            </option>
                          )
                        ))}
                      </select>
                      <select
                        onChange={(e) => handleChangeSelect(e, index)}
                        name="id_level"
                        className="block w-1/2 bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent hall-ads-select"
                        value={sport.id_level}
                      >
                        {levels.map(level => (
                          <option key={level.id_level} value={level.id_level}>
                            {level.level_name}
                          </option>
                        ))}
                      </select>
                      <i className="fa-solid fa-trash trash-img mt-5 hover:cursor-pointer" onClick={() => handleRemoveSport(index)}></i>
                    </div>
                  ))}
                  <button
                  type="button"
                  onClick={dodajNoviSport}
                  className="block w-1/2 m-auto bg-transparent text-white  py-3 px-4 mb-3 
                  dodaj-novi-sport-dugme-registracija">
                    Dodaj novi sport
                  </button>
                </div>
                
                <div className="flex w-full md:w-9/12 items-center justify-between space-x-2 mt-4">
                  <div>
                    <label className="block">Unesite visinu</label>
                    <input
                      value={registrationData.height}
                      onChange={(e) => handleChange(e)}
                      className="w-full bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                      type="number"
                      name="height"
                      placeholder="Unesite vašu visinu.."
                    ></input>
                  </div>
                  <div>
                    <label className="block">Unesite težinu</label>
                  <input
                    value={registrationData.weight}
                    onChange={(e) => handleChange(e)}
                    className="w-full bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                    type="number"
                    name="weight"
                    placeholder="Unesite vašu težinu..."
                  ></input>
                  </div>
                </div>
                
                <p className="w-9/12 m-auto mb-3">
                  Odaberite svoju profilnu sliku ili avatar!
                </p>
                <div className="flex items-end justify-between w-full md:w-9/12 mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={inputFileRef}
                    capture="environment" // Postavljanje capture atributa na 'environment'
                    onChange={handleChangeFile}
                  />
                  {registrationData.sex == "male" ? (
                    <img
                      src="./man-profile-icon.png"
                      className="h-16 m-auto cursor-pointer"
                      alt=""
                      onClick={(e) => set_avatar(e)} // Klikom na sliku, aktivira se odabir slike iz lokalnog računala
                    ></img>
                  ) : (
                    <img
                      src="./woman-profile-icon.png"
                      className="h-16 m-auto cursor-pointer"
                      alt=""
                      onClick={() =>
                        setRegistrationData({
                          ...registrationData,
                          profile_photo: "./man-profile-icon.png",
                        })
                      }
                    ></img>
                  )}
                  <input
                    onChange={(e) => handleChangeFile(e)}
                    type="file"
                    placeholder="izaberite sliku"
                    className="w-1/2 bg-transparent text-white-color border-b-[1px] m-0 border-orange-color p-2"
                  />
                </div>
                
                <textarea
                  value={registrationData.bio}
                  onChange={(e) => handleChange(e)}
                  className="w-full md:w-9/12 mt-4 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                  type="text"
                  name="bio"
                  placeholder="Vaš kratki opis..."
                ></textarea>
                <button
                  type="submit"
                  className=" md:w-1/3 uppercase bg-orange-color text-white p-3 rounded-md font-semibold"
                >
                  Registrujte se
                </button>
                
              </>
            ) : null}
          </form>
        </div>
        <ToastContainer />
        <Footer />
      </div>
    </>
  );
}
