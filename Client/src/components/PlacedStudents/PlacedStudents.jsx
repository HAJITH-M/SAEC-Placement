import { Workflow, Loader, Building2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import {
  FaGraduationCap,
  FaBriefcase,
  FaGithub,
  FaYoutube,
  FaTwitter,
  FaTwitch,
} from "react-icons/fa";
import { fetchData } from "../../services/apiService";

const PlacedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const getStudents = async () => {
      try {
        setLoading(true);
        const response = await fetchData("get-placed-students");
        setStudents(response?.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getStudents();
  }, []);

  useEffect(() => {
    if (!students.length || searchTerm) return;

    const cardWidth = 320;
    const totalWidth = students.length * cardWidth;

    const marqueeAnimation = () => {
      setPosition((prevPosition) => {
        let newPosition = prevPosition - 1;
        if (Math.abs(newPosition) >= totalWidth) {
          return 0;
        }
        return newPosition;
      });
    };

    const animationInterval = setInterval(marqueeAnimation, 30);
    return () => clearInterval(animationInterval);
  }, [students.length, searchTerm]);

  const renderStudentCard = (student, index) => (
    <div
      key={index}
      className="flex items-center p-3 h-32 bg-white rounded-lg shadow-lg hover:border-orange-500 border border-gray-200 transition-all duration-200"
      style={{
        margin: "12px",
        width: "300px",
        minWidth: "300px",
        maxWidth: "300px",
      }}
    >
      <section className="flex-shrink-0 flex justify-center items-center w-20 h-20 rounded-full bg-transparent">
        <img
          src={student.url || "placeholder-image.jpg"}
          alt={student.name || "Student"}
          className="w-20 h-20 object-cover rounded-full border-2 border-gray-200"
          style={{
            objectFit: "cover",
            imageRendering: "crisp-edges", // Ensures sharp edges
          }}
          loading="lazy"
        />
      </section>

      <section className="flex-grow block border-l border-gray-300 m-3 min-w-0">
        <div className="pl-3 gap-1 flex flex-col">
          <h3 className="text-black font-medium text-sm truncate">
            {student.name || "Unknown"}
          </h3>
          <h3 className="text-gray-500 text-base font-medium truncate flex items-center gap-1">
            <Building2 className="w-4 h-4 text-orange-500" />
            {student.companyPlacedIn || "N/A"}
          </h3>
        </div>

        <div className="flex gap-5 pt-1 pl-3">
          <div className="flex items-center text-black text-sm">
            <FaGraduationCap className="w-4 h-4 text-orange-500 mr-1" />
            <span className="truncate">{student.department || "N/A"}</span>
          </div>
          <div className="flex items-center text-black text-sm">
            <FaBriefcase className="w-4 h-4 text-orange-500 mr-1" />
            <span>{student.batch || "N/A"}</span>
          </div>
        </div>
      </section>
    </div>
  );

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.companyPlacedIn
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.batch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center space-y-3">
          <Loader className="animate-spin w-12 h-12 text-orange-500" />
          <span className="text-black text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 text-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-10 lg:py-16 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 text-black">
          Placed Students
        </h2>
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search students..."
            className="w-full max-w-lg mx-auto block px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPosition(0);
            }}
          />
        </div>
        <div className="relative overflow-hidden">
          <div
            ref={containerRef}
            className="flex"
            style={{
              transform: `translateX(${searchTerm ? 0 : position}px)`,
              transition: position === 0 ? "none" : "transform 0.1s linear",
              flexWrap: searchTerm ? "wrap" : "nowrap",
            }}
          >
            {Array.isArray(filteredStudents) && filteredStudents.length > 0 ? (
              <>
                {filteredStudents.map((student, index) =>
                  renderStudentCard(student, index)
                )}
                {!searchTerm &&
                  filteredStudents.map((student, index) =>
                    renderStudentCard(student, `duplicate-${index}`)
                  )}
              </>
            ) : (
              <p className="text-center w-full text-black text-base py-6">
                No students found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacedStudents;