import { Workflow, Loader } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import { fetchData } from '../../services/apiService';

const PlacedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const getStudents = async () => {
      try {
        setLoading(true);
        const response = await fetchData('get-placed-students');
        setStudents(response?.data || []);
      } catch (err) {
        console.error('Error fetching placed students:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getStudents();
  }, []);

  useEffect(() => {
    if (!students.length || searchTerm) return;

    const cardWidth = 220; // Reduced card width
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
      className="text-center flex-shrink-0 p-3  rounded-md shadow-md hover:shadow-lg transition-all duration-200"
      style={{ width: '200px', margin: '8px' }}
    >
      <div className="mb-2">
        <img
          src={student.url || 'placeholder-image.jpg'}
          alt={student.name || 'Student'}
          className="w-24 h-24 object-cover rounded-full mx-auto border-2 border-gray-200"
        />
      </div>
      <div className="text-xs">
        <h3 className="font-semibold text-gray-900 mb-1 text-sm truncate">{student.name || 'Unknown'}</h3>
        <div className="space-y-1 text-gray-600">
          <div className="flex items-center justify-center">
            <FaGraduationCap className="mr-1 text-blue-500 text-xs" />
            <span className="truncate">{student.department || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-center">
            <Workflow className="mr-1 text-green-500 text-xs" />
            <span className="truncate">{student.companyPlacedIn || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-center">
            <FaBriefcase className="mr-1 text-purple-500 text-xs" />
            <span>{student.batch || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const filteredStudents = students.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.companyPlacedIn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.batch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center space-y-2">
          <Loader className="animate-spin w-10 h-10 text-gray-500" />
          <span className="text-gray-500 text-base">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Placed Students</h2>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search students..."
          className="w-full max-w-md mx-auto block px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
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
          className="flex gap-2 justify-center"
          style={{
            transform: `translateX(${searchTerm ? 0 : position}px)`,
            transition: position === 0 ? 'none' : 'transform 0.1s linear',
            flexWrap: searchTerm ? 'wrap' : 'nowrap'
          }}
        >
          {Array.isArray(filteredStudents) && filteredStudents.length > 0 ? (
            <>
              {filteredStudents.map((student, index) => renderStudentCard(student, index))}
              {!searchTerm && filteredStudents.map((student, index) => renderStudentCard(student, `duplicate-${index}`))}
            </>
          ) : (
            <p className="text-center w-full text-gray-500 text-sm py-4">No students found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlacedStudents;