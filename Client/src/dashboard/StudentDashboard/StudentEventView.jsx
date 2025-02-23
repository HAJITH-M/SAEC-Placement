  import React, { useState } from 'react'
  import { Calendar, Clock, MapPin, Trophy, Users } from 'lucide-react'

  const StudentEventView = () => {
    const [selectedImage, setSelectedImage] = useState(null)
    const events = [
      {
        id: 1,
        title: "Tech Hackathon 2024",
        poster: "https://th.bing.com/th/id/OIP.Ezbe6tOZfAPvdSDbtatejwHaHa?rs=1&pid=ImgDetMain",
        date: "March 15, 2024",
        time: "9:00 AM - 6:00 PM",
        venue: "University Main Hall",
        prize: "$5000"
      },
      {
        id: 2,
        title: "Code Sprint Challenge",
        poster: "https://example.com/codesprint-poster.jpg",
        date: "April 2, 2024",
        time: "10:00 AM - 8:00 PM",
        venue: "Innovation Center",
        prize: "$3000"
      },
      {   id: 3,
          poster: "https://th.bing.com/th/id/OIP.Ezbe6tOZfAPvdSDbtatejwHaHa?rs=1&pid=ImgDetMain",
      }
    ]

    return (
      <div className="p-6 bg-gray-50">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Upcoming Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            event.title ? (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <img 
                src={event.poster} 
                alt={event.title}

                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => setSelectedImage(event.poster)}
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{event.title}</h3>

                <div className="space-y-2">
                  {event.date && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>{event.date}</span>
                    </div>
                  )}

                  {event.time && (
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-2" />
                      <span>{event.time}</span>
                    </div>
                  )}

                  {event.venue && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{event.venue}</span>
                    </div>
                  )}

                  {event.prize && (
                    <div className="flex items-center text-gray-600">
                      <Trophy className="w-5 h-5 mr-2" />
                      <span>Prize Pool: {event.prize}</span>
                    </div>
                  )}
                </div>

                <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300">
                  Register Now
                </button>
              </div>
            </div>
            ) : (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-48">

                <img 
                  src={event.poster} 
                  alt="Event" 
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedImage(event.poster)}
                />
              </div>
            )
          ))}
        </div>

        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
            <div className="max-w-4xl max-h-[90vh] p-2 bg-white rounded-lg">
              <img src={selectedImage} alt="Event" className="max-w-full max-h-[85vh] object-contain" />
            </div>
          </div>
        )}
      </div>
    )
  }

  export default StudentEventView