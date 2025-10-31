"use client";
import BackButton from "@/components/BackButton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useOrder } from "@/context/OrderContext";

interface InputFieldProps {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: any) => void;
  className: string;
  pattern?: string;
}

const convertToISO = (dateStr?: string): string => {
  if (!dateStr || typeof dateStr !== "string") {
    return new Date().toISOString().slice(0, 10);
  }
  const months: { [key: string]: string } = {
    "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
    "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
  };
  const parts = dateStr.split(" ");
  if (parts.length === 2) {
    const month = months[parts[0]] || "10";
    const day = parts[1].padStart(2, "0");
    return `2025-${month}-${day}`;
  }
  return new Date().toISOString().slice(0, 10); // fallback to today
};

const InputField = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  className,
  pattern,
}: InputFieldProps) => {

  return (
    <div>
      <label className="block text-xs text-gray-600 mb-2 font-normal">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        pattern={pattern}
        className={className}
      />
    </div>
  );
};

const OrderSummary = ({
  experienceName,
  date,
  time,
  quantity,
  subtotal,
  taxes,
  basePrice,
  total,
  onPayClick,
}: any) => {
  return (
    <div className="bg-gray-100 rounded-lg p-5">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Experience</span>
          <span className="text-sm font-medium text-gray-900">
            {experienceName}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Date</span>
          <span className="text-sm font-medium text-gray-900">{convertToISO(date)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Time</span>
          <span className="text-sm font-medium text-gray-900">{time}</span>
        </div>

        <div className="flex items-center justify-between border-gray-300">
          <span className="text-sm text-gray-600">Qty</span>
          <span className="text-sm font-medium text-gray-900">{quantity}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-gray-600">Subtotal</span>
          <span className="text-sm font-medium text-gray-900">₹{basePrice*quantity}</span>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-gray-300">
          <span className="text-sm text-gray-600">Taxes</span>
          <span className="text-sm font-medium text-gray-900">₹{Math.floor(0.18*basePrice*quantity)}</span>
        </div>

        <div className="flex items-center justify-between pt-1 pb-4">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-lg font-bold text-gray-900">₹{total}</span>
        </div>
      </div>

      <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm py-3 rounded-md transition-colors"
        onClick={onPayClick}
      >
        Pay and Confirm
      </button>
    </div>
  );
};

const CheckOutPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const router = useRouter();
  const { orderSummary, setOrderSummary } = useOrder();
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    console.log({discount})
  }, [discount])

  const validateName = (name: string) => {
    if (!name || !name.trim()) {
      return { valid: false, message: "Full name is required." };
    }
    if (name.trim().length < 2) {
      return { valid: false, message: "Full name must be at least 2 characters." };
    }
    return { valid: true, message: "" };
  };

  const validateEmail = (value: string) => {
    if (!value || !value.trim()) {
      return { valid: false, message: "Email is required." };
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(String(value).toLowerCase())) {
      return { valid: false, message: "Please enter a valid email address." };
    }
    return { valid: true, message: "" };
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      alert("Please enter a promo code to apply.");
      return;
    }
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      const data = await res.json();
      setDiscount(data.discount ?? 0)
      console.log("promoData",data)
      if (data.valid) {
        alert(`Promo applied: ${data.code}`);
      } else {
        alert("Invalid promo code");
      }
    } catch (e) {
      alert("Failed to validate promo code. Please try again.");
    }
  };

  const handlePayAndConfirm = async () => {
    // Validate full name
    const nameValidation = validateName(fullName);
    if (!nameValidation.valid) {
      alert(nameValidation.message);
      return;
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      alert(emailValidation.message);
      return;
    }

    // Validate checkbox
    if (!agreeToTerms) {
      alert("You must agree to the terms and safety policy to proceed.");
      return;
    }

    // Validate order summary exists and has all required fields
    if (!orderSummary) {
      alert("Order details are missing. Please go back and select an experience.");
      return;
    }

    if (!orderSummary.Experience || !orderSummary.Experience.trim()) {
      alert("Experience name is missing.");
      return;
    }

    if (!orderSummary.Date || !orderSummary.Date.trim()) {
      alert("Date is required.");
      return;
    }

    if (!orderSummary.Time || !orderSummary.Time.trim()) {
      alert("Time is required.");
      return;
    }

    if (!orderSummary.Qty || orderSummary.Qty <= 0) {
      alert("Quantity must be at least 1.");
      return;
    }

    if (!orderSummary.basePrice || orderSummary.basePrice <= 0) {
      alert("Invalid base price.");
      return;
    }

    if (!orderSummary.Total || !orderSummary.Total.trim()) {
      alert("Total amount is missing.");
      return;
    }

    if (!orderSummary.experienceId) {
      alert("Experience ID is missing. Please go back and select an experience.");
      return;
    }

    if (!orderSummary.date) {
      alert("Date format error. Please go back and select a date again.");
      return;
    }

    // Generate unique refTxn (timestamp + random string)
    const refTxn = `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Convert Total from string (e.g., "₹1058" or "1058") to number
    const totalAmount = parseInt(orderSummary.Total.replace(/[₹,\s]/g, ""), 10);

    if (isNaN(totalAmount) || totalAmount <= 0) {
      alert("Invalid total amount.");
      return;
    }

    try {
      console.log({
        experienceId: orderSummary.experienceId,
        date: orderSummary.date,
        time: orderSummary.Time,
        qty: orderSummary.Qty,
        total: totalAmount,
        refTxn: refTxn,
      })
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          experienceId: orderSummary.experienceId,
          date: orderSummary.date,
          time: orderSummary.Time,
          qty: orderSummary.Qty,
          total: totalAmount,
          refTxn: refTxn,
        }),
      });
      console.log("bookingData", response)
      const data = await response.json();

      if (!response.ok) {
        // Handle different error statuses
        if (response.status === 409) {
          alert("Sorry, this slot is sold out. Please select a different time.");
        } else if (response.status === 400) {
          alert(`Booking failed: ${data.error || "Invalid request"}`);
        } else if (response.status === 404) {
          alert("Experience not found. Please go back and try again.");
        } else {
          alert(`Booking failed: ${data.error || "Please try again later."}`);
        }
        return;
      }

      // Success - navigate to confirmation
      router.push(`${refTxn}/confirmation`);
    } catch (error) {
      console.error("Booking error:", error);
      alert("Network error. Please check your connection and try again.");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <BackButton label="Checkout" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 bg-gray-100 rounded-lg p-5 h-[225px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <InputField
              type="text"
              label="Full name"
              placeholder="John Doe"
              value={fullName}
              onChange={(e: any) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />

            <InputField
              label="Email"
              type="email"
              placeholder="test@test.com"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              className="w-full px-4 py-2.5 bg-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* promo code */}
          <div className="mb-4">
            <label className="block text-xs text-gray-600 mb-2 font-normal">
              Promo code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder=""
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-200 rounded-md text-sm text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
              <button
                onClick={handleApplyPromo}
                className="bg-black hover:bg-gray-800 text-white font-medium text-sm px-6 py-2.5 rounded-md transition-colors whitespace-nowrap"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-2 cursor-pointer">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 appearance-none border-2 border-gray-400 rounded checked:bg-black checked:border-black focus:ring-2 focus:ring-gray-300 cursor-pointer"
              />
              {agreeToTerms && (
                <svg
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M13 4L6 11L3 8"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span className="text-xs text-gray-700 leading-relaxed">
              I agree to the terms and safety policy
            </span>
          </label>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <OrderSummary experienceName={orderSummary?.Experience} date={orderSummary?.Date} time={orderSummary?.Time} quantity={orderSummary?.Qty} total={orderSummary?.Total} basePrice={Math.round((1 - ((Number(discount) || 0) / 100)) * (orderSummary?.basePrice ?? 0))} onPayClick={handlePayAndConfirm} />
        </div>
      </div>
    </main>
  );
};

export default CheckOutPage;

// experienceName,
//   date,
//   time,
//   quantity,
//   subtotal,
//   taxes,
//   total,
//   onPayClick,
