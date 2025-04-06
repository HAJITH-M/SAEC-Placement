  import React from 'react';
  import { Github, Linkedin } from 'lucide-react';

  const OurDevelopers = () => {
    const developers = [
      {
        id: 1,
        name: "Sai Teja",
        role: "Full Stack Developer",
        image: "https://randomuser.me/api/portraits/men/1.jpg",
        github: "https://github.com/saiteja",
        linkedin: "https://linkedin.com/in/saiteja",
        contribution: "Led the backend development and API integration"
      },
      {
        id: 2,
        name: "Sai Kiran",
        role: "Frontend Developer",
        image: "https://randomuser.me/api/portraits/men/2.jpg",
        github: "https://github.com/saikiran",
        linkedin: "https://linkedin.com/in/saikiran",
        contribution: "Designed and implemented the user interface"
      },
      {
        id: 3,
        name: "Sai Krishna",
        role: "Backend Developer",
        image: "https://randomuser.me/api/portraits/men/3.jpg",
        github: "https://github.com/saikrishna",
        linkedin: "https://linkedin.com/in/saikrishna",
        contribution: "Developed the database architecture and security features"
      },
      {
        id: 4,
        name: "Sai Ram",
        role: "UI/UX Designer",
        image: "https://randomuser.me/api/portraits/men/4.jpg",
        github: "https://github.com/sairam",
        linkedin: "https://linkedin.com/in/sairam",
        contribution: "Created the user experience and visual design"
      },
      {
        id: 5,
        name: "Sai Kumar",
        role: "DevOps Engineer",
        image: "https://randomuser.me/api/portraits/men/5.jpg",
        github: "https://github.com/saikumar",
        linkedin: "https://linkedin.com/in/saikumar",
        contribution: "Managed deployment and infrastructure setup"
      }
    ];

    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-4">Our Development Team</h2>

        <p className="text-center text-gray-600 mb-8">We are grateful for the opportunity to develop this placement portal, which aims to streamline the recruitment process and connect students with their dream careers. We extend our heartfelt thanks to all stakeholders who trusted us with this responsibility. Your support and guidance have been invaluable in making this project a success.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {developers.map((developer) => (
            <div key={developer.id} className="bg-white rounded-lg shadow p-4 transition-transform hover:scale-105">
              <img 
                src={developer.image} 
                alt={developer.name} 
                className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
              />
              <h3 className="text-lg font-semibold text-center mb-1">{developer.name}</h3>
              <p className="text-gray-600 text-sm text-center mb-1">{developer.role}</p>
              <p className="text-xs text-gray-500 text-center mb-3">{developer.contribution}</p>
              <div className="flex justify-center space-x-3">
                <a 
                  href={developer.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  <Github size={20} />
                </a>
                <a 
                  href={developer.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  export default OurDevelopers;