import { Workflow } from 'lucide-react';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { FaGraduationCap, FaBriefcase, FaChartLine, FaHandshake } from 'react-icons/fa';
import { toast } from 'react-toastify';

const PlacedStudents = () => {
  const [students, setStudents] = useState([]);

useEffect (() =>{

 const getStudents = async () => {
  try {
    const response = await axios.get('http://localhost:9999/get-placed-students');
    setStudents(response.data);
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching placed students:', error);
    toast.error("Error in getting the details of placed students")
  }
};

getStudents();

}, [])

  return (
    <div className="container mx-auto py-10 lg:py-16 px-4">
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8 lg:mb-12 text-black">Placed Students</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {students.map((student, index) => (
          <div key={index} className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="relative">
              <img 
                src={student.url} 
                alt={student.name}
                className="w-full h-56 object-cover rounded-t-xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-20"/>
            </div>
            <div className="p-6">
              <h2 className="font-bold text-xl mb-2 text-gray-800">{student.name}</h2>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <FaGraduationCap className="mr-2" />
                  <span>{student.department}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Workflow className="mr-2" />
                  <span>{student.companyPlacedIn}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaBriefcase className="mr-2" />
                  <span>Batch: {student.batch}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaBriefcase className="mr-2" />
                  <span>Company: {student.companyPlacedIn}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlacedStudents;
