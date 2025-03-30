  import React from 'react';
import PlacedStudents from '../../components/PlacedStudents/PlacedStudents';

  const PlacementInfo = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-orange-500 mb-4">Training & Placement</h2>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-5 text-justify'>
        <p className="text-gray-700 mb-4 border-r border-gray-300 pr-4">
          At SAEC, we strongly believe in complementing the academic endeavors by providing highly comprehensive placements to our students. 
        </p>
        <p className="text-gray-700 mb-4 border-r border-gray-300 pr-4">
            Placements have always been excellent, as we are one among the top preferred destinations to recruit from, for many companies.
        </p>
        <p className="text-gray-700 mb-4 border-r border-gray-300 pr-4">
          We offer pre-placement training to our students in the area of both technical and soft skills, to make them 'Plug & Play' in the industry.
        </p>
        <p className="text-gray-700">
          Talents go barely unrecognized in SAEC, and we have got full potential to place 100% of the eligible students.
        </p>
        </div>          
            </div>
    );
  };

  const StaffHomeView = () => {
    return (
      <div className="w-full">
        <div className="text-orange-500 py-4 sm:py-6 md:py-8 lg:py-12 px-2 sm:px-3 md:px-4 shadow-xl bg-orange-500">           
          <div className="container mx-auto text-center bg-orange-500 max-w-7xl px-2 sm:px-4 lg:px-8">             
            <h1 className="text-xl sm:text-xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 text-white">Welcome to SAEC Placement Portal</h1>             
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-3 sm:mb-4 md:mb-6">Shaping Careers, Building Futures</p>
            {/* <div className="text-sm sm:text-base text-gray-200 grid grid-cols-1 md:grid-cols-4">
              <p>Phone: (044) 2680 1999</p>
              <p>Email: saec@saec.ac.in</p>
              <p>Thiruverkadu, Chennai, India</p>
              <p>TNEA Counselling Code: 1114</p>
            </div>            */}
          </div>         
        </div>
        <PlacedStudents/>
        <PlacementInfo />
      </div>
    );
  };

  export default StaffHomeView;