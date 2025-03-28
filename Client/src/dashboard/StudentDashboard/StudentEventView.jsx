import React, { useState, useEffect } from "react";
import { Calendar, MapPin } from "lucide-react"; // Removed unused Clock icon
import { fetchData } from "../../services/apiService";

const StudentEventView = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("Fetching events from server...");
        const response = await fetchData("/get-events");
        console.log("API response:", response.data);
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <span className="text-gray-600 text-lg">Loading events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-0 px-4 sm:px-6 lg:px-0">
      <div className=" mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold">Events</h2>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8 bg-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.length > 0 ? (
                events.map((event, index) => (
                  <div
                    key={event.id || index}
                    className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <img
                      src={event.url || "https://via.placeholder.com/300"}
                      alt={event.name || "Event Image"}
                      className="w-full h-48 object-cover cursor-pointer"
                      onClick={() => setSelectedImage(event.url)}
                    />

                    <div className="p-4 space-y-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                        {event.name || "No Event Name"}
                      </h3>

                      <div className="space-y-2">
                        {event.date && (
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500">Date</p>
                              <p className="text-gray-800">{event.date}</p>
                            </div>
                          </div>
                        )}

                        {event.link && (
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500">Event Link</p>
                              <p className="text-gray-800">Available</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Register Now button */}
                      {event.link ? (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors duration-300 text-center text-sm sm:text-base"
                        >
                          Register Now
                        </a>
                      ) : (
                        <div className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg text-center text-sm sm:text-base">
                          No Link Available
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-gray-600 text-lg">
                  No events found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal for enlarged image */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl max-h-[90vh] p-2 bg-white rounded-lg shadow-xl">
              <img
                src={selectedImage}
                alt="Event"
                className="max-w-full max-h-[85vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEventView;