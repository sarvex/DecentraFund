import { useParams } from "react-router-dom";
import { useState } from "react";
import DonationForm from "../components/campaign/DonationForm";

const mockCampaign = {
  id: 1,
  title: "Eco-Friendly Water Bottles",
  creator: "Green Innovations Inc.",
  creatorAvatar: "/creator-avatar.jpg",
  description:
    "Help us launch sustainable water bottles made from 100% recycled materials. Our bottles are designed to be completely biodegradable while maintaining durability.",
  story:
    "As environmental scientists, we've seen firsthand the damage caused by single-use plastics. After years of research, we've developed a formula for creating durable yet biodegradable water bottles. Now we need your help to bring this innovation to market.",
  category: "Environment",
  progress: 65,
  target: 5000,
  daysLeft: 12,
  backers: 128,
  image: "/placeholder-campaign-detail.jpg",
  updates: [
    {
      id: 1,
      date: "2023-05-15",
      title: "Prototype Testing Complete",
      content:
        "We've successfully completed testing of our third prototype and are ready for production!",
    },
    {
      id: 2,
      date: "2023-04-28",
      title: "Material Supplier Secured",
      content:
        "Great news! We've partnered with a local recycling facility for our raw materials.",
    },
  ],
  faqs: [
    {
      id: 1,
      question: "How is this different from other eco-bottles?",
      answer:
        "Our proprietary blend makes the material more durable while maintaining full biodegradability.",
    },
    {
      id: 2,
      question: "When will rewards ship?",
      answer:
        "All rewards will ship by their estimated delivery dates shown below.",
    },
  ],
  rewards: [
    {
      id: 1,
      amount: 25,
      title: "Supporter Pack",
      description:
        "Get a thank you note and your name listed on our website as a supporter",
      delivery: "June 2023",
      remaining: 42,
    },
    {
      id: 2,
      amount: 50,
      title: "Early Adopter",
      description:
        "Receive one of our eco-friendly water bottles (plus all previous rewards)",
      delivery: "July 2023",
      remaining: 15,
    },
    {
      id: 3,
      amount: 100,
      title: "VIP Edition",
      description:
        "Special edition bottle with your name engraved (plus all previous rewards)",
      delivery: "August 2023",
      remaining: 8,
    },
  ],
};

export default function CampaignDetails() {
  const { id } = useParams();
  const [donationAmount, setDonationAmount] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [activeTab, setActiveTab] = useState("story");
  const [expandedFaq, setExpandedFaq] = useState(null);

  // In a real app, we would fetch campaign data based on the id
  const campaign = mockCampaign;

  const raisedAmount = Math.floor(campaign.target * (campaign.progress / 100));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Campaign Header */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="h-80 w-full overflow-hidden">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {campaign.category}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  {campaign.daysLeft} {campaign.daysLeft === 1 ? "day" : "days"}{" "}
                  left
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {campaign.title}
              </h1>
              <p className="text-lg text-gray-600">{campaign.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Creator Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center">
                <img
                  src={campaign.creatorAvatar}
                  alt={campaign.creator}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Created by</h3>
                  <p className="text-gray-600">{campaign.creator}</p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("story")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "story"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Story
                </button>
                <button
                  onClick={() => setActiveTab("updates")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "updates"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Updates ({campaign.updates.length})
                </button>
                <button
                  onClick={() => setActiveTab("faqs")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "faqs"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  FAQs ({campaign.faqs.length})
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              {activeTab === "story" && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Our Story
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {campaign.story}
                  </p>
                </div>
              )}

              {activeTab === "updates" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Updates
                  </h2>
                  {campaign.updates.map((update) => (
                    <div
                      key={update.id}
                      className="pb-6 border-b border-gray-200 last:border-0 last:pb-0"
                    >
                      <h3 className="text-lg font-medium text-gray-900">
                        {update.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {new Date(update.date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700">{update.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "faqs" && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Frequently Asked Questions
                  </h2>
                  {campaign.faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        className="w-full px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-50 flex justify-between items-center"
                        onClick={() =>
                          setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                        }
                      >
                        <span>{faq.question}</span>
                        <svg
                          className={`h-5 w-5 text-gray-500 transform transition-transform ${
                            expandedFaq === faq.id ? "rotate-180" : ""
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-4 py-3 bg-gray-50 text-gray-700 border-t border-gray-200">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-900">
                    ${raisedAmount.toLocaleString()} raised
                  </span>
                  <span className="text-gray-500">
                    ${campaign.target.toLocaleString()} goal
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className={`h-2.5 rounded-full ${
                      campaign.progress >= 100
                        ? "bg-green-500"
                        : "bg-gradient-to-r from-indigo-500 to-purple-600"
                    }`}
                    style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {campaign.backers.toLocaleString()} backers
                  </span>
                  <span className="text-gray-500">
                    {campaign.daysLeft}{" "}
                    {campaign.daysLeft === 1 ? "day" : "days"} left
                  </span>
                </div>
              </div>

              <DonationForm
                campaign={campaign}
                donationAmount={donationAmount}
                setDonationAmount={setDonationAmount}
                selectedReward={selectedReward}
                setSelectedReward={setSelectedReward}
              />
            </div>

            {/* Rewards Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                Support this project
              </h3>
              <div className="space-y-4">
                {campaign.rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      selectedReward === reward.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedReward(reward.id)}
                  >
                    <div className="font-medium text-gray-900">
                      Pledge ${reward.amount} or more
                    </div>
                    <div className="text-indigo-600 font-medium text-sm mt-1">
                      {reward.title}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {reward.description}
                    </div>
                    <div className="text-gray-500 text-xs mt-2">
                      Estimated delivery: {reward.delivery}
                    </div>
                    {reward.remaining && (
                      <div className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">{reward.remaining}</span>{" "}
                        left of {reward.remaining + 10}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
