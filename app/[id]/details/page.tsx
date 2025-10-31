"use client";
import BackButton from "@/components/BackButton";
import { useState } from "react";
import { ArrowLeft, Search, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useOrder } from "@/context/OrderContext";

const DetailPage = () => {
  const [selectedDate, setSelectedDate] = useState("Oct 22");
  const [selectedTime, setSelectedTime] = useState("07:00 am");
  const [experience, setExperience] = useState<any>(null);
  const [description, setDescription] = useState(
    "Scenic routes, trained guides, and safety briefing. Minimum age 10."
  );
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=400&fit=crop"
  );
  // const [dates, setDates] = useState<any[]>([
  //   { label: "Oct 22", value: "Oct 22" },
  //   { label: "Oct 23", value: "Oct 23" },
  //   { label: "Oct 24", value: "Oct 24" },
  //   { label: "Oct 25", value: "Oct 25" },
  //   { label: "Oct 26", value: "Oct 26" },
  // ]);

  const [times, setTimes] = useState<any[]>([
    {
      time: "07:00 am",
      capacity: 4,
    },
    {
      time: "09:00 am",
      capacity: 2,
    },
    {
      time: "11:00 am",
      capacity: 1,
    },
    {
      time: "01:00 pm",
      capacity: 0,
    },
  ]);

  const [dates, setDates] = useState<any[]>([
    "Oct 22","Oct 23","Oct 24","Oct 25"
  ])
  const [basePrice, setBasePrice] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // const basePrice = 999;
  // const subtotal = basePrice * quantity;
  // const taxes = 59;
  // const total = subtotal + taxes;

  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";
  const { setOrderSummary } = useOrder();

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const dateISO = new Date().toISOString().slice(0, 10);
    const load = async () => {
      try {
        const res = await fetch(`/api/experiences/${id}?date=${dateISO}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        console.log("new data", data);
        if (data && data._id) {
          setExperience(data);
          setDescription(data.description ?? description);
          setTimes(Array.isArray(data.times) ? data.times : times);
          setDates(Array.isArray(data.times) ? data.dates : dates)
          setImageUrl(data.image);
          setBasePrice(Number(data.price) || 0);
          // if (Array.isArray(data.dates) && data.dates.length > 0) {
          //   setDates(data.dates);
          // }
        }
      } catch (_) {}
    };
    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    // Convert "Oct 22" format to ISO date (2025-10-22)
    // const convertToISO = (dateStr: string): string => {
    //   const months: { [key: string]: string } = {
    //     Jan: "01",
    //     Feb: "02",
    //     Mar: "03",
    //     Apr: "04",
    //     May: "05",
    //     Jun: "06",
    //     Jul: "07",
    //     Aug: "08",
    //     Sep: "09",
    //     Oct: "10",
    //     Nov: "11",
    //     Dec: "12",
    //   };
    //   const parts = dateStr.split(" ");
    //   if (parts.length === 2) {
    //     const month = months[parts[0]] || "10";
    //     const day = parts[1].padStart(2, "0");
    //     return `2025-${month}-${day}`;
    //   }
    //   return new Date().toISOString().slice(0, 10); // fallback to today
    // };

    setOrderSummary({
      Experience: experience?.title || "",
      Date: selectedDate,
      Time: selectedTime,
      Qty: quantity,
      basePrice: basePrice,
      Total: `${
        basePrice * quantity + Math.floor(0.18 * basePrice * quantity)
      }`,
      experienceId: experience?._id || id,
      date: selectedDate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    experience?.title,
    experience?._id,
    selectedDate,
    selectedTime,
    quantity,
    id,
  ]);

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      <BackButton label="Details" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Content */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <img
              src={imageUrl}
              alt="Kayaking"
              className="w-full h-80 object-cover rounded-xl"
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {experience?.title || "Kayaking"}
          </h1>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            {description}
          </p>

          {/* Date Selector */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Choose date
            </h3>
            <div className="flex gap-2">
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(() => date);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedDate === date
                      ? "bg-yellow-400 text-black"
                      : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {date}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selector */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Choose time
            </h3>
            <div className="flex gap-2">
              {times.map((time) => (
                <button
                  key={time.time}
                  onClick={() => {
                    console.log({ time });
                    setSelectedTime(time.time);
                  }}
                  disabled={Number(time?.capacity) <= 0}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors relative ${
                    Number(time?.capacity) <= 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : selectedTime === time.time
                      ? "bg-white border-2 border-yellow-400 text-gray-900"
                      : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-start max-h-6 max-w-32">
                    <span className="text-sm">{time.time}</span>
                    <span
                      className={`text-xs px-2 py-2 ${
                        Number(time?.capacity) <= 0
                          ? "text-gray-500"
                          : "text-red-500"
                      }`}
                    >
                      {Number(time?.capacity) > 0
                        ? `${time.capacity} left`
                        : "Sold out"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              All times are in IST (GMT +5:30)
            </p>
          </div>

          {/* About Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
            <div className="bg-gray-100 rounded-md px-4 py-3">
              <p className="text-sm text-gray-600 leading-relaxed">
                Scenic routes, trained guides, and safety briefing. Minimum age
                10.
              </p>
            </div>
          </div>
        </div>

        {/* {Price Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Starts at</span>
              <span className="text-base font-semibold text-gray-900">
                ₹{basePrice}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">Quantity</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setQuantity((quantity) => Math.max(quantity - 1, 1));
                  }}
                  disabled={quantity <= 0}
                  className="w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  <Image
                    src="/ic_outline-minus.svg"
                    alt="minus"
                    height={16}
                    width={16}
                  ></Image>
                </button>
                <span className="text-sm font-medium text-gray-900 w-1 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    const selected = times.find((t) => t.time === selectedTime);
                    const capacity = Number(selected?.capacity ?? 0);
                    if (capacity > 0 && quantity + 1 > capacity) {
                      alert(`Only ${capacity} seats left for ${selectedTime}.`);
                      return;
                    }
                    setQuantity((quantity) => quantity + 1);
                  }}
                  className="w-6 h-6 flex items-center justify-center text-gray-700 hover:text-gray-900"
                >
                  <Image
                    src="/material-symbols_add.svg"
                    alt="add"
                    height={16}
                    width={16}
                  ></Image>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-medium text-gray-900">
                ₹{basePrice * quantity}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taxes</span>
              <span className="text-sm font-medium text-gray-900">
                ₹{Math.floor(0.18 * basePrice * quantity)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-base font-semibold text-gray-900">
                Total
              </span>
              <span className="text-lg font-bold text-gray-900">
                ₹
                {basePrice * quantity + Math.floor(0.18 * basePrice * quantity)}
              </span>
            </div>

            <button
              className={`w-full ${
                !selectedDate && !selectedTime ? "bg-gray-300" : "bg-yellow-400"
              } hover:bg-gray-300 text-gray-700 font-medium text-sm py-3 rounded-md transition-colors mt-4`}
              onClick={() => router.push("/checkout")}
              disabled={!selectedDate || !selectedTime}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DetailPage;
