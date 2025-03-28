import React, { useContext, useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";
import logo from "/logo.png";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import Select from "react-select";
import { jwtDecode } from "jwt-decode";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import { formatISO } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { ClockLoader } from "react-spinners";
Modal.setAppElement("#root");


import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:8000", {
  path: "/sockets",
});


const formatDate = (dateString) => {
  // format date for sending emails
  const date = new Date(dateString);

  // Extract day, month, year
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed
  const year = date.getFullYear();

  // Extract hours, minutes, seconds
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  // Format the date and time
  const formattedDate = `${day}.${month}.${year}`;
  const formattedTime = `${hours}:${minutes}:${seconds}`;

  return `${formattedDate} u ${formattedTime}`;
};

const HallReservation = () => {
  const options = {
    autoClose: 6000,
    hideProgressBar: false,
    position: "bottom-right",
    pauseOnHover: true,
  };
  const [token] = useContext(UserContext);
  const user = jwtDecode(token);
  const [showNav, setShowNav] = useState(true);
  const handleNavChange = () => setShowNav((prevState) => !prevState);
  const location = useLocation();
  const api_link = import.meta.env.VITE_API_URL;
  const { oglas, userRent } = location.state || {}; // user who is renting the hall
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoadingCallendar, setIsLoadingCallendar] = useState(true)
  const [reservation, setReservation] = useState({
    id_user_renter: user.id_user,
    starting_time: "",
    ending_time: "",
  });
  const [reservation2, setReservation2] = useState({
    id_user_renter: user.id_user,
    starting_time: new Date(),
    ending_time: new Date(),
  });
  const [game, setGame] = useState({
    no_of_players: 0,
    details: "",
    id_city: oglas.id_city,
    address: oglas.address,
    id_sport: 0,
    objavi_igru: false,
    players: selectedUsers,
  });

  const handleChange = (e) => {
    console.log("oglas", oglas);
    const { name, value } = e.target;
    if (name == "objavi_igru") {
      setGame((prevGame) => ({ ...prevGame, [name]: e.target.checked }));
    } else {
      setGame((prevGame) => ({ ...prevGame, [name]: value }));
    }
  };
  const handleChangeSelect = (e) => {
    const values = e.map((option) => option.value);
    setSelectedUsers(values);
  };
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setShowNav(false);
    } else {
      setShowNav(true);
    }
  }, [window.innerWidth]);

  const handleReservationTimeChange = (e) => {
    const timeZone = "Europe/Sarajevo";

    const utcStartTime = fromZonedTime(e.start, timeZone);
    const utcEndTime = fromZonedTime(e.end, timeZone);
    setReservation((prevData) => ({
      ...prevData,
      ending_time: formatISO(utcEndTime),
      starting_time: formatISO(utcStartTime),
    }));

    setReservation2((prevData) => ({
      ...prevData,
      ending_time: e.end,
      starting_time: e.start,
    }));
    console.log(reservation);
  };

  useEffect(() => {
    axios
      .get(`${api_link}/rezervacije/${oglas.id_hall}`)
      .then((res) => {
        console.log(res.data);
        setIsLoadingCallendar(false)
        setEvents(res.data.rezervacije);
        setUsers(res.data.users);
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    setGame((prevGame) => ({ ...prevGame, players: selectedUsers }));
  }, [selectedUsers]);
  const [igra, setIgra] = useState({});

  const handleSubmitReservation = (e) => {
    e.preventDefault();
    console.log("saljem podatke:", game, "Korisnici", selectedUsers);
    socket.emit('notificationsFromReservation', {"creator": user.id_user , 'users': selectedUsers})
    axios
      .post(`${api_link}/rezervacije/${oglas.id_hall}`, { reservation, game })
      .then(async (res) => {
        if (res.status == 200) {
          console.log("rezervacija uspjela", res.data);
          setIgra(res.data["Igra"]);
          toast.success("Uspjeno ste rezervisali svoj termin!", options);

          let allPlayersData = await axios.get(
            `${api_link}/igre-i-igraci/${res.data["Igra"].id_game}`
          );
          allPlayersData = allPlayersData.data[0];
          console.log("allPlayersData", allPlayersData);
          const playerNames = allPlayersData.games_and_users.map(
            (player) => player.user.name + " " + player.user.surname
          );
          console.log("playerNames", playerNames);

          // sending email to userRent that reservation has been made
          const emailData = {
            email: [userRent.email],
            subject: "Nova rezervacija!",
            body:
              "Imate novu rezervaciju za vaš oglas:" +
              oglas.name +
              "<br>" +
              "Informacije o rezervaciji:<br>" +
              "Vrijeme pocetka: " +
              formatDate(reservation.starting_time) +
              "<br>" +
              "Vrijeme kraja: " +
              formatDate(reservation.ending_time) +
              "<br>" +
              "Igrac/i: " +
              playerNames.join(",") +
              "<br>",
            button_text: "Pogledajte oglas",
            button_link: "https://localhost:5173/" + "/tereni/" + oglas.id_hall,
          };
          axios.post(`${api_link}/email-async`, emailData).then((res2) => {
            if (res2.status != 200) {
              toast.error(res2.data.mess, options);
            } else {
              console.log("email sent to userRent");
              console.log("zadnja evens", events);
            }
          });
          // sending email to user who rented the hall
          const user = jwtDecode(token);
          console.log("dekodirao token");
          const emailData1 = {
            email: [user.email],
            subject: "Uspješna rezervacija terena",
            body:
              "Uspješno ste rezervirali oglas:" +
              oglas.title +
              "<br>" +
              "Informacije o rezervaciji:<br>" +
              "Vrijeme pocetka: " +
              formatDate(reservation.starting_time) +
              "<br>" +
              "Vrijeme kraja: " +
              formatDate(reservation.ending_time) +
              "<br>" +
              "Igrac/i: " +
              playerNames.join(",") +
              "<br>" +
              "Cijena: " +
              oglas.price +
              "<br>",
            button_text: "Pogledajte teren",
            button_link: "https://localhost:5173/" + "/tereni/" + oglas.id_hall,
          };
          axios.post(`${api_link}/email-async`, emailData1).then((res2) => {
            if (res2.status != 200) {
              toast.error(res2.data.mess, options);
            } else {
              console.log("email sent to who rented");
            }
          });

          console.log("igraaa", igra.id_game);
          // sending email to all users that reservation has been made

          console.log("allPlayersData", allPlayersData);
          const playersEmail = allPlayersData.games_and_users.map(
            (player) => player.user.email
          );
          const emailData2 = {
            email: playersEmail,
            subject: "Novi termin!",
            body:
              "Dodani ste na novi termin:" +
              "<br>" +
              "Informacije o terminu:<br>" +
              "Vrijeme pocetka: " +
              formatDate(reservation.starting_time) +
              "<br>" +
              "Vrijeme kraja: " +
              formatDate(reservation.ending_time) +
              "<br>" +
              "Lokacija: " +
              oglas.address +
              "<br>" +
              "Igrac/i: " +
              playerNames.join(",") +
              "<br>",
            button_text: "Pogledajte teren",
            button_link: "https://localhost:5173/" + "/tereni/" + oglas.id_hall,
          };
          axios.post(`${api_link}/email-async`, emailData2).then((res2) => {
            if (res2.status != 200) {
              toast.error(res2.data.mess, options);
            } else {
              console.log("email sent to all players");
            }
          });

          setTimeout(() => {
            window.location.reload();
          }, 6000);
        } else {
          toast.error(
            "Nazalost nesto je poslo po zlu, pokusajte ponovo!",
            options
          );
        }
      })
      .catch((err) => console.log(err));
  };

  const handleDeleteReservation = (reservation_id) => {
    if (events.findIndex((e) => (e.id_user_renter == user.id_user && e.id_reservation == reservation_id )) !== -1) {
      closeModal()
      toast.error("Ne mozete brisati termine drugih korisnika!", options);
    } else {
      axios
        .delete(`${api_link}/delete_reservation/${reservation_id}`)
        .then((res) => {
          if (res.status == 200) {
            toast.success("Uspjesno ste obrisali vasu rezervaciju!", options);
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const customStylesSelect = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      borderColor: state.isFocused ? "#F5622B" : "#F5622B",
      background: "transparent",
      border: 0,
      ":focus": {
        border: 0,
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#F5622B" : "#38393D", // Postavlja pozadinsku boju na plavu ako je opcija odabrana, inače na bijelu
      color: state.isSelected ? "#ffffff" : "#ffffff", // Postavlja boju teksta na bijelu ako je opcija odabrana, inače na crnu
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#F5622B",
      color: "#ffffff",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#ffffff",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#ffffff",
      ":hover": {
        color: "#ffffff",
      },
    }),
  };

  const formatedData = users.map((user) => ({
    value: user.id_user,
    label: user.name + " " + user.surname,
    image: user.profile_photo,
  }));

  const CustomOption = ({ innerRef, innerProps, data }) => (
    <div
      ref={innerRef}
      {...innerProps}
      className="flex items-center py-2 px-3 border-b-[1px] border-orange-color bg-dark-color"
    >
      <img src={data.image} alt="" className="w-8 h-8 rounded-full mr-3" />
      {data.label}
    </div>
  );

  const customFilter = (option, searchText) => {
    if (option.data.label.toLowerCase().includes(searchText.toLowerCase())) {
      return true;
    } else {
      return false;
    }
  };
  const checkEventOverlap = (stillEvent, movingEvent) => {
    return !(
      stillEvent.start < movingEvent.end && stillEvent.end > movingEvent.start
    );
  };

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  return (
    <>
      <div className="min-h-[100vh] bg-dark-color absolute top-0 w-full font-inter text-white">
        <i
          onClick={handleNavChange}
          className="fa-solid fa-bars fixed top-[20px] right-5 text-4xl z-30 text-gray-color lg:hidden"
        ></i>
        <img
          src={logo}
          alt="sportsmate matcher logo"
          className="w-[100px] lg:hidden fixed left-1 top-0 z-30"
        />
        <Header showNav={showNav} />
        <div className="flex flex-col px-10 mb-10 mt-[155px]">
          <h1 className="text-center mb-4 w-full uppercase text-orange-color text-xl font-semibold">
            Rezervacija terena - {oglas.name}
          </h1>

          <div className="w-full flex flex-col md:flex-row">
            <div className="md:w-1/2 p-3 text-white">
              <h1 className="text-xl uppercase text-center py-5">
                Ispunite podatke za rezervaciju
              </h1>

              <form
                className="flex  flex-col space-y-4"
                onSubmit={handleSubmitReservation}
              >
                <div className="flex items-start py-2 justify-between gap-5">
                  <input
                    className="bg-transparent p-2 text-white border-b-[1px] w-1/3 mr-4 border-orange-color"
                    onChange={(e) => handleChange(e)}
                    name="no_of_players"
                    type="number"
                    min={0}
                    max={oglas.no_of_players}
                    placeholder="Broj igraca"
                  ></input>

                  <Select
                    styles={customStylesSelect}
                    isOptionDisabled={() =>
                      selectedUsers.length >= game.no_of_players
                    }
                    isMulti
                    className="w-full md:w-8/12 bg-dark-color text-white border-b-[1px] border-orange-color"
                    options={formatedData}
                    isSearchable={true}
                    isLoading={users.length < 1 ? true : false}
                    filterOption={customFilter}
                    onChange={(e) => handleChangeSelect(e)}
                    getOptionLabel={(e) => (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                          src={e.image}
                          alt=""
                          className="h-8 w-8 mr-4 rounded-full"
                        />
                        {e.label}
                      </div>
                    )}
                    components={{ Option: CustomOption }}
                    name="players"
                    noOptionsMessage={() => "Nema dostupnih korisnika"}
                  />
                </div>

                <div className="w-full items-start flex justify-between gap-5">
                  <select
                    onChange={handleChange}
                    name="id_sport"
                    className="p-2 text-white bg-transparent border-b-[1px]  border-orange-color w-1/3"
                  >
                    <option value="">Izaberite sport</option>
                    {oglas.sports_associations.map((sport) => (
                      <option key={sport.id_sport} value={sport.id_sport}>
                        {sport.sport.sport_name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="p-2 text-white bg-transparent border-b-[1px] border-orange-color w-2/3"
                    onChange={(e) => handleChange(e)}
                    name="details"
                    type="text"
                    placeholder="Naziv ili opis termina"
                  ></input>
                </div>

                <div className="flex items-end w-full">
                  <div className="w-1/2 flex flex-col items-start">
                    <label>Odaberite vrijeme na kalendaru</label>
                    <div className="pl-10">
                      <p>
                        {" "}
                        Datum: {reservation2.starting_time.getDate()}.{" "}
                        {reservation2.starting_time.getMonth()}.{" "}
                        {reservation2.starting_time.getFullYear()}
                      </p>
                      <p>
                        {" "}
                        Start:{" "}
                        {reservation2.starting_time
                          .getHours()
                          .toString()
                          .padStart(2, "0")}{" "}
                        :{" "}
                        {reservation2.starting_time
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")}{" "}
                      </p>
                      <p>
                        {" "}
                        Kraj:{" "}
                        {reservation2.ending_time
                          .getHours()
                          .toString()
                          .padStart(2, "0")}{" "}
                        :{" "}
                        {reservation2.ending_time
                          .getMinutes()
                          .toString()
                          .padStart(2, "0")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label
                      htmlFor="objavi_igru"
                      className="font-semibold text-sm uppercase"
                    >
                      Objavi termin javno
                    </label>
                    <input
                      type="checkbox"
                      name="objavi_igru"
                      onChange={(e) => handleChange(e)}
                    ></input>
                  </div>
                </div>
                <p className="py-3 uppercase font-semibold">
                  Cijena vaseg termina:{" "}
                  {((reservation2.ending_time - reservation2.starting_time) /
                    (1000 * 60 * 60)) *
                    oglas.price}{" "}
                  KM
                </p>
                <button className="bg-green-600 text-white p-3 rounded-md uppercase">
                  Rezervisi
                </button>
              </form>
            </div>
            <div className="md:w-1/2  p-3 text-white ">
            { isLoadingCallendar ? (
                <div className="h-full text-white bg-dark-color flex items-center justify-center">
                  <p className="pr-3">Dohvaćamo prethodne rezervacije...</p>

                  <ClockLoader color="white" />
                </div>
              ) : (
                <FullCalendar
                  validRange={{
                    start: new Date(),
                    end: null,
                  }}
                  allDaySlot={false}
                  displayEventEnd={true}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  displayEventTime={true}
                  eventClassNames={"bg-sky-700 hover:bg-sky-800"}
                  headerToolbar={{
                    start: "today prev next",
                    center: "title",
                    end: "dayGridMonth timeGridWeek timeGridDay",
                  }}
                  selectable={true}
                  select={(e) => handleReservationTimeChange(e)}
                  initialView="customWeek"
                  slotLabelFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    meridiem: "short",
                  }}
                  eventClick={handleEventClick}
                  selectOverlap={checkEventOverlap}
                  slotMinTime={oglas.start_of_working}
                  slotMaxTime={oglas.end_of_working}
                  slotLabelInterval={{ hours: 1 }}
                  weekends={true}
                  views={{
                    customWeek: {
                      type: "timeGrid",
                      duration: { days: 5 },
                      buttonText: "5 day",
                    },
                  }}
                  events={[
                    ...events.map((r) => ({
                      title: r.game.details,
                      start: r.starting_time,
                      end: r.ending_time,
                      id: r.id_reservation,
                    })),
                    {
                      title: game.details || "Novi termin",
                      start: reservation.starting_time,
                      end: reservation.ending_time,
                    },
                  ]}
                />
              )}
              <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Event Details"
                style={{
                  overlay: {
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    display: "flex",
                    justifyContent: "center",
                    zIndex: 100,
                    alignItems: "center",
                  },
                  content: {
                    position: "relative",
                    inset: "unset",
                    background: "var(--dark-color)",
                    padding: "30px",
                    borderRadius: "8px",
                    width: "50%",
                    maxWidth: "500px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  },
                }}
              >
                {selectedEvent && (
                  <div>
                    <h2 className="font-semibold text-xl py-2">
                      Termin: {selectedEvent.title}
                    </h2>
                    <div className="flex flex-col py-3">
                      <p>
                        <strong>Start: </strong>{" "}
                        {new Date(
                          new Date(selectedEvent.start).getTime() +
                            2 * 60 * 60 * 1000
                        ).toLocaleString()}
                      </p>
                      <p>
                        <strong>End: </strong>
                        {new Date(
                          new Date(selectedEvent.end).getTime() +
                            2 * 60 * 60 * 1000
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={closeModal}
                        className="bg-green-600 p-2 w-1/2 text-white font-semibold uppercase text-xs mb-2"
                      >
                        Obavjesti me ako se oslobodi
                      </button>
                      <button
                        onClick={closeModal}
                        className="text-white bg-red-600 p-2 rounded-full absolute top-3 right-3 text-xs uppercase"
                      > 
                        <i className="fa fa-close"></i>
                      </button>
                      <button
                        className="text-white bg-red-600 w-1/2 p-2 text-xs font-semibold uppercase mb-2"
                        onClick={() => handleDeleteReservation(selectedEvent.id)}
                      >
                        Obrisi rezervaciju
                      </button>
                    </div>
                  </div>
                )}
              </Modal>
            </div>
          </div>
        </div>
        <Footer />
      </div>
      <ToastContainer />
    </>
  );
};

export default HallReservation;
