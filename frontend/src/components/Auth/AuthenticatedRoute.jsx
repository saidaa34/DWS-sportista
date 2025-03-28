import { Navigate } from "react-router-dom";

export default function AuthenticatedRoute({ children }) {
  const signedIn = localStorage.getItem("token") !== null;

  switch (signedIn) {
    case true:
      return <Navigate to="/" />;
    case false:
      return children;
  }
}
