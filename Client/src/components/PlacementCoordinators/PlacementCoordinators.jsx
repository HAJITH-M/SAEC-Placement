import React from "react";
import { Phone, Mail, MapPin, User } from "lucide-react";

const PlacementCoordinators = () => {
  const coordinator = {
    name: "Dr. Yuvaraman Pandurangan, Ph.D",
    title: "Head – Corporate Relations, Placements & Training",
    institution: "S.A. Engineering College, Chennai-77",
    landline: "044 26801999 (Ext: 264)",
    mobile: "9940084070",
    emails: ["placement@saec.ac.in", "dryuvaramanp@saec.ac.in"],
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 m-4 hover:shadow-lg transition-shadow">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 text-center">
        Placement Coordinator Contact
      </h2>
      <div className="space-y-4">
        {/* Name and Title */}
        <div className="flex items-center">
          <User size={24} className="text-blue-500 mr-3" />
          <div>
            <p className="text-lg font-semibold text-gray-700">{coordinator.name}</p>
            <p className="text-sm text-gray-600">{coordinator.title}</p>
          </div>
        </div>

        {/* Institution */}
        <div className="flex items-center">
          <MapPin size={24} className="text-green-500 mr-3" />
          <p className="text-md text-gray-700">{coordinator.institution}</p>
        </div>

        {/* Landline */}
        <div className="flex items-center">
          <Phone size={24} className="text-orange-500 mr-3" />
          <div>
            <p className="text-md text-gray-700">
              <span className="font-semibold">Landline:</span> {coordinator.landline}
            </p>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex items-center">
          <Phone size={24} className="text-purple-500 mr-3" />
          <div>
            <p className="text-md text-gray-700">
              <span className="font-semibold">Mobile:</span> {coordinator.mobile}
            </p>
          </div>
        </div>

        {/* Emails */}
        <div className="flex items-start">
          <Mail size={24} className="text-red-500 mr-3 mt-1" />
          <div>
            <p className="text-md font-semibold text-gray-700">Emails:</p>
            <ul className="list-none space-y-1">
              {coordinator.emails.map((email, index) => (
                <li key={index}>
                  <a
                    href={`mailto:${email}`}
                    className="text-md text-blue-600 hover:underline"
                  >
                    {email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementCoordinators;