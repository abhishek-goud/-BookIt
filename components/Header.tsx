"use client";
import Image from "next/image";
import { useSearch } from "@/context/SearchContext";

const Header = () => {
  const { searchLocation, setSearchLocation } = useSearch();
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* <div className="flex items-center gap-2"> */}

        <Image src="/logo.svg" alt="highway_delite" width={100} height={55} />
        {/* </div> */}

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search locations"
              className="w-[340px] h-[42px] px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>
          <button className="w-[87px] h-[42px] bg-yellow-400 hover:bg-yellow-500 text-black  font-semibold px-6 py-2 rounded-lg transition-colors ">
            Search
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
