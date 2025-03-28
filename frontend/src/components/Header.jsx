import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useContext } from "react";
import logo from "/logo.png";
import { UserContext } from "../context/UserContext";
import { jwtDecode } from "jwt-decode";
import femaleIcon from "/woman.png";
import maleIcon from "/man.png";

import { io } from "socket.io-client";
import axios from "axios";
import Noticifations from "./Noticifations";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:8000", {
  path: "/sockets",
});

export default function Header({ showNav }) {
  const [addHover, setAddHover] = useState(false);
  const [mobileDropdowns, setMobileDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeNotifications, setActiveNotifications] = useState(null);
  const [profileOpt, setProfileOpt] = useState(false);
  const [token] = useContext(UserContext);
  const [decodedToken, setDecodedToken] = useState(null);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const api_link = import.meta.env.VITE_API_URL;
  const [user, setUser] = useState()
  useEffect(() => {
    if (token) {
      const decode = jwtDecode(token);
      setDecodedToken(decode);
      setUser(decode)
    }
  }, [token]);

  const dropdownTimeout = useRef(null);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setAddHover(false);
      setMobileDropdown(true);
    } else {
      setAddHover(true);
    }
  }, []);

  const handleLogOut = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const handleMouseEnter = (dropdown) => {
    clearTimeout(dropdownTimeout.current);
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = (dropdown) => {
    dropdownTimeout.current = setTimeout(() => {
      if (activeDropdown === dropdown) {
        setActiveDropdown(null);
      }
    }, 200);
  };


  return (
    <header
      className={`${
        showNav === true ? "fixed" : "hidden"
      } top-[0] w-full flex flex-col lg:flex-row justify-center lg:justify-between lg:px-14 font-inter items-center text-gray-color font-[500] text-[20px] lg:h-[125px] h-full bg-dark-color lg:border-b lg:border-orange-color z-20 gap-20 lg:gap-0 select-none `}
    >
      <img
        src={logo}
        alt="sportsmate matcher logo"
        className="w-[125px] lg:static hidden lg:block"
      />
      <nav className="lg:mr-auto lg:ml-5 mx-auto h-full fixed flex items-center lg:h-auto lg:static lg:block">
        <ul className="flex flex-col lg:flex-row gap-10 lg:gap-20 items-center">
          <li
            className={`relative ${
              addHover ? "before-hover" : ""
            } transition-all`}
          >
            <Link to="/">Početna</Link>
          </li>
          {mobileDropdowns && (
            <>
              <li
                className={`relative ${
                  addHover ? "before-hover" : ""
                } transition-all`}
              >
                <Link to="/oglasi/tereni">Tereni</Link>
              </li>
              <li
                className={`relative ${
                  addHover ? "before-hover" : ""
                } transition-all`}
              >
                <Link to="/oglasi/termini">Termini</Link>
              </li>
              <li
                className={`relative ${
                  addHover ? "before-hover" : ""
                } transition-all`}
              >
                <Link to="/objavi-oglas-termina">Kreiraj oglas termin</Link>
              </li>
              <li
                className={`relative ${
                  addHover ? "before-hover" : ""
                } transition-all`}
              >
                <Link to="/objavi-oglas-teren">Kreiraj oglas terena</Link>
              </li>
              {decodedToken ? (
                <>
                  <Link to={`/users2/${decodedToken.id_user}`}>
                    <li className="md:hover:bg-gray-600 py-2 pt-5">
                      Moj profil
                    </li>
                  </Link>
                  <li
                    className="py-2 pt-5 border-gray-color md:hover:bg-gray-600 transition-all cursor-pointer"
                    onClick={handleLogOut}
                  >
                    Odjava
                  </li>
                </>
              ) : (
                <>
                  <li
                    className={`relative ${
                      addHover ? "before-hover" : ""
                    } transition-all`}
                  >
                    <Link to="/login">Prijavi se</Link>
                  </li>
                  <li>|</li>
                  <li
                    className={`relative ${
                      addHover ? "before-hover" : ""
                    } transition-all`}
                  >
                    <Link to="/register">Registruj se</Link>
                  </li>
                </>
              )}
            </>
          )}
          {!mobileDropdowns && (
            <li
              className={`relative ${
                addHover ? "before-hover" : ""
              } transition-all`}
              onMouseEnter={() => handleMouseEnter("dropdown1")}
              onMouseLeave={() => handleMouseLeave("dropdown1")}
            >
              Oglasi
              {!mobileDropdowns && activeDropdown === "dropdown1" && (
                <ul
                  className="absolute top-full left-0 mt-2 w-[250px] bg-gray-500  shadow-lg rounded-[5px]"
                  onMouseEnter={() => handleMouseEnter("dropdown1")}
                  onMouseLeave={() => handleMouseLeave("dropdown1")}
                >
                  <Link to="/oglasi/tereni">
                    <li className="hover:bg-gray-600 text-white py-4 pl-3 border-b border-gray-color text-[17px] ">
                      Pregled terena
                    </li>
                  </Link>
                  <Link to="/oglasi/termini">
                    <li className="hover:bg-gray-600 text-white py-4 pl-3 text-[17px] ">
                      Pregled termina
                    </li>
                  </Link>
                </ul>
              )}
            </li>
          )}
          {!mobileDropdowns && (
            <li
              className={`relative ${
                addHover ? "before-hover" : ""
              } transition-all`}
              onMouseEnter={() => handleMouseEnter("dropdown2")}
              onMouseLeave={() => handleMouseLeave("dropdown2")}
            >
              <Link to="#">Kreiraj oglas</Link>
              {activeDropdown === "dropdown2" && (
                <ul
                  className="absolute top-full left-0 mt-2 w-[250px] bg-gray-500 shadow-lg  rounded-[5px] "
                  onMouseEnter={() => handleMouseEnter("dropdown2")}
                  onMouseLeave={() => handleMouseLeave("dropdown2")}
                >
                  <Link to="/objavi-oglas-teren">
                    <li className="hover:bg-gray-600 text-white py-4 pl-3 text-[17px] border-b border-gray-color">
                      Kreiraj oglas terena
                    </li>
                  </Link>
                  <Link to="/objavi-oglas-termina">
                    <li className="hover:bg-gray-600 text-white py-4 pl-3 text-[17px]">
                      Kreiraj oglas termin
                    </li>
                  </Link>
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>
      <nav>
        {!mobileDropdowns &&
          (decodedToken ? (
            <div className="relative flex items-center gap-5 ">
              <Link to='/chat'
                className="fa-solid fa-comments text-orange-color text-2xl cursor-pointer md:hover:opacity-50"
              ></Link>
              <i
                className="fa-solid fa-bell text-orange-color text-2xl cursor-pointer md:hover:opacity-50"
                onClick={() =>
                  setActiveNotifications((prevState) => !prevState)
                }
              ></i>
              <Noticifations activeNotifications={activeNotifications} />
              <img
                src={decodedToken.sex === "male" ? maleIcon : femaleIcon}
                className="md:hover:opacity-50 cursor-pointer transition-all"
                onClick={() => setProfileOpt((prevState) => !prevState)}
              />
              {profileOpt && (
                <ul className="absolute bottom-[-120px] right-[10px] text-[17px] bg-gray-500 text-gray-color w-[200px] text-center select-none rounded">
                  <Link to={`/users2/${decodedToken.id_user}`}>
                    <li
                      className="md:hover:bg-gray-600 py-2 pt-5 border-b border-gray-color"
                      onClick={() => {
                        setTimeout(() => {
                          window.location.reload();
                        }, 500);
                      }}
                    >
                      Moj profil
                    </li>
                  </Link>
                  <li
                    className="py-2 pt-5 border-gray-color md:hover:bg-gray-600 transition-all cursor-pointer"
                    onClick={handleLogOut}
                  >
                    Odjava
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <ul className="flex gap-1 items-center">
              <li
                className={`relative ${
                  addHover ? "before-hover" : ""
                } transition-all`}
              >
                <Link to="/login">Prijavi se</Link>
              </li>
              <li>|</li>
              <li
                className={`relative ${
                  addHover ? "before-hover" : ""
                } transition-all`}
              >
                <Link to="/register">Registruj se</Link>
              </li>
            </ul>
          ))}
      </nav>
    </header>
  );
}
