import HashLoader from "react-spinners/HashLoader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SportsPopUp from "../components/SportsPopUp";
import { useEffect, useState, useContext } from "react"
import logo from "/logo.png"
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserContext } from "../context/UserContext";
import { jwtDecode } from "jwt-decode";


export default function HallAds() {
    const [token, ] = useContext(UserContext)
    const user = jwtDecode(token)
    const [showSportsPopUp, setShowSportsPopUp] = useState(false)

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

    const options = { // for tost alert
        autoClose: 6000,
        hideProgressBar: false,
        position: "bottom-right",
        pauseOnHover: true,
      };


    const [showNav, setShowNav] = useState(true); // for mobile
    const handleNavChange = () => setShowNav(prevState => !prevState) // for mobile
    const [adsData, setAdsData] = useState({
        name: "",
        id_city: "1", // default value is Sarajevo
        address: "",
        start_of_working: "00:00",
        end_of_working: "00:00",
        description: "",
        no_of_players: 0,
        dimensions_width: 0,
        dimensions_height: 0,
        price: 0.0
    })
    const [photos, setPhotos] = useState([]) // photos for hall
    let selectedSports = [] // indexes for selected sports
    
    const handleChange = (e) =>  { // form changes
        setAdsData((prevData) => ({
          ...prevData,
          [e.target.name]: e.target.value,
        }));
        
      };

      const [rows, setRows] = useState([]); // splits photos for gallery, each row represents one group of photos
      function PhotoGallery() { // alghorithm for photo gallery
        let chunkSize = photos.length % 3 === 0 ? photos.length/3 -1 
                        : photos.length % 3 === 1 ? (photos.length -1) /3
                        : (photos.length -2) /3 ;
        setRows([]);
        
        if(chunkSize <= 0) chunkSize = 1
        // Split the photos array into groups of three
        for (let i = 0; i < photos.length; i += chunkSize) {
          const row = [];
          for (let j = i; j < i + chunkSize && j < photos.length; j++) {
            row.push(photos[j]);
            if (j === photos.length - 1) {
              break
            }
          }
          setRows((prevRows) => [...prevRows, row]);
        }  
    }
    useEffect(() => { // to update gallery after photos has been added
        PhotoGallery()
    }, [photos]);

    
    const handleSubmit = async (e) => { // form submit
        e.preventDefault();
        // validation for empty fields
        
        if (adsData.name == "" || adsData.address == "" 
        || adsData.start_of_working == "" 
        || adsData.end_of_working == ""
        || adsData.price == ""
        ) {
            toast.error("Molimo ispunite sva polja!", options)
        }
        else if (photos.length === 0) {
            toast.error("Molimo dodajte bar jednu sliku!", options)
        }
        else if ( adsData.no_of_players == 0
        ) {
            toast.error("Molimo dodajte maksimalan broj igrača", options)
        }
        else if ( adsData.dimensions_width == 0
        ) {
            toast.error("Molimo unesite validnu širinu terena (m)", options)
        }
        else if (adsData.dimensions_height == 0
        ) {
            toast.error("Molimo unesite validnu dužinu terena (m)", options)
        }
        else {
            try {
               sports.map((sport) => {
                   if (sport.selected === true) {
                    selectedSports.push(sport.id_sport)
                   }
               })
               if (selectedSports.length === 0) {
                selectedSports.push(32) // default value "Ostalo"
               }
                const AddHallResponse = await axios.post("http://localhost:8000/hall/add-all", {
                    hall:{name: adsData.name,
                        id_city: parseInt(adsData.id_city),
                        address: adsData.address,
                        start_of_working: adsData.start_of_working,
                        end_of_working: adsData.end_of_working,
                        description: adsData.description,
                        no_of_players: parseInt(adsData.no_of_players),
                        dimensions_width: parseInt(adsData.dimensions_width),
                        dimensions_height: parseInt(adsData.dimensions_height),
                        price: parseFloat(adsData.price),
                    },
                        photos: photos,
                        sports: selectedSports,
                        user_email: user.email
                });
                
                toast.success("Uspjesno ste objavili oglas za teren!", options);
                setTimeout(() => {
                    window.location.href = "/tereni/" + AddHallResponse.data.id_hall;
                }, 3000);
                
            } catch (error) {
                console.log("Error: ", error);
                toast.error("Doslo je do greške, molimo pokušajte ponovo!", options);
            }
            
        }
    }
    const handleChangeFile = (e) => {
        console.log(adsData)
        const file = e.target.files[0]
        const reader = new FileReader()
    
        reader.onload = (upload) => {
          console.log(upload.target.result)
          const img_data = upload.target.result
          setPhotos([...photos, img_data])
        }
        reader.readAsDataURL(file);
    
    };

    const [cities, setCities] = useState([]); // all cities from database
    const [sports, setSports] = useState([]); // all sports from database
  
  useEffect(() => { // getting all cities to use them in form
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/cities/all'); 
        const responseSports = await fetch('http://localhost:8000/sports/all');
        if (!response.ok || !responseSports.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const sportsData = await responseSports.json();
        
        setCities(data);
        const modifiedSports = sportsData.map((sport) => ({ // adding additional property selected to each sport
            ...sport,
            selected: false
        }))
        setSports(modifiedSports);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);
  
  const handleRemovePhoto = (photoToRemove) => { // remove photo from gallery
    const updatedPhotos = photos.filter(photo => photo !== photoToRemove);
    setPhotos(updatedPhotos);

    const input = document.getElementById('hall-ads-photo-input');
    input.value = null; // just sets input value back to null
    };

    

    const handleSportSelect = (sport) => { // select/unselect sport
        const updatedSports = sports.map((s) => {
            if (s.id_sport === sport.id_sport) {
                return { ...s, selected: !s.selected };
            }
            return s;
        });
        setSports(updatedSports);
    };


    return (
        <div className="hall-ads">
            <i onClick={handleNavChange} className="fa-solid fa-bars fixed top-[20px] right-5 text-4xl z-30 text-gray-color lg:hidden"></i>
            <img src={logo} alt="sportsmate matcher logo" className='w-[100px] lg:hidden fixed left-1 top-0 z-30' />
            <Header showNav={showNav}/>
            <h2 className="mb-10">Objavi oglas za svoj teren</h2>
            <div className="hall-ads-content">
                <div style={{ width: '80%', margin: 'auto' }}>
                    <form onSubmit={handleSubmit} className="w-full mx-auto">
                        <div className="flex flex-wrap  mb-6">
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <div className="w-full px-3 mb-6 md:mb-0">
                                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="name">
                                        Naziv terena
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={adsData.name}
                                        className="appearance-none block w-full bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent"
                                        type="text"
                                        name="name"
                                        placeholder="Unesi naziv terena..."
                                        
                                    />
                                </div>
                                <div className="w-1/2 px-3 mb-6 md:mb-0 inline-block">
                                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="start_of_working">
                                        Početak radnog vremena
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={adsData.start_of_working}
                                        className="appearance-none block w-full bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent"
                                        type="time"
                                        name="start_of_working"
                                        id="start_of_working"
                                    />
                                </div>
                                <div className="w-1/2 px-3 mb-6 md:mb-0 inline-block">
                                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="end_of_working">
                                        Kraj radnog vremena
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={adsData.end_of_working}
                                        className="appearance-none block w-full bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent"
                                        type="time"
                                        name="end_of_working"
                                        id="end_of_working"
                                        placeholder="Kraj radnog vremena..."
                                        
                                    />
                                </div>
                                <div className="w-1/2 px-3 mb-6 md:mb-0 inline-block">
                                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="no_of_players">
                                        Maksimalan broj igrača
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={adsData.no_of_players}
                                        className="appearance-none block w-full bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent"
                                        type="number"
                                        name="no_of_players"
                                        id="no_of_players"
                                        placeholder="Maksimalan broj igrača..."
                                        
                                    />
                                </div>
                                <div className="w-1/2 px-3 mb-6 md:mb-0 inline-block">
                                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="id_city">
                                        Odaberi grad
                                    </label>
                                    <select
                                        value={adsData.id_city}
                                        onChange={(e) => handleChange(e)}
                                        name="id_city"
                                        className=" block w-full bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent hall-ads-select"
                                    >
                                        {cities.map(city => (
                                            <option key={`${city.id}-${city.name}`} value={city.id_city}>{city.name}</option>

                                        ))}
                                    </select>
                                </div>
                                <div className="w-full px-3 mb-6 md:mb-0">
                                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="address">
                                        Adresa
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={adsData.address}
                                        className="appearance-none block w-full bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent"
                                        type="text"
                                        name="address"
                                        placeholder="Unesi adresu terena..."
                                        
                                    />
                                </div>
                                <div className="w-1/2 px-3 mb-6 md:mb-0 inline-block">
                                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="dimensions_width">
                                        Širina terena
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={adsData.dimensions_width}
                                        className="appearance-none block w-full bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent"
                                        type="number"
                                        name="dimensions_width"
                                        id="dimensions_width"
                                        
                                    />
                                </div>
                                <div className="w-1/2 px-3 mb-6 md:mb-0 inline-block">
                                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="dimensions_height">
                                        Dužina terena
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={adsData.dimensions_height}
                                        className="appearance-none block w-full bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent"
                                        type="number"
                                        name="dimensions_height"
                                        id="dimensions_height"
                                        
                                    />
                                </div>
                                <div className="w-full px-3 mb-6 md:mb-0">
                                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="description">
                                        Cijena terena po satu
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={adsData.price}
                                        className="appearance-none block w-full bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent"
                                        type="number"
                                        name="price"
                                        placeholder=""
                                        id="price"
                                    />
                                </div>
                                <div className="w-full px-3 mb-6 md:mb-0">
                                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="description">
                                        Opis
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={adsData.description}
                                        className="appearance-none block w-full bg-transparent text-white border-b-2 border-orange-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-transparent"
                                        type="text"
                                        name="description"
                                        placeholder=""
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                
                                <div className="w-full px-3 mb-6 md:mb-0 hall-ads-sports">
                                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="dimensions_width">
                                        Odaberi za koje je sportove namjenjen teren
                                    </label>
                                    
                                    {showSportsPopUp ? (
                                        <>
                                            {sports.map(sport => (
                                                sport.selected === true ? <p key={sport.id_sport} className="selected-sport-text">{sport.sport_name}</p> : null
                                            ))}
                                            <Popup trigger=
                                                {<button
                                                    className="add-sports-btn rounded"
                                                    type="button"
                                                >Odaberi</button>}
                                                modal nested>
                                                {close => (
                                                    <div className='modal hall-ads-modal'>
                                                        <div>
                                                            <i className="hall-ads-close-btn fa-solid fa-x" onClick={() => close()}></i>
                                                        </div>
                                                        <div className='content'>
                                                            <SportsPopUp sports={sports} handleSportSelect={handleSportSelect} />
                                                        </div>
                                                    </div>
                                                )}
                                            </Popup>
                                        </>
                                    ) : (
                                        <div className="big-screen-sporst">
                                            <SportsPopUp sports={sports} handleSportSelect={handleSportSelect} />
                                        </div>
                                    )}


                                    
                                    
                                </div>
                                <div className="w-full px-3 mb-6 mt-3 md:mb-0 hall-ads-photos">
                                    <label className="block uppercase tracking-wide text-white text-xs font-bold mb-2" htmlFor="description">
                                        Dodajte slike
                                    </label>
                                    <div className="row">
                                        {rows.map((row, rowIndex) => (
                                            <div key={rowIndex} className="column">
                                            {row.map((photo, photoIndex) => {
                                                // Generate a unique key using both rowIndex and photoIndex
                                                const uniqueKey = `${rowIndex}-${photoIndex}`;
                                                return (
                                                    <div key={uniqueKey} className="container">
                                                        <img src={photo} alt={`Photo ${photoIndex}`} className="image" />
                                                        <div className="overlay">
                                                            <i className="fa-solid fa-trash trash-img" onClick={() => handleRemovePhoto(photo)}></i>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-start">

                                    <input
                                        id="hall-ads-photo-input"
                                        onChange={e => handleChangeFile(e)}
                                        type="file"
                                        placeholder="izaberite sliku"
                                        className="w-1/2 bg-transparent text-white-color border-b-[1px] m-0 border-orange-color p-2"
                                    />
                                </div>
                            </div>
                            {/* Add other input fields similarly */}
                        </div>
                        <div className="flex justify-center hall-ads-submit-btn">
                            <button
                            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                            >
                            Submit
                            </button>
                        </div>
                    </form>
                    <ToastContainer />
                </div>
            </div>
            
            
            <Footer />
        </div>
    )
}
