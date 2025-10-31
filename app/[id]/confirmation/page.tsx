"use client";
import BackButton from "@/components/BackButton";
import { Check } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const ConfirmationPage = () => {
  const params = useParams();
  const [refTxn, setRefTxn] = useState("HUF568SO");
  useEffect(() => {
    const refId = (params?.id as string) || "HUF568SO";
    setRefTxn(refId);
  }, []);
  const SuccessIcon = () => {
    return (
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check size={36} strokeWidth={3} className="text-white" />
      </div>
    );
  };

  return (
    <main className="flex items-center justify-center pt-24">
      <div className="text-center">
        <SuccessIcon />
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Booking Confirmed
          </h1>
          <p className="text-sm text-gray-600 mb-8">Ref ID: {refTxn}</p>
        </div>
        <div className="flex justify-center">
          <BackButton label="Home" />
        </div>
      </div>
    </main>
  );
};

export default ConfirmationPage;


