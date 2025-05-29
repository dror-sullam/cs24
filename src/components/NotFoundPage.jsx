import React from "react";
import Button from "./ui/HomeButton";
import { useNavigate } from "react-router-dom";
import dribbbleGif from '../dribbble-3.gif';

export default function NotFoundPage() {
    const navigate = useNavigate();  
    return (
    <section className="bg-white font-serif min-h-screen flex items-center justify-center">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <div className="w-full sm:w-10/12 md:w-8/12 text-center">
            <div className="relative h-[350px] md:h-[500px]">
              <img 
                src={dribbbleGif}
                alt="404 animation"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-contain"
              />
              <h1 className="relative z-10 text-center text-black text-6xl sm:text-7xl md:text-8xl pt-6 sm:pt-8">
                404
              </h1>
            </div>

            <div className="mt-[-50px]">
              <h3 className="text-2xl text-black sm:text-3xl font-bold mb-4 text-center">
                הדף שאתה מחפש לא קיים
              </h3>
              <p className="mb-6 text-black sm:mb-5">
                מצטערים, הדף שאתה מחפש לא קיים.
              </p>

              <Button
                variant="default"
                onClick={() => navigate("/")}
                className="text-white my-5 bg-blue-600 hover:bg-blue-700 "
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
