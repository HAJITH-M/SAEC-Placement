import React, { useState, useEffect } from 'react';
import { Mail, Phone, Book, Code, Languages, Award, Briefcase, Github, Linkedin, Hash, Building, AlertCircle, Edit2, Check } from 'lucide-react';
import axios from 'axios';
import { User } from 'lucide-react';

const StudentProfileView = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState({});
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data:image/jpeg;base64,
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64File = await base64Promise;

      // Prepare data to send to backend
      const uploadData = {
        file: base64File,
        fileName: file.name,
        fileType: file.type,
      };

      const response = await axios.patch(
        'http://localhost:9999/student/resume',
        uploadData,
        { withCredentials: true }
      );

      const updatedStudent = response.data;
      setStudentData((prev) => ({
        ...prev,
        url: updatedStudent.url, // Update the url field with the new URL
      }));
    } catch (err) {
      console.error('Error uploading profile picture:', err.response?.data || err.message);
      setError('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };


  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get('http://localhost:9999/student/resume', {
          withCredentials: true,
        });
        console.log('Fetched Student Data:', response.data);

        setStudentData({
          name: response.data.name || 'N/A',
          emailId: response.data.email || 'N/A',
          phoneNumber: response.data.phoneNumber || 'N/A',
          regNo: response.data.regNo || 'N/A',
          department: response.data.department || 'N/A',
          tenthMark: response.data.tenthMark || 'N/A',
          twelfthMark: response.data.twelfthMark || 'N/A',
          cgpa: response.data.cgpa || 'N/A',
          url:response.data.url,
          noOfArrears: response.data.noOfArrears || '0',
          skillSet: response.data.skillSet || 'N/A',
          languagesKnown: response.data.languagesKnown || 'N/A',
          linkedinUrl: response.data.linkedinUrl || 'N/A',
          githubUrl: response.data.githubUrl || 'N/A',
          batch: response.data.batch || 'N/A',
        });
      } catch (err) {
        console.error('Error fetching student data:', err.response?.data || err.message);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);



  const handleEdit = async (field) => {
    if (editing[field]) {
      try {
        let value = studentData[field] === 'N/A' ? null : studentData[field];
        if (['tenthMark', 'twelfthMark', 'cgpa', 'noOfArrears'].includes(field) && value) {
          value = parseInt(value, 10); // Parse as integer
          if (isNaN(value)) value = null; // Handle invalid input
        }

        const updateData = {
          [field === 'emailId' ? 'email' : field]: value,
        };

        console.log('Sending update:', updateData);

        const response = await axios.patch('http://localhost:9999/student/resume', updateData, {
          withCredentials: true,
        });
        console.log('Update Response:', response.data);

        setStudentData((prev) => ({
          ...prev,
          [field]: response.data[field] || studentData[field],
        }));
      } catch (err) {
        console.error('Error updating field:', err.response?.data || err.message);
        setError(`Failed to update ${field}: ${err.response?.data?.error || 'Unknown error'}`);
        return;
      }
    }
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field, value) => {
    if (['tenthMark', 'twelfthMark', 'cgpa', 'noOfArrears'].includes(field)) {
      // Allow only integers
      const intValue = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
      setStudentData((prev) => ({ ...prev, [field]: intValue }));
    } else {
      setStudentData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const renderField = (field, value, label, isPercentage = false) => {
    const displayValue = isPercentage && value !== 'N/A' ? `${value}%` : value;
    return editing[field] ? (
      <div className="flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          className="font-medium border-b border-gray-300 focus:outline-none focus:border-orange-500 py-1 px-2 rounded"
          placeholder={isPercentage ? "Enter integer (e.g., 85)" : ""}
        />
        <Check
          className="w-5 h-5 ml-2 text-green-500 cursor-pointer hover:text-green-600"
          onClick={() => handleEdit(field)}
        />
      </div>
    ) : (
      <div className="flex items-center">
        <p className="font-medium text-gray-800">{displayValue}</p>
        <Edit2
          className="w-5 h-5 ml-2 text-gray-500 cursor-pointer hover:text-orange-500"
          onClick={() => handleEdit(field)}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600 text-lg">No student data available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="mx-auto w-full ">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">



            <h1 className="text-2xl font-bold">
              <div>{renderField('name', studentData.name, 'Name')}</div>
            </h1>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8 ">
            {/* Personal Information */}
            <div className="">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              <div className="flex gap-8 md:flex">
                {/* Profile Picture on Left */}
                <div className="w-48">
                  <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center">
                    {studentData.url ? (
                      <img 
                        src={studentData.url} 
                        alt="Profile" 
                 className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-20 h-20 text-gray-400" />
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-center">
                    <label className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                      <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                    </label>
                  </div>
                </div>     

                {/* Information on Right */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      {renderField('emailId', studentData.emailId, 'Email')}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      {renderField('phoneNumber', studentData.phoneNumber, 'Phone Number')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Hash className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Registration Number</p>
                      {renderField('regNo', studentData.regNo, 'Registration Number')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      {renderField('department', studentData.department, 'Department')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Batch</p>
                      {renderField('batch', studentData.batch, 'Batch')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">10th Mark</p>
                    {renderField('tenthMark', studentData.tenthMark, '10th Mark', true)}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">12th Mark</p>
                    {renderField('twelfthMark', studentData.twelfthMark, '12th Mark', true)}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Book className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">CGPA</p>
                    {renderField('cgpa', studentData.cgpa, 'CGPA', true)}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Arrears</p>
                    {renderField('noOfArrears', studentData.noOfArrears, 'Arrears')}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Languages */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Skills & Languages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Code className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Skills</p>
                    {renderField('skillSet', studentData.skillSet, 'Skills')}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Languages className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Languages Known</p>
                    {renderField('languagesKnown', studentData.languagesKnown, 'Languages Known')}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Links */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Links</h2>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-8">
                <div className="flex items-center">
                  {editing.linkedinUrl ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={studentData.linkedinUrl}
                        onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                        className="font-medium border-b border-gray-300 focus:outline-none focus:border-orange-500 py-1 px-2 rounded"
                      />
                      <Check
                        className="w-5 h-5 ml-2 text-green-500 cursor-pointer hover:text-green-600"
                        onClick={() => handleEdit('linkedinUrl')}
                      />
                    </div>
                  ) : (
                    <>
                      <a
                        href={studentData.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-orange-500 hover:text-orange-600"
                      >
                        <Linkedin className="w-6 h-6" />
                        <span>LinkedIn</span>
                      </a>
                      <Edit2
                        className="w-5 h-5 ml-2 text-gray-500 cursor-pointer hover:text-orange-500"
                        onClick={() => handleEdit('linkedinUrl')}
                      />
                    </>
                  )}
                </div>
                <div className="flex items-center">
                  {editing.githubUrl ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={studentData.githubUrl}
                        onChange={(e) => handleChange('githubUrl', e.target.value)}
                        className="font-medium border-b border-gray-300 focus:outline-none focus:border-orange-500 py-1 px-2 rounded"
                      />
                      <Check
                        className="w-5 h-5 ml-2 text-green-500 cursor-pointer hover:text-green-600"
                        onClick={() => handleEdit('githubUrl')}
                      />
                    </div>
                  ) : (
                    <>
                      <a
                        href={studentData.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-orange-500 hover:text-orange-600"
                      >
                        <Github className="w-6 h-6" />
                        <span>GitHub</span>
                      </a>
                      <Edit2
                        className="w-5 h-5 ml-2 text-gray-500 cursor-pointer hover:text-orange-500"
                        onClick={() => handleEdit('githubUrl')}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileView;