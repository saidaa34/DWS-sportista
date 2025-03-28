import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const signedIn = localStorage.getItem("token") !== null;

  switch (signedIn) {
    case true:
      return children;
    case false:
      return <Navigate to="/login" />;
  }
}
