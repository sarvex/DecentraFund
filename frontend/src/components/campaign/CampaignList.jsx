import React, { useState, useEffect } from "react";
import CampaignCard from "./CampaignCard";
import { getContract } from "../../hooks/useContract";
import CampaignFactory from "../../contracts/CampaignFactory.json";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const CampaignList = ({ key }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = async () => {
    try {
      const factory = await getContract(
        process.env.REACT_APP_FACTORY_ADDRESS,
        CampaignFactory.abi
      );
      const campaignAddresses = await factory.getDeployedCampaigns();

      const campaignData = await Promise.all(
        campaignAddresses.map(async (address) => {
          const campaign = await getContract(
            address,
            require("../../contracts/Campaign.json").abi
          );
          const [title, description, goal, creator, currentAmount, deadline] =
            await Promise.all([
              campaign.title(),
              campaign.description(),
              campaign.goal(),
              campaign.creator(),
              campaign.currentAmount(),
              campaign.deadline(),
            ]);

          // Calculate days left
          const daysLeft = Math.max(
            0,
            Math.floor(
              (deadline.toNumber() - Math.floor(Date.now() / 1000)) / 86400
            )
          );

          return {
            address,
            title,
            description,
            goal: ethers.utils.formatEther(goal),
            currentAmount: ethers.utils.formatEther(currentAmount),
            creator,
            daysLeft,
            category: "Community", // You can fetch this from your contract if available
          };
        })
      );

      setCampaigns(campaignData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [key]);

  const refreshCampaigns = () => {
    setLoading(true);
    setError(null);
    fetchCampaigns();
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
          <p className="text-lg text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-lg bg-red-50 p-4 shadow-sm border border-red-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading campaigns
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={refreshCampaigns}
                  className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  <ArrowPathIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="p-6 bg-indigo-50 rounded-xl inline-block mb-6">
          <svg
            className="mx-auto h-12 w-12 text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No campaigns found
        </h3>
        <p className="text-gray-500 mb-6">
          Be the first to create a campaign and start raising funds for your
          project.
        </p>
        <button
          onClick={refreshCampaigns}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Active Campaigns</h2>
        <button
          onClick={refreshCampaigns}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowPathIcon className="-ml-0.5 mr-2 h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.address}
            campaign={campaign}
            refreshCampaigns={refreshCampaigns}
          />
        ))}
      </div>
    </div>
  );
};

export default CampaignList;
