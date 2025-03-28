import { Workflow, Loader } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import './PlacedStudents.css';
import { fetchData } from '../../services/apiService';

const PlacedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

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

  // Auto-scroll effect
  useEffect(() => {
    if (!scrollRef.current || students.length === 0) return;

    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;
    const scrollSpeed = 1; // Adjust this value to change speed
    const scrollStep = () => {
      if (scrollContainer) {
        scrollAmount += scrollSpeed;
        scrollContainer.scrollLeft = scrollAmount;

        // Reset when reaching the end
        if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth) {
          scrollAmount = 0;
        }
      }
      requestAnimationFrame(scrollStep);
    };

    const animationFrame = requestAnimationFrame(scrollStep);

    // Cleanup
    return () => cancelAnimationFrame(animationFrame);
  }, [students]);

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center space-y-2">
          <Loader className="animate-spin w-12 h-12 text-gray-500" />
          <span className="text-gray-500 text-lg">Loading students...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8 lg:py-12 px-4">
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-6 lg:mb-10 text-gray-800">Placed Students</h2>
      <div 
        ref={scrollRef}
        className="overflow-x-auto whitespace-nowrap pb-4 scroll-smooth"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
      >
        {Array.isArray(students) && students.length > 0 ? (
          students.map((student, index) => (
            <div
              key={index}
              className="inline-block mx-4 align-top text-center"
              style={{ minWidth: '200px' }}
            >
              <div className="mb-3">
                <img
                  src={student.url || 'placeholder-image.jpg'}
                  alt={student.name || 'Student'}
                  className="w-20 h-20 object-cover rounded-full mx-auto border-2 border-gray-200"
                />
              </div>
              <div className="text-sm">
                <h3 className="font-semibold text-gray-900 mb-1">{student.name || 'Unknown'}</h3>
                <div className="space-y-1 text-gray-700">
                  <div className="flex items-center justify-center">
                    <FaGraduationCap className="mr-1 text-blue-500 text-xs" />
                    <span>{student.department || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Workflow className="mr-1 text-green-500 text-xs" />
                    <span>{student.companyPlacedIn || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <FaBriefcase className="mr-1 text-purple-500 text-xs" />
                    <span>{student.batch || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center w-full text-gray-500">No students data available</p>
        )}
      </div>
    </div>
  );
};

export default PlacedStudents;