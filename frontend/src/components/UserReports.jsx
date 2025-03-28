import axios from "axios";
import { useState, useEffect } from "react";

const UserReports = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/all-reported-users')
            .then((res) => {
                setUsers(res.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);
    async function deleteUser(id_user, index) {
        try {
            console.log(id_user)
            const del = await axios.delete(`http://127.0.0.1:8000/users2/${id_user}`);
            console.log("Obrisan");
            setUsers(users.filter((user, i) => i !== index));
        } catch (error) {
          console.error("Greška prilikom brisanja profila:", error);
        }
    }

    return (
        <div className="table-container-admin text-black">
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Redni broj</th>
                        <th>Profilna</th>
                        <th>Ime i prezime</th>
                        <th>Broj odigranih igara</th>
                        <th>Broj prijava</th>
                        <th>Obriši korisnika</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr>
                            <td>{index + 1}</td>
                            <td>
                                {user.profile_photo ? (
                                    <img src={atob(user.profile_photo)} alt="profile" className="profile-img"/>
                                ) : (
                                    <img src={user.sex === "male" ? "./man-profile-icon.png" : "./woman-profile-icon.png"} alt="default profile" className="profile-img"/>
                                )}
                            </td>
                            <td>{user.name} {user.surname}</td>
                            <td>{user.no_of_games}</td>
                            <td>{user.no_of_reports}</td>
                            <td><button  onClick={() => deleteUser(user.id_user, index)}>Obriši korisnika</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserReports;
