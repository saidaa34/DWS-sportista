import { useState, useEffect } from "react";
import Chat from "../components/Chat";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function ChatPage() {
    const [showNav, setShowNav] = useState(true);

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setShowNav(false);
        } else {
            setShowNav(true);
        }
    }, [window.innerWidth]);

    return (
        <div className="h-dvh flex flex-col">
            <Header showNav={showNav} />
            <div className="grow flex pt-[125px] h-[calc(100vh-125px)]">
                <Sidebar  />
                <div className="bg-dark-color grow"></div>
            </div>
        </div>
    );
}
