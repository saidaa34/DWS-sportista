import StatsAdmin from "../components/StatsAdmin";
import ChartAdmin from "../components/ChartAdmin";
import axios from "axios";
import { useState, useEffect, useContext } from "react";
import AllUsersAdmin from "../components/AllUsersAdmin";
import UserReports from "../components/UserReports";
import AdminHallAdsList from "../components/AdminHallAdsList";
import AdminGameAdsList from "../components/AdminGameAdsList";
import { UserContext } from "../context/UserContext";
import { jwtDecode } from "jwt-decode";


const Admin = () => {
    const [token] = useContext(UserContext);
    const user = jwtDecode(token)
    const [femaleUsers, setFemaleUsers] = useState(0);
    const [maleUsers, setMaleUsers] = useState(0);
    const [noOfGameAds, setNoOfGameAds] = useState(0);
    const [noOfHallAds, setNoOfHallAds] = useState(0);
    const [showNav, setShowNav] = useState(true);
    const handleNavChange = () => setShowNav((prevState) => !prevState);

    const [showAllUsers, setShowAllUsers] = useState(false);
    const [showUserReports, setShowUserReports] = useState(false);
    const [showAllHallAds, setShowAllHallAds] = useState(false);
    const [showReportedHallAds, setShowReportedHallAds] = useState(false);
    const [showAllGameAds, setShowAllGameAds] = useState(false);

    const handleLogOut = () => {
        localStorage.removeItem("token");
        window.location = "/";
      };

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setShowNav(false);
        } else {
            setShowNav(true);
        }
    }, [window.innerWidth]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/male-users')
            .then(response => {
                setMaleUsers(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/female-users')
            .then(response => {
                setFemaleUsers(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/no-of-hall-ads')
            .then(response => {
                setNoOfHallAds(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/no-of-game-ads')
            .then(response => {
                setNoOfGameAds(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    const [loading, setIsLoading] = useState(false);
    
    useEffect(() => {
        const timerId = setTimeout(() => {
            setIsLoading(true);
        }, 1500);
  
        return () => clearTimeout(timerId);
    }, []);

    const setAllShowFalse = () => { // resets all show states to false
        setShowAllUsers(false);
        setShowUserReports(false);
        setShowAllHallAds(false);
        setShowReportedHallAds(false);
        setShowAllGameAds(false);
    }

    const handleShowAllUsers = () => {
        setAllShowFalse()
        setShowAllUsers(true);
        
    }

    const handleShowDashboard = () => {
        setAllShowFalse()
        setShowAllUsers(false);
        setShowUserReports(false);
    }

    const handleShowUserReports = () => {
        setAllShowFalse()
        setShowUserReports(true);
        
    }
    const handleShowAllHallAds = () => {
        setAllShowFalse()
        setShowAllHallAds(true);
    }
    const handleShowReportedHallAds = () => {
        setAllShowFalse()
        setShowReportedHallAds(true);
    }
    const handleShowGameAds = () => {
        setAllShowFalse()
        setShowAllGameAds(true);
    }
    
    const checkForDashboard = () => {
        if (showAllUsers || showUserReports || showAllHallAds || showReportedHallAds || showAllGameAds) {
            return false
        } else {
            return true
        }
    }

    return ( 
        <div className="admin h-dvh">
            <div className="sidebar">
                <div className='flex flex-row justify-center'>
                    
                    <div className="admin-info">
                        <p>{user.name} {user.surname}</p>
                        <p>admin</p>
                    </div>
                </div>
                <nav className="nav-admin">
                    <ul>
                        <li onClick={handleShowDashboard}>Dashboard</li>
                        <li>Korisnici
                            <ul>
                                <li className="admin-nav-option" onClick={handleShowAllUsers}>Svi korisnici</li>
                                <li className="admin-nav-option" onClick={handleShowUserReports}>Prijave korisnika</li>
                            </ul>
                        </li>
                        <li>Oglasi
                            <ul>
                                <li className="admin-nav-option" onClick={handleShowAllHallAds}>Svi oglasi za terene</li>
                                <li className="admin-nav-option" onClick={handleShowGameAds}>Svi oglasi za termine</li>
                                <li className="admin-nav-option" onClick={handleShowReportedHallAds}>Prijavljeni oglasi za terene</li>
                                
                            </ul>
                        </li>
                    </ul>
                </nav>
                <button className="logout-button bg-red-color" onClick={handleLogOut}>Odjavi se</button>
            </div>
            <main className="main-admin">
                {showAllUsers && (
                    <div className="all-users-admin flex">
                        <AllUsersAdmin />
                    </div>
                )}
                {showUserReports && (
                    <UserReports />
                )}
                {checkForDashboard() && (
                    <div className="admin-main">
                        <StatsAdmin maleUsers={maleUsers} femaleUsers={femaleUsers} noOfGameAds={noOfGameAds} noOfHallAds={noOfHallAds} />
                        <ChartAdmin maleUsers={maleUsers} femaleUsers={femaleUsers}/>
                    </div>
                )}
                {showAllHallAds && (
                    <AdminHallAdsList reported={false}/>
                )}
                {showReportedHallAds && (
                    <AdminHallAdsList reported={true}/>
                )}
                {showAllGameAds && (
                    <AdminGameAdsList />
                )}
            </main>
        </div>
    );
}
 
export default Admin;