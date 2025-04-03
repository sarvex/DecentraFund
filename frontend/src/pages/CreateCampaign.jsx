import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold">Start a New Campaign</h1>
            <p className="text-gray-600">Bring your creative project to life</p>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  1
                </div>
                <div
                  className={`ml-2 ${
                    step >= 1 ? "font-medium" : "text-gray-500"
                  }`}
                >
                  Basic Info
                </div>
              </div>
              <div className="flex items-center mb-4">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= 2
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  2
                </div>
                <div
                  className={`ml-2 ${
                    step >= 2 ? "font-medium" : "text-gray-500"
                  }`}
                >
                  Story
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= 3
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  3
                </div>
                <div
                  className={`ml-2 ${
                    step >= 3 ? "font-medium" : "text-gray-500"
                  }`}
                >
                  Rewards
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.title}
                      onChange={handleChange}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.description}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      This will appear on your campaign card (max 200
                      characters)
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="targetAmount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Funding Goal (USD)*
                    </label>
                    <input
                      type="number"
                      id="targetAmount"
                      name="targetAmount"
                      min="100"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.targetAmount}
                      onChange={handleChange}
                    />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.endDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next: Story
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
                      rows={8}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.story}
                      onChange={handleChange}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Tell your backers why they should support your project.
                      Include details about your team, your vision, and how
                      you'll use the funds.
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next: Rewards
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Create Reward Tiers</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Offer rewards to encourage backers to support your project.
                    Each reward should have a pledge amount and description.
                  </p>

                  {formData.rewards.map((reward, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label
                            htmlFor={`amount-${index}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Pledge Amount (USD)*
                          </label>
                          <input
                            type="number"
                            id={`amount-${index}`}
                            name="amount"
                            min="1"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={reward.amount}
                            onChange={(e) => handleRewardChange(index, e)}
                          />
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={reward.description}
                            onChange={(e) => handleRewardChange(index, e)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={reward.deliveryDate}
                            onChange={(e) => handleRewardChange(index, e)}
                          />
                        </div>
                      </div>
                      {formData.rewards.length > 1 && (
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeReward(index)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove Reward
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Back
                    </button>
                    <div className="space-x-3">
                      <button
                        type="button"
                        onClick={addReward}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add Another Reward
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {isSubmitting ? "Launching..." : "Launch Campaign"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
