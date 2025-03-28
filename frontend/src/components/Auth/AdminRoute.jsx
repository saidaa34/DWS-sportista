import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function AdminRoute({ children }) {
  const signedIn = localStorage.getItem("token") !== null;

  if(signedIn) {
    const user = jwtDecode(localStorage.getItem("token"));
    if(user.user_position !== "admin") {
      console.log("Prijavljen i nije admin", user);
      return <Navigate to="/" />;
    }
    else {
      console.log("Prijavljen i je admin", user);
      return children;
    }
  }
  else {
    return <Navigate to="/login" />;
  }
}