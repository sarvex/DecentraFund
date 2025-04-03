import { Link } from "react-router-dom";

export default function CampaignCard({ campaign }) {
  const raisedAmount = Math.floor(campaign.target * (campaign.progress / 100));

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 group">
      {/* Image with category badge */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {campaign.category && (
          <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {campaign.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title and description */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
            {campaign.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {campaign.description}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-900">
              ${raisedAmount.toLocaleString()} raised
            </span>
            <span className="text-gray-500">
              ${campaign.target.toLocaleString()} goal
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                campaign.progress >= 100
                  ? "bg-green-500"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600"
              }`}
              style={{ width: `${Math.min(campaign.progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Days left and CTA */}
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {campaign.daysLeft} {campaign.daysLeft === 1 ? "day" : "days"} left
          </div>
          <Link
            to={`/campaigns/${campaign.id}`}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View details
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Success badge for fully funded campaigns */}
        {campaign.progress >= 100 && (
          <div className="mt-3 inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Fully funded
          </div>
        )}
      </div>
    </div>
  );
}
