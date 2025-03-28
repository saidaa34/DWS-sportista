import { useState, useEffect } from "react";
import Chat from "../components/Chat";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useLocation } from "react-router-dom";

export default function ChatPage() {
  
  const location = useLocation()
  const [showNav, setShowNav] = useState(true);
  const [userId, setUserId] = useState();
  const [user, setUser] = useState()
  useEffect(() => {
    if (location.state?.user_id) {
      setUserId(location.state.user_id);
    }else {
      setUserId(0)
    }
  }, [location.state]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setShowNav(false);
    } else {
      setShowNav(true);
    }
  }, [window.innerWidth]);

  const handleUser = (user) => {
    setUserId(user.id_user);
    setUser(user)

  };
  return (
    <div className="h-dvh flex flex-col">
      <Header showNav={showNav} />
      <div className="grow flex pt-[125px] h-[calc(100vh-125px)]">
        <Sidebar funkcija={(id) => handleUser(id)}></Sidebar>
        <Chat userId={userId} user2={user} />
      </div>
    </div>
  );
}
