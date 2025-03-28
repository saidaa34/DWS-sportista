import React from 'react';
import manProfilePhoto from "/man-profile-icon.png";
import womanProfilePhoto from "/woman-profile-icon.png";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function ProfileDetails({ moguUreditiProfil, reported, updateShowEditProfile, updateShowProfileDetails, userData, profileImage, city, atletskeSposobnosti, handleReportUser }) {
    const params = useParams();
    const handleClickEdit = () => {
        updateShowEditProfile();
        updateShowProfileDetails();
    }

    const handleDeleteUser = async () => {
        try {
            const del = await axios.delete(`http://127.0.0.1:8000/users2/${params.user_id}`);
            console.log(del.data);
            localStorage.removeItem("token");
            window.location.href = "/";
        } catch (error) {
          console.error("Greška prilikom brisanja profila:", error);
        }
    };
  
    return (
        <div className="profil-drugi-blok ml-10 w-full flex flex-col shadow-2xl shadow-orange-color border-t-2 border-orange-color rounded-xl mr-[15rem]">
            <div className="profil-podaci flex flex-row w-full">
                <div className="profil-podaci-dijete py-5 pt-12 flex flex-col w-full">
                    <p className="profil-stavke">Datum rođenja: {userData.date_of_birth}</p>
                    <p className="profil-stavke">Spol: {userData.sex}</p>
                    <p className="profil-stavke">Grad: {city.name}</p>
                    <p className="profil-stavke">Visina: {userData.height} cm</p>
                    <p className="profil-stavke">Težina: {userData.weight} kg</p>
                    <p className="profil-stavke">Broj odigranih igara: {userData.no_of_games}</p>
                    <p className="profil-stavke">Bio: {userData.bio}</p>
                    <div className="mt-5">
                        <span className="bg-orange-color px-8 py-3 mb-1 inline-block">Level atletskih sposobnosti:</span>
                        <div className="flex flex-wrap mt-2 ms-3">
                            {Object.keys(atletskeSposobnosti).map((e, i) => (
                                <span className="atletske-sposobnosti-tekst rounded-[30px] bg-gray-color px-5 py-3 m-1" key={i}>{atletskeSposobnosti[e].sport_name}: {atletskeSposobnosti[e].level_name}</span>
                            ))}
                        </div>
                    </div>
                    <div className="profil-stavke mt-5">
                        {moguUreditiProfil && (
                            <div>
                                <button onClick={handleClickEdit} className="bg-green-500 py-2 px-4 text-white placeholder:text-black rounded-md text-base block mb-3">Uredi profil</button>
                                <button onClick={handleDeleteUser} className="bg-red-500 py-2 px-4 text-white placeholder:text-black rounded-md text-sm block">Izbriši profil</button>
                            </div>
                        )}                    
                    </div>
                </div>
                <div className="flex flex-col justify-center items-center py-5 px-5 pt-12 w-full">
                    <div className="text-center justify-center items-center h-full flex flex-col">
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
                    </div>
                    <div className="ml-auto mt-auto p-5">
                        {!moguUreditiProfil && (
                        <button onClick={handleReportUser} className="bg-red-500 py-2 px-4 text-white placeholder:text-black rounded-md text-sm">Prijavi korisnika</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
