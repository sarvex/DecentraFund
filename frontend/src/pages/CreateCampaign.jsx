import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const categories = [
  "Technology",
  "Art",
  "Film",
  "Music",
  "Food",
  "Publishing",
  "Environment",
  "Community",
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    story: "",
    targetAmount: "",
    endDate: "",
    rewards: [{ amount: "", description: "", deliveryDate: "" }],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRewardChange = (index, e) => {
    const { name, value } = e.target;
    const newRewards = [...formData.rewards];
    newRewards[index][name] = value;
    setFormData((prev) => ({
      ...prev,
      rewards: newRewards,
    }));
  };

  const addReward = () => {
    setFormData((prev) => ({
      ...prev,
      rewards: [
        ...prev.rewards,
        { amount: "", description: "", deliveryDate: "" },
      ],
    }));
  };

  const removeReward = (index) => {
    const newRewards = [...formData.rewards];
    newRewards.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      rewards: newRewards,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Campaign created:", formData);
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Start a New Campaign
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Bring your creative project to life
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step >= stepNumber
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > stepNumber
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span
              className={`text-sm ${
                step >= 1 ? "font-medium text-indigo-600" : "text-gray-500"
              }`}
            >
              Basic Info
            </span>
            <span
              className={`text-sm ${
                step >= 2 ? "font-medium text-indigo-600" : "text-gray-500"
              }`}
            >
              Story
            </span>
            <span
              className={`text-sm ${
                step >= 3 ? "font-medium text-indigo-600" : "text-gray-500"
              }`}
            >
              Rewards
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <form onSubmit={handleSubmit} className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Campaign Title*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="What's your project called?"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category*
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Short Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    required
                    maxLength={200}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Briefly describe your project in 1-2 sentences"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.description.length}/200 characters (appears on
                    your campaign card)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="targetAmount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Funding Goal (USD)*
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        id="targetAmount"
                        name="targetAmount"
                        min="100"
                        required
                        className="block w-full pl-8 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        value={formData.targetAmount}
                        onChange={handleChange}
                        placeholder="5000"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Campaign End Date*
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Continue to Story
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="story"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Campaign Story*
                  </label>
                  <textarea
                    id="story"
                    name="story"
                    rows={10}
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.story}
                    onChange={handleChange}
                    placeholder="Tell your backers why they should support your project..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Include details about your team, your vision, and how you'll
                    use the funds.
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Continue to Rewards
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Create Reward Tiers
                  </h2>
                  <p className="text-sm text-gray-500">
                    Offer rewards to encourage backers to support your project.
                    Each reward should have a pledge amount and description.
                  </p>
                </div>

                <div className="space-y-4">
                  {formData.rewards.map((reward, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                          <label
                            htmlFor={`amount-${index}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Pledge Amount (USD)*
                          </label>
                          <div className="relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500">$</span>
                            </div>
                            <input
                              type="number"
                              id={`amount-${index}`}
                              name="amount"
                              min="1"
                              required
                              className="block w-full pl-8 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                              value={reward.amount}
                              onChange={(e) => handleRewardChange(index, e)}
                              placeholder="25"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label
                            htmlFor={`description-${index}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Reward Description*
                          </label>
                          <input
                            type="text"
                            id={`description-${index}`}
                            name="description"
                            required
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={reward.description}
                            onChange={(e) => handleRewardChange(index, e)}
                            placeholder="What will backers receive?"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor={`deliveryDate-${index}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Estimated Delivery*
                        </label>
                        <input
                          type="date"
                          id={`deliveryDate-${index}`}
                          name="deliveryDate"
                          required
                          min={formData.endDate}
                          className="block w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          value={reward.deliveryDate}
                          onChange={(e) => handleRewardChange(index, e)}
                        />
                      </div>
                      {formData.rewards.length > 1 && (
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeReward(index)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-lg text-red-600 hover:text-red-800 focus:outline-none"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Remove Reward
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={addReward}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Another Reward
                  </button>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Launching Campaign...
                      </>
                    ) : (
                      "Launch Campaign"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
