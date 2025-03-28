import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function NotAdminRoute({ children }) {
    const token = localStorage.getItem("token");
    const signedIn = token !== null;
  
    if (signedIn) {
      try {
        const user = jwtDecode(token);
        if (user.user_position !== "admin") {
          console.log("Prijavljen i nije admin", user);
          return children;
        } else {
          console.log("Is admin");
          return <Navigate to="/admin" />;
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        return children; // Handle token decoding error gracefully
      }
    } else {
      return children;
    }
  }