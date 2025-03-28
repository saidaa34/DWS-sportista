import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import HashLoader from "react-spinners/HashLoader";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { UserContext } from "../context/UserContext";
import logo from "/logo.png";
import Card from "../components/Card";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import ReportHallAdPopUp from "../components/ReportHallAdPopUp";
import { jwtDecode } from "jwt-decode";

const HallDetail = () => {
  const [token] = useContext(UserContext);
  const [showNav, setShowNav] = useState(true);
  const [loading, setIsLoading] = useState(true);
  const [oglas, setOglas] = useState({});
  const [oglas_user, setOglasUser] = useState({});
  const [slicni_oglasi, setSlicniOglasi] = useState([]);
  const [trenutnaSlika, setTrenutnaSlika] = useState("");
  const handleNavChange = () => setShowNav((prevState) => !prevState);
  const api_link = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const hallId = parseInt(id); // Pretvaranje stringa u cijeli broj

  const [adReported, setAdReported] = useState(false);

  useEffect(() => {
    axios
      .get(`${api_link}/get_hall/${hallId}`)
      .then((res) => {
        console.log(res.data);
        setIsLoading(false);
        setOglas(res.data.oglas[0].hall);
        setOglasUser(res.data.oglas[0].user);
        setSlicniOglasi(res.data.slicni_oglasi);

        console.log("user oglas", res.data.oglas[0].user);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if(token) {
      const user = jwtDecode(token)
      axios
        .get(`${api_link}/hall/is-reported/${hallId}/${user.id_user}`)
        .then((res) => {
          setAdReported(res.data.is_reported);
        })
        .catch((err) => console.log(err));
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setShowNav(false);
    } else {
      setShowNav(true);
    }
  }, [window.innerWidth]);

  async function reportHallAd() {
    if(token) {
      const user = jwtDecode(token)
      const AddHallResponse = await axios.post(`http://localhost:8000/halls/report/${id}/${user.id_user}`)
      .then(response => {
        setAdReported(true);
        console.log("Uspjesno",response.data);
      })
      .catch(error => {
        console.error(error);
      });
    }

  }

  return (
    <>
      {!loading ? (
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
          <div className="flex flex-col md:flex-row mb-10 mt-[155px]">
            <div className="md:w-1/2 mb-10 md:mb-0 px-10 md:border-r-2 ">
              <div className="flex flex-col justify-between space-y-3  md:h-[500px] items-center">
                <div className="w-full border-[1px] border-slate-300 h-full rounded-lg flex items-center justify-center">
                  <img
                    src={trenutnaSlika || oglas.photos[0].photo}
                    alt="Teren slika"
                    className=" w-fit md:w-[500px] h-fit"
                  />
                </div>

                <div className="flex flex-wrap h-fit border-b-[1px] space-x-3 md:h-24 rounded-lg items-start md:items-center md:justify-center w-full">
                  {oglas.photos.map((slika, index) => (
                    <img
                      onClick={() => setTrenutnaSlika(slika.photo)}
                      className="w-20 h-20 hover:opacity-40 my-2 rounded-sm "
                      key={index}
                      src={slika.photo}
                    ></img>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:w-1/2 md:px-3 flex md:block flex-col w-10/12 m-auto items-start ">
              <div className="flex space-x-4">
                <div className="flex flex-col md:flex-row md:items-center space-x-2 bg-slate-300 text-black mb-4 w-fit px-3 py-2 rounded-lg">
                  <p className="uppercase font-semibold text-xs text-orange-color  ">
                    Korisnik:
                  </p>

                  <div className="flex items-center space-x-2">
                    <Link to={"/users2/" + oglas_user.id_user}>
                      <img
                        src={oglas_user.profile_photo}
                        className="w-12 h-12 rounded-full"
                      ></img>
                    </Link>
                    <p className="first-letter:uppercase">
                      {oglas_user.name} {oglas_user.surname}
                    </p>
                  </div>
                </div>

                {token ? (
                  ""
                ) : (
                  <div className="flex items-center space-x-2 bg-slate-300 text-black mb-4 w-fit px-3 py-2 rounded-lg">
                    <Link to="/login" className="flex items-center space-x-2">
                      <img
                        src={"/man-profile-icon.png"}
                        className="w-12 h-12 rounded-full"
                      ></img>
                      <p className="">Prijavite se!</p>
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center md:items-start">
                <div className="flex flex-col border-2 bg-slate-300 p-4 text-black w-full md:w-11/12 mb-3 rounded-md">
                  <p className="text-md uppercase font-semibold mb-3">Teren</p>
                  <p className="pl-4 ">{oglas.name}</p>
                </div>
                <div className="flex flex-col md:flex-row w-full md:w-11/12 space-y-2 md:space-x-2">
                  <div className="flex flex-col border-2 bg-slate-300 p-4 text-black w-full md:w-1/3 rounded-md">
                    <p className="font-semibold pb-2 text-md uppercase">
                      Lokacija
                    </p>
                    <p className="pl-3">Grad: {oglas.city.name}</p>
                    <p className="pl-3">Adresa: {oglas.address}</p>
                  </div>
                  <div className="flex flex-col border-2 bg-slate-300 p-4 text-black w-full  md:w-1/3 rounded-md">
                    <p className="font-semibold pb-2 text-md uppercase">
                      Radno vrijeme
                    </p>
                    <p className="pl-3">Pocetak: {oglas.start_of_working} </p>
                    <p className="pl-3">Kraj: {oglas.end_of_working}</p>
                  </div>
                  <div className="flex flex-col border-2 bg-slate-300 p-4 text-black w-full md:w-1/3 rounded-md">
                    <p className="font-semibold pb-2 text-md uppercase">
                      Sportovi:
                    </p>
                    {oglas.sports_associations.map((sportovi) => {
                      return (
                        <p className="pl-4 pb-2" key={sportovi.id_sport}>
                          {" "}
                          {sportovi.sport.sport_name}
                        </p>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col border-2 mt-3 bg-slate-300 p-4 text-black w-full md:w-11/12 rounded-md">
                  <p className="font-semibold pb-2 text-md uppercase">
                    Opis terena:
                  </p>
                  <p className="pl-4">{oglas.description}</p>
                </div>
                <div className="w-full md:w-11/12 flex space-x-2">
                  <div className="flex items-center border-2 mt-3 bg-slate-300 text-black w-1/2 rounded-md">
                    <p className="font-semibold text-md uppercase pl-4">
                      Cijena: {oglas.price} $
                    </p>
                  </div>
                  <Link
                    className="flex flex-col hover:bg-green-700 border-2 mt-3 bg-green-600 p-2 text-black w-1/2 rounded-md"
                    to={`/tereni/iznajmi-teren/${oglas.id_hall}`}
                    state={{oglas:oglas, userRent:oglas_user}} 
                  >
                    <button className=" text-center uppercase text-white font-bold py-2 px-4 rounded">
                      Rezervisite termin
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          

            {adReported ? (
              <div className="flex justify-end">
                <button style={{opacity: '0.5'}}
                className="text-center text-white italic font-light py-2 px-5 rounded"
                >
                  Oglas je prijavljen
                </button>
              </div>
            ) : (
              <Popup trigger=
                {<div className="flex justify-end">
                    <button 
                    className="text-center text-white italic font-light py-2 px-5 rounded"
                    >
                      Prijavi oglas
                    </button>
                </div>}
                modal nested>
                {close => (
                    <div className='modal hall-ads-modal hall-ads-report-modal'>
                        <div>
                            <i className="hall-ads-close-btn fa-solid fa-x" onClick={() => close()}></i>
                        </div>
                        <div className='content' style={{margin:"auto"}}>
                          <ReportHallAdPopUp token={token} handleReportSubmit={() => reportHallAd()} />
                        </div>
                    </div>  
                )}
            </Popup>
            )}
          
          <h1 className="text-2xl text-center uppercase my-3">Slicni oglasi</h1>
          <div className="flex justify-around flex-col md:flex-row w-full mb-10">
            {slicni_oglasi.map((oglas) => {
              return (
                <div
                  key={oglas.id_hall}
                  className="w-10/12 m-auto mb-12 md:mb-0 md:m-0 md:w-2/12 flex flex-col space-y-2.5 border-2 border-orange-color bg-dark-color"
                >
                  <Card
                    key={oglas.id_hall}
                    id={oglas.id_hall}
                    title={oglas.name}
                    photo={
                      oglas.photos.length > 0
                        ? oglas.photos[0].photo
                        : undefined
                    }
                    lokacija={oglas.location}
                    price={oglas.price}
                    alt={oglas.name}
                  />
                </div>
              );
            })}
          </div>

          <Footer />
        </div>
      ) : (
        <div className="h-dvh bg-dark-color flex items-center justify-center">
          <HashLoader color="#B3C8CF" />
        </div>
      )}
    </>
  );
};

export default HallDetail;
