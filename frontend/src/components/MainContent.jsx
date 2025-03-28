import { gsap } from "gsap";
import { useRef, useEffect, useState } from "react";

export default function MainContent({
  title,
  desc,
  currentMain,
  num,
}) {
  const divRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(divRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(imgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  }, [currentMain]);

  

  return (
    <div className="w-[100%] h-full px-[50px] lg:px-[10%] flex items-center gap-10 lg:gap-0 lg:justify-center lg:items-stretch flex-col lg:flex-row">
      <div
        className={`opacity-0 w-[100%] sm:w-[90%] lg:w-[50%] flex flex-col gap-[30px] 2xl:gap-[75px] items-start text-white`}
        ref={divRef}
      >
        <h1 className="text-orange-color text-3xl xl:text-4xl 2xl:text-5xl uppercase font-[700]">
          sportsmate <br />{" "}
          <span className="text-white-color uppercase font-[700]">matcher</span>
        </h1>
        <p className="text-2xl xl:text-3xl 2xl:text-4xl font-[600]">{title}</p>
        <p className="text-xl 2xl:text-2xl w-[80%]">{desc}</p>
        
      </div>
      {num == 0 ? (
        <div
          className={`hidden lg:block lg:w-[50%] flex items-center justify-center bg-[url(/man-running.svg)] ${
            num == 0 ? "bg-contain" : "bg-cover"
          } bg-center bg-no-repeat rounded`}
          ref={imgRef}
        ></div>
      ) : (
        <div
          className={`hidden lg:block lg:w-[50%] flex items-center justify-center bg-[url(footballField.jpeg)] ${
            num == 0 ? "bg-contain" : "bg-cover"
          } bg-center bg-no-repeat rounded`}
          ref={imgRef}
        ></div>
      )}
    </div>
  );
}
