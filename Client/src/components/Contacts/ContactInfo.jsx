import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";

const HEAD_COORDINATOR = {
  name: "Dr. Yuvaraman Pandurangan, Ph.D",
  title: "Head – Corporate Relations, Placements & Training",
  institution: "S.A. Engineering College, Chennai-77",
  landline: "044 26801999 (Ext: 264)",
  mobile: "9940084070",
  emails: ["placement@saec.ac.in", "dryuvaramanp@saec.ac.in"],
};


const DEVELOPERS = [
  {
    name: "Mohammed Hajith",
    dept: "Computer Science",
    batch: "2021-2025",
    email: "mhajith2003@gmail.com ",
  },
  {
    name: "Madhumitta P",
    dept: "Computer Science",
    batch: "2021-2025",
    email: "madhumegha900@gmail.com",
  },
  {
    name: "Kirthevasen K",
    dept: "Computer Science",
    batch: "2021-2025",
    email: "vasen2353@gmail.com",
  },
  {
    name: "Usha Nandhini G",
    dept: "Computer Science",
    batch: "2021-2025",
    email: "gushanandhini2004@gmail.com",
  },
];

const ContactInfo = () => {
  const getInitials = (name) => {
    const names = name.split(" ");
    const initials = names
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    return initials;
  };

  return (
    <div className="container mx-auto px-4 py-8">


      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-6 relative px-2">
        <span className="inline-block pb-1 border-b-4 border-[#FD7201]">
          Placement Head and Coordinator
        </span>
      </h2>


      <div className="max-w-sm mx-auto mb-8 px-2">
        <div className="w-full border border-gray-300 rounded-lg shadow-lg bg-white p-4 md:p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 flex items-center justify-center bg-[#FD7201] text-white text-lg font-semibold rounded-full shrink-0">
              {getInitials(HEAD_COORDINATOR.name)}
            </div>



            <div className="flex-1 min-w-0">
              <div className="text-gray-900 font-medium break-words">{HEAD_COORDINATOR.name}</div>
              <div className="text-gray-600 text-sm break-words">{HEAD_COORDINATOR.title}</div>
            </div>
          </div>




          <div className="flex items-start text-gray-700">
            <MapPin size={20} className="text-gray-500 mr-2 flex-shrink-0 mt-1" />
            <span className="break-words">{HEAD_COORDINATOR.institution}</span>
          </div>

          <div className="space-y-2">



            <div className="flex items-start text-gray-700">
              <Phone size={20} className="text-gray-500 mr-2 flex-shrink-0 mt-1" />
              <span className="break-words">Landline: {HEAD_COORDINATOR.landline}</span>
            </div>

            <div className="flex items-center text-gray-700">


              <Phone size={20} className="text-gray-500 mr-2 flex-shrink-0" />
              <span className="break-words">{HEAD_COORDINATOR.mobile}</span>
            </div>

            <div className="flex items-start text-gray-700">


              <Mail size={20} className="text-gray-500 mr-2 flex-shrink-0 mt-1" />
              <div className="flex-1">
                {HEAD_COORDINATOR.emails.map((email, idx) => (
                  <a
                    key={idx}
                    href={`mailto:${email}`}
                    className="block text-orange-600 hover:underline break-all"
                  >
                    {email}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>



      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4 relative px-2">
        <span className="inline-block pb-1 border-b-4 border-[#FD7201]">
          Developers Contact
        </span>
      </h2>




      <p className="text-center text-gray-600 mb-6 mx-auto w-full px-4 md:w-[80%] lg:w-[60%]">
        Developed with dedication and excellence by <span className="font-semibold">final year students (Batch 2021–2025)</span>, this <span className="font-semibold">Placement Portal</span> reflects their technical prowess and collaborative spirit.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 px-2">
        {DEVELOPERS.map((developer, index) => (
          <div
            key={index}
            className="w-full border border-gray-200 rounded-xl shadow-md bg-white p-4 md:p-5 transition-shadow hover:shadow-lg"
          >

            <div className="flex items-start space-x-4">
              <div className="h-12 w-12 flex items-center justify-center bg-[#FD7201] text-white text-lg font-semibold rounded-full flex-shrink-0">
                {getInitials(developer.name)}
              </div>
              <div className="min-w-0 flex-1">

                <div className="text-gray-900 font-semibold text-base break-words">
                  {developer.name}
                </div>

                <div className="text-gray-600 text-sm break-words">
                  {developer.dept
                    ? `Dept - ${developer.dept.toUpperCase()}`
                    : "Coordinator"}
                </div>

                <div className="text-gray-600 text-sm break-words">
                  Batch: {developer.batch}
                </div>
                <div className="flex items-start text-gray-700">

                  <Mail size={18} className="text-gray-500 mr-2 mt-1 flex-shrink-0" />
                  <a
                    href={`mailto:${developer.email}`}
                    className="text-orange-600 hover:underline text-sm break-all"
                  >
                    {developer.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactInfo;