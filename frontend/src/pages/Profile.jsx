import HashLoader from "react-spinners/HashLoader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import icon1 from "/message-circle-svgrepo-com.svg";
import manProfilePhoto from "/man-profile-icon.png";
import womanProfilePhoto from "/woman-profile-icon.png";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { useParams } from "react-router-dom";
import ProfileDetails from "./ProfileDetails"
import EditProfile from "./EditProfile"
import { UserContext } from "../context/UserContext";
import { jwtDecode } from "jwt-decode";

export default function Profile() {
    const [userLogin, setUserLogin] = useState({ email: "", password: "" });
    const params = useParams();
    const isInitialMount = useRef(true); // Ref za provjeru prvog montiranja
    const [loading, setIsLoading] = useState(false);
    const [showProfileDetails, setShowProfileDetails] = useState(true); 
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [token, ] = useContext(UserContext)
    const signedIn = localStorage.getItem("token") !== null;
    const [moguUreditiProfil, setMoguUreditiProfil] = useState(false);
    const [logovaniUser, setLogovaniUser] = useState(null);
    const [showZapocniRazgovor, setShowZapocniRazgovor] = useState(false);
    
    useEffect(() => {
        if (signedIn) {
            const user = jwtDecode(token);
            setMoguUreditiProfil(user.id_user == params.user_id);
            setShowZapocniRazgovor(user.id_user != params.user_id);
            setLogovaniUser(user.id_user);
        }
    }, [signedIn, token]);

    const updateShowProfileDetails = () => {
        setShowProfileDetails(prevState => !prevState)
    }
    const updateShowEditProfile = () => {
        setShowEditProfile(prevState => !prevState)
    }

    const handleRefresh = () => {
        window.location.reload();
    };

    // nek stoji ovo ako bude trebalo za kasnije
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

    const handleLogin = async (e) => {
        e.preventDefault();
        if (userLogin.email === "" || userLogin.password === "") {
            toast.error("Molimo ispunite sva polja!", options)
        }
        await axios.post("http://127.0.0.1:8000/login", userLogin)
            .then(res => {
                if (res.data.status !== 200) {
                    toast.error(res.data.mess, options)
                } else {
                    localStorage.setItem('user', JSON.stringify(res.data.user))
                    window.location.href = "/"
                }
            })
            .catch(err => console.log(err))
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

    const [userData, setUserData] = useState(null);

    useEffect(() => {

      const timerId = setTimeout(() => {
          setIsLoading(true);
      }, 1500);

      return () => clearTimeout(timerId);
    }, []);

    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/users2/${params.user_id}`);
                    setUserData(response.data);
                    if (response.data.profile_photo) {
                      const imageData = response.data.profile_photo;
                      setProfileImage(atob(imageData));
                  }
                } catch (error) {
                    console.error("Greška prilikom dohvatanja podataka o korisniku:", error);
                }
            };
            fetchUserData();
        }
    }, []);

    const [city, setCity] = useState("");

    useEffect(() => {
      if(userData !== null) {
        const fetchCityData = async () => {
          try {
            const response2 = await axios.get(`http://127.0.0.1:8000/city/${userData.id_city}`);
            setCity(response2.data);
          } catch (error) {
            console.error("Greška prilikom dohvatanja podataka o gradu:", error);
          }
        };
        fetchCityData();
      }
    }, [userData]);

    const [reported, setReported] = useState(false)

    const handleReportUser = async () => {
      try {
        if(signedIn && logovaniUser != null){
            const aaa = await axios.post(`http://127.0.0.1:8000/user-reports/${params.user_id}/${logovaniUser}`);
            console.log(aaa.data.status);
            if(aaa.data.status == 409){
                toast.error("Već ste prijavili ovog korisnika!", options);
                setReported(true)
            }
            else {
                toast.success("Uspješno ste prijavili korisnika!", options);
                setReported(true)
                const bbb = await axios.post(`http://127.0.0.1:8000/report_user/${params.user_id}`);
            }
        }
        else{
            window.location.href = "/login";
        }
      } catch (error) {
        console.error("Greška prilikom prijave korisnika:", error);
      }
    };

    const [atletskeSposobnosti, setAtletskeSposobnosti] = useState([]);

    useEffect(() => {
        if(userData !== null) {
            const fetchAtletskeSposobnostiData = async () => {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/user-sport/${params.user_id}`);
                    setAtletskeSposobnosti(response.data);
                } catch (error) {
                    console.error("Greška prilikom dohvatanja podataka:", error);
                }
            };
            fetchAtletskeSposobnostiData();
        }
    }, [userData]);

    return (
      (loading == true && userData !== null) ?
        (<div className="min-h-[100vh] bg-dark-color absolute top-0 w-full font-inter text-white">
            <i onClick={handleNavChange} className="fa-solid fa-bars fixed top-[20px] right-5 text-4xl z-30 text-gray-color lg:hidden"></i>
            <Header showNav={showNav}/>
            <div className="flex bg-dark-color flex-col-reverse mt-20 items-center mb-20 w-full sm:flex-row">
                <div className="profil-kontainerr flex items-start m-8 pt-20 flex-row w-full">
                    <div className="profil-prvi-blok flex flex-col justify-center items-center ml-[15rem] mr-10 sm:w-1/2">
                        <div className="w-full flex items-center flex-col shadow-2xl shadow-orange-color py-10 border-t-2 border-orange-color rounded-xl">
                            <p className="prvi-blok-tekst mb-1 bg-orange-color px-8 py-3 w-full text-center">PROFIL</p>
                            <Link to={`/user-and-hall/${params.user_id}`} className="w-full">
                                <p className="prvi-blok-tekst mb-1 hover:bg-orange-color px-8 py-3 w-full text-center">OGLASI ZA TERENE</p>
                            </Link>
                            <Link to={`/user-and-games/${params.user_id}`} className="w-full">
                                <p className="prvi-blok-tekst mb-1 hover:bg-orange-color px-8 py-3 w-full text-center">OGLASI ZA TERMINE</p>
                            </Link>
                            <Link to={`/komentari/${params.user_id}`} className="w-full">
                                <p className="prvi-blok-tekst mb-1 hover:bg-orange-color px-8 py-3 text-center">KOMENTARI</p>
                            </Link>
                        </div>
                        <div className="w-full inline-flex items-center py-8 justify-center">
                            <Link to='/chat' state={ {'user_id': params.user_id}}>
                            {!moguUreditiProfil && 
                                (<img src={icon1} alt="message" className="razgovor-ikonica lg:w-[33px] w-[7px] fill-slate-100 inline-flex mr-2" />)
                            }
                            {!moguUreditiProfil && 
                                (<span className="ms-1">Započni razgovor</span>)
                            }
                            </Link>
                        </div>
                    </div>
                    {showProfileDetails && (
                        <ProfileDetails
                            userData={userData}
                            profileImage={profileImage}
                            city={city}
                            atletskeSposobnosti={atletskeSposobnosti}
                            handleReportUser={handleReportUser}
                            reported = {reported}
                            updateShowEditProfile={updateShowEditProfile}
                            updateShowProfileDetails={updateShowProfileDetails}
                            moguUreditiProfil={moguUreditiProfil}
                        />
                    )}
                    {showEditProfile && (
                        <EditProfile
                            user_id={params.user_id}
                            updateShowEditProfile={updateShowEditProfile}
                            updateShowProfileDetails={updateShowProfileDetails}
                            handleRefresh={handleRefresh}
                            userData={userData}
                        />
                    )}
                </div>
            </div>
            <ToastContainer />
            <Footer/>
        </div>):
        (
            <div className="h-dvh bg-dark-color flex items-center justify-center">
                <HashLoader color="#B3C8CF" />            
            </div>
        )
    )
}