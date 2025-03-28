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
import { UserContext } from "../context/UserContext";
import { jwtDecode } from "jwt-decode";
import starIconEmpty from "/star-svgrepo-com.svg";
import starIconFilled from "/star-svgrepo-com2.svg"; 

function formatTime(timeString) {
    const commentDate = new Date(timeString);
    const formattedCommentTime = `${commentDate.getDate()}.${commentDate.getMonth() +
      1}.${commentDate.getFullYear()}., ${commentDate.getHours()}:${(
      "0" + commentDate.getMinutes()
    ).slice(-2)}`;
    return formattedCommentTime;
}

export default function Comments() {
    const [userLogin, setUserLogin] = useState({ email: "", password: "" });
    const params = useParams();
    const isInitialMount = useRef(true); // Ref za provjeru prvog montiranja
    const [loading, setIsLoading] = useState(false);
    const [token, ] = useContext(UserContext)
    const signedIn = localStorage.getItem("token") !== null;
    const [logovaniUser, setLogovaniUser] = useState(null);
    const [showZapocniRazgovor, setShowZapocniRazgovor] = useState(true);
    
    useEffect(() => {
        if (signedIn) {
            const user = jwtDecode(token);
            setShowZapocniRazgovor(user.id_user != params.user_id);
            setLogovaniUser(user.id_user);
        }
    }, [signedIn, token]);

    const handleRefresh = () => {
        window.location.reload();
    };
    
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

    const [komentari, setKomentari] = useState([]);

    useEffect(() => {
        const fetchUserComments = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/komentari/${params.user_id}`);
                setKomentari(response.data);
            } catch (error) {
                console.error("Greška prilikom dohvatanja komentara:", error);
            }
        };
        fetchUserComments();
    }, [])

    const [newComment, setNewComment] = useState("");

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleCommentSubmit = async(e) => {
        e.preventDefault();
        if(!signedIn) {
            window.location.href = "/login";
            toast.error("Morate se prvo prijavti!", options);
        }
        
        else if (newComment.trim().length === 0) {
            toast.error("Komentar ne može biti prazan.");
        }

        else {
            try {
                await axios.post(`http://127.0.0.1:8000/komentari/${params.user_id}`, { 
                    comment: newComment,
                    id_user_got_comment: params.user_id,
                    id_user_who_commented: logovaniUser
                });
            } catch (error) {
                toast.error("Greška prilikom dodavanja komentara.");
                console.error("Error submitting comment:", error);
            }
        }
        handleRefresh();
    }

    useEffect(() => {
        if (newComment.trim().length === 200) {
            toast.error("Dostigli ste maksimalan broj karaktera.");
        }
    }, [newComment]);

    const inputRef = useRef(null);
    const focusInput = () => {
        inputRef.current.focus(); 
    };

    const [rating, setRating] = useState(null);
    const [hover, setHover] = useState(null);

    const [average, setAverage] = useState(0.0);

    useEffect(() => {
        const fetchUserStars = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/prosjek-zvjezdica/${params.user_id}`);
                setAverage(response.data);
            } catch (error) {
                console.error("Greška prilikom dohvatanja prosjeka:", error);
            }
        };
        fetchUserStars();
    }, []);
    

    const handleStarClick = async (currentRating) => {
        setRating(currentRating);
        if (!signedIn) {
            window.location.href = "/login";
            toast.error("Morate se prvo prijaviti!", options);
        } else {
            try {
                const res = await axios.get(`http://127.0.0.1:8000/zvjezdice/${params.user_id}/${logovaniUser}`);
                console.log("logovaniUser:", logovaniUser, "params.user_id:", params.user_id, "Res:", res.data);
                if (!res.data) {
                    await axios.post(`http://127.0.0.1:8000/zvjezdice/${params.user_id}`, {
                        id_user_got_stars: params.user_id,
                        id_user_who_rated: logovaniUser,
                        no_of_stars: currentRating
                    });
                } else {
                    await axios.put(`http://127.0.0.1:8000/zvjezdice/${params.user_id}`, {
                        id_user_got_stars: params.user_id,
                        id_user_who_rated: logovaniUser,
                        no_of_stars: currentRating
                    });
                }
                handleRefresh();
            } catch (error) {
                console.error("Greška:", error);
            }
        }
    };

    return (
      (loading == true && userData !== null) ?
        (<div className="min-h-[100vh] bg-dark-color absolute top-0 w-full font-inter text-white">
            <i onClick={handleNavChange} className="fa-solid fa-bars fixed top-[20px] right-5 text-4xl z-30 text-gray-color lg:hidden"></i>
            <Header showNav={showNav}/><div className="flex bg-dark-color flex-col-reverse mt-20 items-center mb-0 w-full sm:flex-row justify-center">
            <div className="flex items-center pt-20 flex-row">
                <div className="profil-prvi-blok-kom flex flex-col justify-center items-center mr-[150px] w-80">
                    <div className="w-full flex items-center flex-col shadow-2xl shadow-orange-color py-10 border-t-2 border-orange-color rounded-xl">
                        <Link to={`/users2/${params.user_id}`} className="w-full">
                            <p className="prvi-blok-tekst mb-1 hover:bg-orange-color px-8 py-3 text-center">PROFIL</p>
                        </Link>
                        <Link to={`/user-and-hall/${params.user_id}`} className="w-full">
                            <p className="prvi-blok-tekst mb-1 hover:bg-orange-color px-8 py-3 w-full text-center">OGLASI ZA TERENE</p>
                        </Link>
                        <Link to={`/user-and-games/${params.user_id}`} className="w-full">
                            <p className="prvi-blok-tekst mb-1 hover:bg-orange-color px-8 py-3 w-full text-center">OGLASI ZA TERMINE</p>
                        </Link>
                        <p className="prvi-blok-tekst mb-1 bg-orange-color px-8 py-3 w-full text-center">KOMENTARI</p>
                    </div>
                    <div className="w-full inline-flex items-center py-8 justify-center">
                        {showZapocniRazgovor && 
                            (<img src={icon1} alt="message" className="razgovor-ikonica lg:w-[33px] w-[7px] fill-slate-100 inline-flex mr-2" />)
                        }
                        {showZapocniRazgovor && 
                            (<span className="ms-1">Započni razgovor</span>)
                        }
                    </div>
                </div>
            </div>
            <div className="text-center justify-center items-center h-full flex flex-col pt-14">
                <h1 className="mb-3">
                    {profileImage !== './man-profile-icon.png' && profileImage !== './woman-profile-icon.png' && profileImage ? (
                        <img src={profileImage} className="profilna-slika"/>
                    ) : (
                        userData.sex === "male" ? (
                            <img src={manProfilePhoto} className="profilna-slika"/>
                        ) : (
                            userData.sex === "female" ? (
                                <img src={womanProfilePhoto} className="profilna-slika"/>
                            ) : null
                        )
                    )}
                </h1>
                <p>{userData.name} {userData.surname}</p>
                <div>
                    {[...Array(5)].map((star, index) => {
                        const currentRating = index + 1;
                        return (
                            <label
                                key={index} // Dodavanje jedinstvenog ključa
                                onMouseEnter={() => setHover(currentRating)}
                                onMouseLeave={() => setHover(null)}
                                onClick={() => setRating(currentRating)}
                                className="cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name="rating"
                                    value={currentRating}
                                    className="hidden"
                                />
                                <img
                                    src={currentRating <= (hover || rating) ? starIconFilled : starIconEmpty}
                                    alt="rating star"
                                    className="zvjezdice w-8 h-8 lg:w-10 lg:h-10 fill-slate-100 inline-flex mr-1 mt-2"
                                    onClick={() => handleStarClick(currentRating)}
                                />
                            </label>
                        );
                    })}
                </div>
                <p className="mt-2 text-sm italic">Ocjena: {average.toFixed(2)}</p>
            </div>
        </div>
        <div className="comments-container">
            <div className="novi-komentar flex">
                <button className="bg-orange-color text-white px-4 py-2 rounded m-5 mt-0" onClick={focusInput}>
                    + NOVI KOMENTAR
                </button>
            </div>
            <div className="comments">
                <div className="comments-column">
                {Array.from({ length: Math.ceil(komentari.length / 2) }).map((_, index) => (
                    <div className="comments-row flex justify-between mb-5" key={index}>
                        {komentari[index * 2] && (
                        <div className="comment flex flex-row shadow-2xl shadow-orange-color pr-12 py-7 border-t-2 border-orange-color rounded-xl mr-10">
                            <div className="flex flex-col w-[200px] items-center m-auto">
                            {komentari[index * 2].profile_photo !== './man-profile-icon.png' && komentari[index * 2].profile_photo !== './woman-profile-icon.png' && profileImage ? (
                                <Link to={`/users2/${komentari[index * 2].id_user_who_commented}`}>
                                    <img src={komentari[index * 2].profile_photo} className="profilna-slika-kom"/>
                                </Link> 
                            ) : (
                                komentari[index * 2].profile_photo === './man-profile-icon.png' ? (
                                    <Link to={`/users2/${komentari[index * 2].id_user_who_commented}`}>
                                        <img src={komentari[index * 2].profile_photo} className="profilna-slika-kom"/>
                                    </Link> 
                                ) : (
                                komentari[index * 2].profile_photo === './woman-profile-icon.png' ? (
                                    <Link to={`/users2/${komentari[index * 2].id_user_who_commented}`}>
                                        <img src={komentari[index * 2].profile_photo} className="profilna-slika-kom"/>
                                    </Link> 
                                ) : null
                                )
                            )}
                            <Link to={`/users2/${komentari[index * 2].id_user_who_commented}`}>
                                <p>{komentari[index * 2].name} {komentari[index * 2].surname}</p>
                            </Link> 
                            </div>
                            <div className="comment-text flex flex-col text-left w-80">
                                <p className="italic font-medium pb-3 text-lg">Komentar:</p>
                                <p className="mb-5">{komentari[index * 2].comment}</p>
                                <p className="mt-auto text-right italic text-sm">{formatTime(komentari[index * 2].time_of_comment)}</p>
                            </div>
                        </div>
                        )}
                        {komentari[index * 2 + 1] && (
                        <div className="comment flex flex-row shadow-2xl shadow-orange-color pr-12 py-7 border-t-2 border-orange-color rounded-xl">
                            <div className="flex flex-col w-[200px] items-center m-auto">
                            {komentari[index * 2 + 1].profile_photo !== './man-profile-icon.png' && komentari[index * 2 + 1].profile_photo !== './woman-profile-icon.png' && profileImage ? (
                                <Link to={`/users2/${komentari[index * 2 + 1].id_user_who_commented}`}>
                                    <img src={komentari[index * 2 + 1].profile_photo} className="profilna-slika-kom"/>
                                </Link> 
                            ) : (
                                komentari[index * 2 + 1].profile_photo === './man-profile-icon.png' ? (
                                    <Link to={`/users2/${komentari[index * 2 + 1].id_user_who_commented}`}>
                                        <img src={komentari[index * 2 + 1].profile_photo} className="profilna-slika-kom"/>
                                    </Link> 
                                ) : (
                                komentari[index * 2 + 1].profile_photo === './woman-profile-icon.png' ? (
                                    <Link to={`/users2/${komentari[index * 2 + 1].id_user_who_commented}`}>
                                        <img src={komentari[index * 2 + 1].profile_photo} className="profilna-slika-kom"/>
                                    </Link> 
                                ) : null
                                )
                            )}
                            <Link to={`/users2/${komentari[index * 2 + 1].id_user_who_commented}`}>
                                <p>{komentari[index * 2 + 1].name} {komentari[index * 2 + 1].surname}</p>
                            </Link>
                            </div>
                            <div className="comment-text flex flex-col text-left w-80">
                            <p className="italic font-medium pb-3 text-lg">Komentar:</p>
                            <p className="mb-5">{komentari[index * 2 + 1].comment}</p>
                            <p className="mt-auto text-right italic text-sm">{formatTime(komentari[index * 2 + 1].time_of_comment)}</p>
                            </div>
                        </div>
                        )}
                    </div>
                ))}
                </div>
            </div>
            <div className="com-input-div flex comment-input-section mt-5 ">
                <input
                    type="text"
                    value={newComment}
                    onChange={handleCommentChange}
                    placeholder="Unesite komentar"
                    maxLength={200}
                    ref={inputRef}
                    className="com-input w-[565px] px-4 py-2 border rounded text-white bg-dark-color shadow-2xl shadow-orange-color pr-12 py-7 border-t-2 border-orange-color rounded-xl mr-10"
                />
                <button onClick={handleCommentSubmit} className="dodaj-kom-btn bg-orange-color text-white px-4 rounded h-[40px]">
                    Dodaj Komentar
                </button>
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