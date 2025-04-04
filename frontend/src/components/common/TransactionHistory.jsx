import React from "react";
import { useContractContext } from "../../context/ContractContext";
import { formatDistanceToNow } from "date-fns";

const TransactionHistory = () => {
  const { txHistory } = useContractContext();

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Transaction History
      </h2>

      {txHistory.length === 0 ? (
        <p className="text-gray-500">No transactions yet</p>
      ) : (
        <div className="space-y-4">
          {txHistory.map((tx) => (
            <div key={tx.hash} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(tx.timestamp))} ago
                  </p>
                  <p className="text-sm font-mono text-gray-600 truncate max-w-xs">
                    {tx.hash}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    tx.status
                  )}`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
