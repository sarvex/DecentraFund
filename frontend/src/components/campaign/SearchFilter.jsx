export default function SearchFilter({
  searchTerm,
  setSearchTerm,
  categories,
  selectedCategory,
  setSelectedCategory,
}) {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <label htmlFor="search" className="sr-only">
          Search campaigns
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            id="search"
            name="search"
            type="text"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-3 border-gray-300 rounded-lg text-sm"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setSearchTerm("")}
            >
              <svg
                className="h-5 w-5 text-gray-400 hover:text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            selectedCategory === "All"
              ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories
          .filter((c) => c !== "All")
          .map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
      </div>

      {/* Active Filters (optional) */}
      {(searchTerm || selectedCategory !== "All") && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Search: {searchTerm}
              <button
                type="button"
                className="ml-1.5 inline-flex text-indigo-400 hover:text-indigo-500"
                onClick={() => setSearchTerm("")}
              >
                <span className="sr-only">Remove filter</span>
                <svg
                  className="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
          )}
          {selectedCategory !== "All" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Category: {selectedCategory}
              <button
                type="button"
                className="ml-1.5 inline-flex text-indigo-400 hover:text-indigo-500"
                onClick={() => setSelectedCategory("All")}
              >
                <span className="sr-only">Remove filter</span>
                <svg
                  className="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
