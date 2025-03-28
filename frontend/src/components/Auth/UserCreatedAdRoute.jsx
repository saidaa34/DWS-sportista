import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { UserContext } from '../../context/UserContext'; // Adjust the import based on your context file location

export default function UserCreatedAdRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [userAds, setUserAds] = useState([]);
  const [token] = useContext(UserContext);
  const signedIn = token !== null;
  const { id } = useParams(); // Get the :id parameter

  useEffect(() => {
    const fetchUserAds = async () => {
      if (!signedIn) {
        setIsLoading(false);
        return;
      }

      try {
        const user = jwtDecode(token);
        const response = await fetch(`http://localhost:8000/user-halls/${user.id_user}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseJson = await response.json();
        setUserAds(responseJson);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user ads:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    fetchUserAds();
  }, [signedIn, token]);

  if (!signedIn) {
    return <Navigate to="/login" />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (hasError) {
    return <div>Error loading data. Please try again later.</div>;
  }

  // Check if the id exists in userAds
  const adExists = userAds.some(ad => ad === parseInt(id, 10));

  if (adExists) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}
