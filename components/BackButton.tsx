import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BackButton = ({label}: {label: string}) => {
    const router = useRouter()
    return (
      <button 
        onClick={() => router.push(label === 'Home' || "Details" ? "/" : `/${label}`)}
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm mb-6"
      >
        <ArrowLeft size={18} />
        <span>{label}</span>
      </button>
    );
  };


  export default BackButton

