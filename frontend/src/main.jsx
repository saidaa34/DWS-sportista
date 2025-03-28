import React, { useContext } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { UserProvider } from "./context/UserContext";
import HallAds from "./pages/HallAds";
import ProtectedRoute from "./components/Auth/ProtectedRoutes";
import AuthenticatedRoute from "./components/Auth/AuthenticatedRoute";
import UserCreatedAdRoute from "./components/Auth/UserCreatedAdRoute";
import Profile from "./pages/Profile";
import HallDetail from "./pages/HallDetail";
import HallsPage from "./pages/HallsPage";
import TermsPage from "./pages/TermsPage";
import HallReservation from "./pages/HallReservation";
import EditHallAds from "./pages/EditHallAds";
import EditProfile from "./pages/EditProfile";
import Comments from "./pages/Comments";
import ChatPage from "./pages/ChatPage";
import UserAndHall from "./pages/UserAndHall";
import UserAndGames from "./pages/UserAndGames";
import AddGame from "./pages/AddGame";
import Admin from "./pages/Admin";
import AdminRoute from "./components/Auth/AdminRoute";
import NotAdminRoute from "./components/Auth/NotAdminRoute";

const router = createBrowserRouter([ // if user is admin it should redirect him to /admin
    {
        path: "/",
        element: (
            <NotAdminRoute> 
                <Home />
            </NotAdminRoute>
        ),
    },
    {
        path: "/tereni/:id",
        element: (
            <NotAdminRoute> 
                <HallDetail />
            </NotAdminRoute>
        ),
    },
    {
        path: "/tereni/iznajmi-teren/:id",
        element: (
            <ProtectedRoute>
                <NotAdminRoute> 
                    <HallReservation />
                </NotAdminRoute>
            </ProtectedRoute>
        ),
    },
    {
        path: "/objavi-oglas-teren",
        element: (
            <ProtectedRoute>
                <NotAdminRoute> 
                    <HallAds />
                </NotAdminRoute>
            </ProtectedRoute>
        ),
    },
    {
        path: "/uredi-oglas-teren/:id",
        element: (
            <UserCreatedAdRoute>
                <NotAdminRoute>
                    <EditHallAds />
                </NotAdminRoute>
            </UserCreatedAdRoute>
        ),
    },
    {
        path: "/login",
        element: (
            <AuthenticatedRoute>
                <NotAdminRoute>
                <Login />,
                </NotAdminRoute>
            </AuthenticatedRoute>
        ),
        // umjesto samo h1 dodat ce se posebna stranica naknadno
        errorElement: <h1>404 not found</h1>,
    },
    {
        path: "/register",
        element: (
            <AuthenticatedRoute>
                <Register />,
            </AuthenticatedRoute>
        ),
    },
    {
        path: "/users2/:user_id",
        element: (
            <NotAdminRoute> 
                <Profile />
            </NotAdminRoute>
        ),
    },
    {
        path: "/chat",
        element: (
            <ProtectedRoute>
                <NotAdminRoute> 
                    <ChatPage />
                </NotAdminRoute>
            </ProtectedRoute>
        ),
    },
    {
        path: "/oglasi/tereni",
        element: (
            <NotAdminRoute> 
                <HallsPage />
            </NotAdminRoute>
        ),
    },
    {
        path: "/oglasi/termini",
        element: (
            <NotAdminRoute> 
                <TermsPage />
            </NotAdminRoute>
        ),
    },
    {
        path: "/komentari/:user_id",
        element: (
            <NotAdminRoute> 
                <Comments />
            </NotAdminRoute>
        ),
    },
    {
        path: "/user-and-hall/:user_id",
        element: (
            <NotAdminRoute> 
                <UserAndHall />
            </NotAdminRoute>
        ),
    },
    {
        path: "/user-and-games/:user_id",
        element: (
            <NotAdminRoute> 
                <UserAndGames />
            </NotAdminRoute>
        ),
    },
    {
        path: "/objavi-oglas-termina",
        element: (
            <ProtectedRoute>
                <AddGame />
            </ProtectedRoute>
        ),
    },
    {
        path: "/admin",
        element: (
            <AdminRoute>
                <Admin />
            </AdminRoute>
        ),
    }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <UserProvider>
            <RouterProvider router={router} />
        </UserProvider>
    </React.StrictMode>
);