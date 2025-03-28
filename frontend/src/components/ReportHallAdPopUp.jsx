import React from "react";
import "reactjs-popup/dist/index.css";
import { jwtDecode } from "jwt-decode";

export default function ReportHallAdPopUp({ token, handleReportSubmit }) {
  
  return (
    <div>
      {token ? (
        <div>
            <h1 style={{fontSize: "20px"}}>Da li ste sigurni da želite prijaviti ovaj oglas?</h1>
            <p style={{paddingBottom: "50px"}}>Nakon što prijavite oglas nećete moći povratiti svoju prijavu!</p>
            <button onClick={handleReportSubmit} className="bg-red-color px-5 py-2 text-[16px] xl:text-[16px] 2xl:text-[18px] font-inter">Prijavi oglas</button>
        </div>
      ): (
        <div>
            <h1 style={{fontSize: "20px", paddingBottom: "50px"}}>Ulogujte se kako biste mogli prijaviti oglas</h1>
            <div className="flex justify-center space-x-5">
              <button 
                className="hover:opacity-50"
                onClick={() => window.location.href = "/login"}
              >
                Prijavi se
              </button>
              <button 
              className="hover:opacity-50"
              onClick={() => window.location.href = "/register"}
              >
                Registruj se
              </button>
            </div>
        </div>
      )}
    </div>
  );
}
