import { Workflow } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import { fetchData } from '../../services/apiService';

const PlacedStudents = () => {
  const [students, setStudents] = useState([]); // Already initialized as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStudents = async () => {
      try {
        setLoading(true);
        const response = await fetchData('/get-placed-students');
        // Ensure we set an array even if response.data is undefined
        setStudents(response?.data || []);
        console.log('Students data:', response?.data);
      } catch (err) {
        console.error('Error fetching placed students:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getStudents();
  }, []);

  if (loading) return <div className="text-center py-10">Loading students...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto py-10 lg:py-16 px-4">
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12 text-black">Placed Students</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.isArray(students) && students.length > 0 ? (
          students.map((student, index) => (
            <div key={index} className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative">
                <img 
                  src={student.url || 'placeholder-image.jpg'}
                  alt={student.name || 'Student'}
                  className="w-full h-56 object-cover rounded-t-xl"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-20"/>
              </div>
              <div className="p-6">
                <h2 className="font-bold text-xl mb-2 text-gray-800">{student.name || 'Unknown'}</h2>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FaGraduationCap className="mr-2" />
                    <span>{student.department || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Workflow className="mr-2" />
                    <span>{student.companyPlacedIn || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaBriefcase className="mr-2" />
                    <span>Batch: {student.batch || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FaBriefcase className="mr-2" />
                    <span>Company: {student.companyPlacedIn || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full">No students data available</p>
        )}
      </div>
    </div>
  );
};

export default PlacedStudents;