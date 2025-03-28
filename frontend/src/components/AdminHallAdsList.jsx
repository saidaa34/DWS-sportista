import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

const AdminHallAdsList = ({reported}) => {
    const [hallAds, setHallAds] = useState([]);
    

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/halls/all_halls_and_reports')
        .then((res) => {
            let updatedHallAds = res.data; // Store the fetched data first

                if (reported) {
                    updatedHallAds = updatedHallAds.filter((hall) => hall.no_of_reports > 0);
                }

                setHallAds(updatedHallAds);
        })
        .catch((error) => {
            console.error(error);
        });
        
    }, []);

    const deleteAd = (id_hall, index) => {
        axios.delete(`http://127.0.0.1:8000/halls/delete-hall/${id_hall}`)
            .then((res) => {
                setHallAds(hallAds.filter((hall, i) => i !== index));
            })
            .catch((error) => {
                console.error(error);
            });

    }
    

    return (
        <div className="table-container-admin text-black">
            <table className="user-table">
                <thead>
                    <tr>
                        <th>Redni broj</th>
                        <th>Naziv</th>
                        <th>Broj prijava</th>
                        <th>Obriši oglas</th>
                    </tr>
                </thead>
                <tbody>
                    {hallAds.map((hall, index) => (
                        <tr key={hall.id_hall}>
                            <td>{index + 1}</td>
                            <td>
                            <Link to={`/tereni/${hall.id_hall}`}>{hall.name}</Link>
                            </td>
                            <td>{hall.no_of_reports}</td>
                            <td><button onClick={() => deleteAd(hall.id_hall, index)}>Obriši oglas</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminHallAdsList