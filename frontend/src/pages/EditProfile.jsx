import HashLoader from "react-spinners/HashLoader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import icon1 from "/message-circle-svgrepo-com.svg";
import manProfilePhoto from "/man-profile-icon.png";
import womanProfilePhoto from "/woman-profile-icon.png";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useParams } from "react-router-dom";
import ProfileDetails from "./ProfileDetails"
import SportsPopUp from "../components/SportsPopUp";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

export default function EditProfile({ userData, updateShowEditProfile, updateShowProfileDetails, handleRefresh, user_id }) {
    const [userLogin, setUserLogin] = useState({ email: "", password: "" });
    const params = useParams();
    const isInitialMount = useRef(true); // Ref za provjeru prvog montiranja
    const [loading, setIsLoading] = useState(false);
    const [showProfileDetails, setShowProfileDetails] = useState(true); 
    const inputFileRef = useRef(null);
    const api_link = import.meta.env.VITE_API_URL;

    const handleClickSave = () => {
        updateShowEditProfile();
        updateShowProfileDetails();
    }

    const options = {
        autoClose: 6000,
        hideProgressBar: false,
        position: "bottom-right",
        pauseOnHover: true,
    };

    const [showNav, setShowNav] = useState(true);
    
    const handleNavChange = () => setShowNav(prevState => !prevState)

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setShowNav(false)
        } else {
            setShowNav(true)
        }
    }, [window.innerWidth])

    const [formData, setFormData] = useState({
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        password: "",
        date_of_birth: userData.date_of_birth,
        sex: userData.sex,
        id_city: "1",
        height: 0,
        weight: 0,
        bio: userData.bio,
        profile_photo: userData.profile_photo,
    });

    const [cities, setCities] = useState([]); // all cities from database
    const [sports, setSports] = useState([]); // all sports from database
    const [selectedSports, setSelectedSports] = useState([]); // sports that user selected
    const [levels, setLevels] = useState([]); // all levels from database
  
    useEffect(() => { // getting all cities to use them in form
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/cities/all'); 
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        
        setCities(data);
        
        
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
    }, []);

    // pocetak

    useEffect(() => {
        fetchSports();
        fetchAlreadySelectedSports();
      }, []);
    
      const fetchSports = () => {
        axios
          .get(`${api_link}/sports`)
          .then((res) => {
            if (res.status === 200) {
              const modifiedSports = res.data.map((sport) => ({
                ...sport,
                id_level: 1,
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
    
      const fetchAlreadySelectedSports = () => {
        axios
          .get(`${api_link}/user-sport-level/${user_id}`)
          .then((res) => {
            if (res.status === 200) {
              const modifiedSports = res.data.map((sport) => ({
                ...sport,
                selected: true
              }));

              const modifiedSports2 = res.data.map((sport) => ({
                "id_sport": sport.id_sport,
                "id_level": sport.id_level
              }));
    
              setSports(modifiedSports);
              setSelectedSports(modifiedSports2);
              
            } else {
              console.log(res.statusText);
            }
          })
          .catch((error) => {
            console.error("Error fetching sports data", error);
          });

      }
    
      useEffect(() => {
        const fetchLevels = () => {
          axios
            .get(`${api_link}/levels`)
            .then((res) => {
              if (res.status == 200) {
                setLevels(res.data);
                
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
        updatedSports[index][name] = parseInt(value);
        setSelectedSports(updatedSports);
        
      };
    
      const handleRemoveSport = (index) => {
        const updatedSports = selectedSports.filter((_, i) => i !== index);
        setSelectedSports(updatedSports);
        
      };  
      
      const dodajNoviSport = () => {
        setSelectedSports([
          ...selectedSports,
          { id_sport: "", id_level: 1, }
        ]);
      };

    // kraj


    const [showSportsPopUp, setShowSportsPopUp] = useState(false);

    useEffect(() => { // for mobile for header
        if (window.innerWidth < 768) { 
            setShowSportsPopUp(true)
        } else {
            setShowSportsPopUp(false)
        }

        if(window.innerWidth < 1024) {
            setShowNav(false)
        }else{
            setShowNav(true)
        }

    }, [window.innerWidth])

    

    const set_avatar = (e) => {
        fetch(
          formData.sex == "male"
            ? "./man-profile-icon.png"
            : "./woman-profile-icon.png"
        )
          .then((response) => response.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.onload = (upload) => {
              const img_data = upload.target.result;
              setFormData((prevData) => ({
                ...prevData,
                profile_photo: img_data,
              }));
            };
            reader.readAsDataURL(blob);
          })
          .catch((error) => console.error("Error fetching image:", error));
    };

    const handleChangeFile = (e) => {
        
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (upload) => {
          
          const img_data = upload.target.result;
          setFormData((prevData) => ({
            ...prevData,
            profile_photo: img_data,
          }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            formData.name === "" ||
            formData.surname === "" ||
            formData.date_of_birth === "" ||
            formData.bio === "" ||
            formData.password === "" ||
            formData.email === ""
        ) {
            toast.error("Molimo Vas ispunite sva polja!", options);
        }
    
        else{
            
            try {
                
                const updateUserResponse = await axios.put(`http://127.0.0.1:8000/users2/${user_id}`, formData);
                const deletedAllSports = await axios.post(`http://127.0.0.1:8000/user-sport/delete-all-sports/${user_id}`)
                for(const sport of selectedSports) {
                    const addUserSportResponse = await axios.post(`http://127.0.0.1:8000/user-sport2/${user_id}/${sport.id_sport}/${sport.id_level}`);
                    
                }
        
                if (updateUserResponse.data.status === 200 && addUserSportResponse.data.status === 200) {
                    // setToken(updateUserResponse.data.token); // Postavljanje tokena samo jednom
                    console.log("okej je")
                } 
                handleClickSave();
                handleRefresh();
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <div className="edit-form mt-[0px] ms-[40px] pt-0 flex z-10 relative flex-col items-center w-full">                    
            <form
                onSubmit={handleSubmit}
                className="flex flex-col z-10 shadow-orange-color mb-20 border-t-2 items-center border-orange-color rounded-xl shadow-2xl p-10 w-10/12"
            >
                <input
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    value={formData.name}
                    type="text"
                    className="w-full md:w-9/12 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                    name="name"
                    placeholder="Ime"
                    required
                >
                </input>
                <input
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    value={formData.surname}
                    type="text"
                    name="surname"                    
                    className="w-full md:w-9/12 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                    placeholder="Prezime"
                    required
                >
                </input>
                <input
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    value={formData.email}
                    type="email"
                    className="w-full md:w-9/12 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                    name="email"
                    placeholder="E-mail"
                    required
                >
                </input>
                <input
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    value={formData.password}
                    type="password"
                    className="w-full md:w-9/12 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                    name="password"
                    placeholder="Lozinka"
                    required
                >
                </input>
                <textarea
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    value={formData.bio}
                    type="text"
                    name="bio"
                    className="w-full md:w-9/12 mt-4 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                    placeholder="Unesite biografiju"
                    required
                >
                </textarea>
                <div className="flex flex-col md:flex-row w-full md:w-9/12 items-center sm:space-x-6 justify-between">

                    <input
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        value={formData.date_of_birth}
                        type="date"
                        name="date_of_birth"
                        className="w-full md:w-1/2 bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                        placeholder="Unesite datum rođenja"
                        required
                    >
                    </input>
                    <div className=" w-full my-3 md:mb-0 md:w-1/2 flex justify-around ">
                        <label>
                        <input
                            type="radio"
                            name="sex"
                            value="male"
                            className="text-dark-color mr-2 bg-gray-color border-b-[1px]  border-dark-color p-2"
                            checked={formData.sex === "male"}
                            onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                        />
                        Muško
                        </label>
                        <label>
                        <input
                            type="radio"
                            name="sex"
                            value="female"
                            className="text-dark-color mr-2 bg-gray-color border-b-[1px]  border-dark-color p-2"
                            checked={formData.sex === "female"}
                            onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                        />
                        Žensko
                        </label>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row w-full md:w-9/12 items-center sm:space-x-6 justify-between">
                  <div>
                  <label>Unesi visinu</label>
                    <input
                      
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        value={formData.height}
                        type="number"
                        name="height"
                        className="w-full bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                        placeholder="Unesite visinu"
                        required
                    >
                    </input>
                  </div>
                    <div>
                    <label>Unesi težinu</label>
                    <input
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        value={formData.weight}
                        type="number"
                        name="weight"
                        className="w-full bg-transparent text-white-color border-b-[1px] m-auto mb-4 border-orange-color p-2"
                        placeholder="Unesite težinu"
                        required
                    >
                    </input>
                    </div>
                </div>
                <div className="w-1/2 px-3 mb-6 md:mb-0 inline-block">
                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="id_city">
                        Odaberi grad
                    </label>
                    <select
                        value={formData.id_city}
                        onChange={(e) => setFormData({ ...formData, id_city: e.target.value })}
                        name="id_city"
                        className=" block w-full bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent hall-ads-select"
                    >
                        {cities.map(city => (
                            <option key={`${city.id}-${city.name}`} value={city.id_city}>{city.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col items-center justify-center w-full md:w-9/12 mb-8">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={inputFileRef}
                        capture="environment" // Postavljanje capture atributa na 'environment'
                        onChange={handleChangeFile}
                    />
                    {formData.sex == "male" ? (
                        <img
                            src="./man-profile-icon.png"
                            className="h-16 m-auto cursor-pointer"
                            alt=""
                            onClick={(e) => set_avatar(e)} // Klikom na sliku, aktivira se odabir slike iz lokalnog računala
                        />
                    ) : (
                        <img
                            src="./woman-profile-icon.png"
                            className="h-16 m-auto cursor-pointer"
                            alt=""
                            onClick={() =>
                                setFormData({
                                    ...formData,
                                    profile_photo: "./man-profile-icon.png",
                                })
                            }
                        />
                    )}
                    <input
                        onChange={(e) => handleChangeFile(e)}
                        type="file"
                        placeholder="izaberite sliku"
                        className="w-1/2 bg-transparent text-white-color border-b-[1px] m-0 border-orange-color p-2"
                    />
                </div>
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
                <button
                    type="submit"
                    className=" md:w-1/3 uppercase bg-orange-color text-white p-3 rounded-md font-semibold"
                    >
                    Spremi promjene
                </button>
            </form>
        </div>
                
    )
}