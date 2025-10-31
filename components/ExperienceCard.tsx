import Image from "next/image";

interface ExperienceCardProps {
  id:string,
  image: string;
  title: string;
  location: string;
  description: string;
  price: string;
  onClick?: () => void;
}
const ExperienceCard = ({
  image,
  title,
  location,
  description,
  price,
  id,
  onClick,
}: ExperienceCardProps) => {
  return (
    <div
      className="bg-gray-100  rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          width={100}
          height={100}
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
          {/* <span className=" bg-gray-300 border-r-22 text-xs  text-gray-700 px-3 py-1 rounded-full whitespace-nowrap ml-2">
              {location}
            </span> */}
          <span className="bg-gray-200 text-xs text-gray-700 px-3 py-1 rounded-md whitespace-nowrap ml-2">
            {location}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 font-interline-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-gray-500">From</span>
            <span className="text-xl font-semibold font-sans text-gray-900">
              ₹{price}
            </span>
          </div>
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            onClick={onClick}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;
