import { useState } from "react";
import { Tab } from "@headlessui/react";
import CampaignCard from "../components/campaign/CampaignCard";

const mockCreatedCampaigns = [
  {
    id: 1,
    title: "Eco-Friendly Water Bottles",
    description: "Sustainable water bottles made from 100% recycled materials",
    progress: 65,
    target: 5000,
    daysLeft: 12,
    category: "Environment",
  },
  {
    id: 2,
    title: "Urban Garden Initiative",
    description: "Creating community gardens in food desert neighborhoods",
    progress: 42,
    target: 10000,
    daysLeft: 25,
    category: "Community",
  },
];

const mockBackedCampaigns = [
  {
    id: 3,
    title: "Solar Panel Project",
    description: "Bringing solar energy to low-income households",
    progress: 89,
    target: 15000,
    daysLeft: 5,
    category: "Environment",
    pledgeAmount: 50,
    reward: "Special thank you package",
  },
  {
    id: 4,
    title: "Children's Coding Camp",
    description: "Free programming classes for underprivileged youth",
    progress: 120,
    target: 8000,
    daysLeft: 0,
    category: "Education",
    pledgeAmount: 100,
    reward: "Early access to curriculum",
  },
];

export default function Dashboard() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold">Your Dashboard</h1>
            <p className="text-gray-600">
              Manage your campaigns and contributions
            </p>
          </div>

          <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            <Tab.List className="flex border-b border-gray-200">
              <Tab
                className={({ selected }) =>
                  `px-4 py-3 text-sm font-medium focus:outline-none ${
                    selected
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`
                }
              >
                My Campaigns
              </Tab>
              <Tab
                className={({ selected }) =>
                  `px-4 py-3 text-sm font-medium focus:outline-none ${
                    selected
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`
                }
              >
                Backed Projects
              </Tab>
              <Tab
                className={({ selected }) =>
                  `px-4 py-3 text-sm font-medium focus:outline-none ${
                    selected
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`
                }
              >
                Account Settings
              </Tab>
            </Tab.List>
            <Tab.Panels className="p-6">
              <Tab.Panel>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Campaigns You've Created
                  </h2>
                  {mockCreatedCampaigns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {mockCreatedCampaigns.map((campaign) => (
                        <CampaignCard
                          key={campaign.id}
                          campaign={campaign}
                          isOwner={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        You haven't created any campaigns yet
                      </p>
                      <a
                        href="/create-campaign"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Start a Campaign
                      </a>
                    </div>
                  )}
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Projects You've Backed
                  </h2>
                  {mockBackedCampaigns.length > 0 ? (
                    <div className="space-y-6">
                      {mockBackedCampaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="mb-4 md:mb-0">
                              <h3 className="font-medium">{campaign.title}</h3>
                              <p className="text-sm text-gray-500">
                                {campaign.description}
                              </p>
                            </div>
                            <div className="text-sm">
                              <div className="text-gray-700">
                                Pledged: ${campaign.pledgeAmount}
                              </div>
                              <div className="text-gray-500">
                                Reward: {campaign.reward}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        You haven't backed any projects yet
                      </p>
                    </div>
                  )}
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Account Settings
                  </h2>
                  <p className="text-gray-500">Coming soon</p>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
}
