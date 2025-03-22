import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Clock, MapPin } from "lucide-react";

const StudentEventView = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("Fetching events from server...");
        const response = await axios.get("http://localhost:9999/get-events");
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
    return <div className="p-6 text-center">Loading events...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Upcoming Events</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div
              key={event.id || index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={event.url || "https://via.placeholder.com/300"}
                alt={event.name || "Event Image"}
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => setSelectedImage(event.url)}
              />

              <div className="p-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {event.name || "No Event Name"}
                </h3>

                <div className="space-y-2">
                  {event.date && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>{event.date}</span>
                    </div>
                  )}

                  {event.link && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="text-gray-700">Event Link Available</span>
                    </div>
                  )}
                </div>

                {/* "Register Now" button with link */}
                {event.link ? (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 text-center"
                  >
                    Register Now
                  </a>
                ) : (
                  <div className="mt-4 w-full bg-gray-400 text-white py-2 px-4 rounded-md text-center">
                    No Link Available
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500">No events found</div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] p-2 bg-white rounded-lg">
            <img
              src={selectedImage}
              alt="Event"
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEventView;