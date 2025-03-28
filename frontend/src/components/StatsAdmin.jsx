import React from 'react';
import addFriendIcon from '/add-friend-svgrepo-com1.svg';
import icon1 from "/Icon-44.svg";
import icon3 from "/Icon-45.svg";
const StatsAdmin = ({ maleUsers, femaleUsers, noOfGameAds, noOfHallAds }) => {
    return (
        <div className="stats">
            <div style={{ display: 'flex', alignItems: 'center'}} className="stat-box">
                <div style={{ marginRight: '20px' }}>
                    <p className='mb-2'>Trenutno prijavljenih korisnika:</p>
                    <h2>{maleUsers + femaleUsers}</h2>
                </div>
                <img className="icon" src={addFriendIcon} alt="add-friend-icon" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center'}} className="stat-box">
                <div style={{ marginRight: '20px' }}>
                    <p className='mb-2'>Trenutno objavljenih oglasa za terene:</p>
                    <h2>{noOfHallAds}</h2>
                </div>
                <img className="icon h-[88px] w-[88px]" src={icon1} alt="add-friend-icon" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center'}} className="stat-box">
                <div style={{ marginRight: '20px' }}>
                    <p className='mb-2'>Trenutno objavljenih oglasa za termine:</p>
                    <h2>{noOfGameAds}</h2>
                </div>
                <img className="icon h-[88px] w-[88px]" src={icon3} alt="add-friend-icon" />
            </div>
        </div>
    );
}

export default StatsAdmin;
