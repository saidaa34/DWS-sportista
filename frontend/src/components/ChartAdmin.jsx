import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useState, useEffect } from 'react';
import axios from "axios";
const ChartAdmin = ({maleUsers, femaleUsers}) => {
    const [reservations, setReservations] = useState([]);
    const [counts, setCounts] = useState([]);
    const [dates, setDates] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/reservations/last7days')
        .then((response) => {
            setReservations(response.data);
        })
    }, [])

    useEffect(() => {
        console.log("reservations: ", reservations);
        if (reservations.length > 0) {
            const counts = reservations.map(res => res.count);
            const dates = reservations.map(res => res.date);
            setCounts(counts);
            setDates(dates);
        }
    }, [reservations]);

    return (
        <div className="charts">
            <div className="chart">
                <h3 className='mb-5'>Rezervacije u prethodnih 7 dana:</h3>
                <div className="bar-chart">
                    <BarChart
                        series={[
                        { data: [counts[6], counts[5], counts[4], counts[3], counts[2], counts[1], counts[0]], color: '#f5622b' }, 
                        ]}
                        height={290}
                        xAxis={[{ data: [dates[6], dates[5], dates[4], dates[3], dates[2], dates[1], dates[0]], scaleType: 'band' }]}
                        margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                    />
                </div>
            </div>
            <div className="chart">
                <h2 className='mb-5'>Spol korisnika:</h2>
                <div className="pie-chart">
                    <PieChart
                        series={[
                        {
                            data: [
                            { id: 0, value: maleUsers, label: 'Muško', color: '#f79874' },
                            { id: 1, value: femaleUsers, label: 'Žensko', color: '#f5622b' },
                            ],
                        },
                        ]}
                        width={500}
                        height={250}
                    />
                </div>
            </div>
        </div>
    );
}

export default ChartAdmin;
