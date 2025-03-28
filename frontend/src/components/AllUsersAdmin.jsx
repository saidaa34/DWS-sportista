import axios from "axios";
import { useState, useEffect } from "react";
import HashLoader from "react-spinners/HashLoader";

const AllUsersAdmin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setIsLoading] = useState(false);
    const [cityNames, setCityNames] = useState([]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setIsLoading(true);
        }, 1500);

        return () => clearTimeout(timerId);
    }, []);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/all-users')
            .then((res) => {
                setUsers(res.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/all-city-names')
            .then((res) => {
                setCityNames(res.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <div className="all-users m-[1rem] flex flex-wrap justify-center items-center">
            {loading === true && users.length > 0 ? (
                users.map((user, index) => (
                    <div key={index} className="kartica-admin w-full flex flex-col mb-5 p-4">
                        <div className="profil-podaci-admin bg-white text-black flex flex-row rounded-[33px] shadow-lg">
                            <div className="profil-podaci-dijete-admin py-5 pt-12 flex flex-col w-full">
                                <p className="profil-stavke">Datum rođenja: {user.date_of_birth}</p>
                                <p className="profil-stavke">Spol: {user.sex}</p>
                                <p className="profil-stavke">Visina: {user.height} cm</p>
                                <p className="profil-stavke">Težina: {user.weight} kg</p>
                                <p className="profil-stavke">Grad: {cityNames[user.id_city]}</p>
                                <p className="profil-stavke">Broj odigranih igara: {user.no_of_games}</p>
                                <p className="profil-stavke">Bio: {user.bio}</p>
                            </div>
                            <div className="flex flex-col justify-center items-center py-5 px-5 pt-12 w-full">
                                <div className="text-center justify-center items-center h-full flex flex-col">
                                    <h1 className="mb-3">
                                        {user.profile_photo ? (
                                            <img src={atob(user.profile_photo)} className="profilna-slika" alt="profile"/>
                                        ) : (
                                            user.sex === "male" ? (
                                                <img src="./man-profile-icon.png" className="profilna-slika" alt="default male"/>
                                            ) : (
                                                user.sex === "female" ? (
                                                    <img src="./woman-profile-icon.png" className="profilna-slika" alt="default female"/>
                                                ) : null
                                            )
                                        )}
                                    </h1>
                                    <p>{user.name} {user.surname}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="hl-admin flex items-center justify-center">
                    <HashLoader color="#ffffff" />
                </div>
            )}
        </div>
    );
}

export default AllUsersAdmin;
