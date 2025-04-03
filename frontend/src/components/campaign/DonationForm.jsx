import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function DonationForm({
  campaign,
  donationAmount,
  setDonationAmount,
  selectedReward,
  setSelectedReward,
}) {
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showCryptoOptions, setShowCryptoOptions] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    // Validate amount based on selected reward
    if (selectedReward) {
      const reward = campaign.rewards.find((r) => r.id === selectedReward);
      if (donationAmount < reward.amount) {
        setError(`Minimum pledge for this reward is $${reward.amount}`);
        setIsProcessing(false);
        return;
      }
    } else if (donationAmount < 1) {
      setError("Please enter a valid donation amount");
      setIsProcessing(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
      setIsProcessing(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-green-800">
          Thank you for your support!
        </h3>
        <div className="mt-2 text-sm text-green-700">
          <p>
            Your donation of{" "}
            <span className="font-semibold">
              ${donationAmount.toLocaleString()}
            </span>{" "}
            to <span className="font-semibold">"{campaign.title}"</span> has
            been received.
          </p>
          {selectedReward && (
            <p className="mt-2">
              You've selected the{" "}
              <span className="font-semibold">
                {campaign.rewards.find((r) => r.id === selectedReward).title}
              </span>{" "}
              reward.
            </p>
          )}
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setDonationAmount(0);
              setSelectedReward(null);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Make another donation
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Make a pledge
        </h3>

        {selectedReward && (
          <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
            <h4 className="text-sm font-medium text-indigo-800">
              Selected Reward
            </h4>
            <p className="text-sm text-indigo-700 mt-1">
              {campaign.rewards.find((r) => r.id === selectedReward).title} ($
              {campaign.rewards.find((r) => r.id === selectedReward).amount}+)
            </p>
            <button
              type="button"
              onClick={() => setSelectedReward(null)}
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
            >
              Change reward
            </button>
          </div>
        )}

        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {selectedReward
            ? "Pledge amount (minimum $" +
              campaign.rewards.find((r) => r.id === selectedReward).amount +
              ")"
            : "Enter your pledge amount"}
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            min={
              selectedReward
                ? campaign.rewards.find((r) => r.id === selectedReward).amount
                : 1
            }
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 py-3 sm:text-sm border-gray-300 rounded-lg"
            placeholder="0.00"
            value={donationAmount || ""}
            onChange={(e) => setDonationAmount(parseInt(e.target.value) || 0)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <span className="text-gray-500 sm:text-sm mr-3">USD</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment method
        </label>
        <div className="space-y-3">
          <div
            className={`flex items-center p-3 border rounded-lg cursor-pointer ${
              paymentMethod === "credit"
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onClick={() => {
              setPaymentMethod("credit");
              setShowCryptoOptions(false);
            }}
          >
            <input
              id="credit"
              name="payment"
              type="radio"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              checked={paymentMethod === "credit"}
              onChange={() => {
                setPaymentMethod("credit");
                setShowCryptoOptions(false);
              }}
            />
            <label
              htmlFor="credit"
              className="ml-3 block text-sm font-medium text-gray-700"
            >
              Credit/Debit Card
            </label>
          </div>
          <div
            className={`flex items-center p-3 border rounded-lg cursor-pointer ${
              paymentMethod === "crypto"
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onClick={() => {
              setPaymentMethod("crypto");
              setShowCryptoOptions(true);
            }}
          >
            <input
              id="crypto"
              name="payment"
              type="radio"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              checked={paymentMethod === "crypto"}
              onChange={() => {
                setPaymentMethod("crypto");
                setShowCryptoOptions(true);
              }}
            />
            <label
              htmlFor="crypto"
              className="ml-3 block text-sm font-medium text-gray-700"
            >
              Cryptocurrency
            </label>
          </div>
        </div>

        {showCryptoOptions && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Select cryptocurrency
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {["ETH", "BTC", "SOL", "USDC", "DAI", "MATIC"].map((crypto) => (
                <button
                  key={crypto}
                  type="button"
                  className="py-2 px-3 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100"
                >
                  {crypto}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing}
        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
          isProcessing ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {isProcessing ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          `Pledge $${donationAmount > 0 ? donationAmount.toLocaleString() : ""}`
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By continuing, you agree to our{" "}
        <a href="#" className="text-indigo-600 hover:text-indigo-800">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-indigo-600 hover:text-indigo-800">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
