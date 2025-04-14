import React, { useEffect, useState } from "react";
import { Phone, Search } from "lucide-react";
import { fetchData } from "../../services/apiService";

const PlacementCoordinators = () => {
  const [coordinators, setCoordinators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getCoordinators = async () => {
      try {
        const response = await fetchData("/get-coords");
        setCoordinators(response.data || []);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load coordinators.");
        setIsLoading(false);
      }
    };
    getCoordinators();
  }, []);

  const filteredCoordinators = coordinators.filter(
    (coordinator) =>
      coordinator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coordinator.dept?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get initials for avatar
  const getInitials = (name) => {
    const names = name.split(" ");
    const initials = names
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    return initials;
  };

  const renderCoordinatorCard = (coordinator, index) => (
    <div
      key={index}
      className="w-full max-w-sm border border-gray-200 rounded-xl shadow-md bg-white p-5 transition-shadow hover:shadow-lg"
    >
      {/* Avatar and Name/Department */}
      <div className="flex items-center space-x-4">
        <div
          className="h-12 w-12 flex items-center justify-center bg-[#FD7201] text-white text-lg font-semibold rounded-full flex-shrink-0"
        >
          {getInitials(coordinator.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-gray-900 font-semibold text-base">
            {coordinator.name}
          </div>
          <div className="text-gray-600 text-sm">
            {coordinator.dept
              ? `Dept. Coordinator - ${coordinator.dept.toUpperCase()}`
              : "Coordinator"}
          </div>
          {coordinator.phoneNumber && (
            <div className="flex items-center text-gray-700 mt-1">
              <Phone size={18} className="text-gray-500 mr-2" />
              <span className="text-sm truncate">
                {coordinator.phoneNumber.length > 10
                  ? coordinator.phoneNumber.slice(-10)
                  : coordinator.phoneNumber}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-orange-500" />
          </div>
          <input
            type="text"
            placeholder="Search by name or department..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FD7201] focus:border-transparent text-gray-900 placeholder-gray-500 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <p className="text-center text-gray-600 text-base">
          Loading coordinators...
        </p>
      )}
      {error && (
        <p className="text-center text-red-600 text-base">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {/* Render API coordinators */}
        {!isLoading &&
          filteredCoordinators.length > 0 &&
          filteredCoordinators.map((coordinator, index) =>
            renderCoordinatorCard(coordinator, index)
          )}
        {!isLoading && filteredCoordinators.length === 0 && (
          <p className="text-center text-gray-600 text-base col-span-full">
            No coordinators found.
          </p>
        )}
      </div>
    </div>
  );
};

export default PlacementCoordinators;