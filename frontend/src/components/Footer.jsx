import { Link } from "react-router-dom";

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <footer className="font-inter flex-col bg-dark-color text-slate-300 p-5 select-none px-10 border-t border-orange-color">
            <div className="flex md:flex-row flex-col gap-20 md:gap-[75px] py-[15px] items-start">
                <ul className="flex flex-col gap-2">
                    <h3 className="uppercase font-[700] text-orange-color">
                        Informacije
                    </h3>
                    <Link
                        to={"/register"}
                        className="lg:hover:cursor lg:hover:opacity-50 transition-all font-[500]"
                    >
                        Registruj se
                    </Link>
                    <Link
                        to={"/"}
                        className="lg:hover:cursor lg:hover:opacity-50 transition-all font-[500]"
                    >
                        Početna
                    </Link>
                </ul>

                <ul className="flex flex-col gap-2">
                    <h3 className="uppercase font-[700] text-orange-color">
                        Resursi
                    </h3>
                    <Link
                        to={"https://github.com/AdnanPobrklic/sportista"}
                        target="_blank"
                        className="lg:hover:cursor lg:hover:opacity-50 transition-all font-[500]"
                    >
                        GitHub
                    </Link>
                    <Link
                        to={"https://trello.com/b/x62fuvQE/sportsmate-matcher"}
                        target="_blank"
                        className="lg:hover:cursor lg:hover:opacity-50 transition-all font-[500]"
                    >
                        Trelo
                    </Link>
                </ul>

                <ul className="flex flex-col gap-2">
                    <h3 className="uppercase font-[700] text-orange-color">
                        Contact us
                    </h3>
                    <a
                        href="mailto:info@sportsmate.com"
                        className="lg:hover:cursor lg:hover:opacity-50 transition-all font-[500]"
                    >
                        info@sportsmate.com
                    </a>
                    <a
                        href="tel:387000111222"
                        className="lg:hover:cursor lg:hover:opacity-50 transition-all font-[500]"
                    >
                        +387000111222
                    </a>
                </ul>

                <button
                    className="border border-orange-color text-orange-color p-2 rounded hover:bg-neutral-950 transition-all font-[500]"
                    onClick={scrollToTop}
                >
                    Nazad na pocetak
                </button>
            </div>
            <p className="mt-3 font-[400] text-[14px] text-orange-color">
                &copy;Copyright Sva prava zadržana.
            </p>
        </footer>
    );
}
