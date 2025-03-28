import React from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

export default function SportsPopUp({ sports, handleSportSelect }) {
  const handleClickedSport = (sport) => {
    const element = document.getElementById(sport.id_sport);
    element.classList.toggle("selected-sport");
    handleSportSelect(sport);
  };
  return (
    <div>
      {sports.map((sport) => (
        <button
          type="button"
          className={
            sport.selected === true
              ? "sports-pop-up-selected-sport-btn selected-sport"
              : "sports-pop-up-selected-sport-btn"
          }
          id={sport.id_sport}
          key={sport.id_sport}
          onClick={() => handleClickedSport(sport)}
        >
          {sport.sport_name}
        </button>
      ))}
    </div>
  );
}
