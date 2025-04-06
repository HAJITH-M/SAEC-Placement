import React, { useState, useEffect } from 'react';
import { Mail, Phone, Book, Code, Languages, Award, Briefcase, Github, Linkedin, Hash, Building, AlertCircle, Edit2, Check, User, Loader } from 'lucide-react';
import { fetchData, patchData } from '../../services/apiService';

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
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64File = await base64Promise;

      const uploadData = {
        file: base64File,
        fileName: file.name,
        fileType: file.type,
      };

      const response = await patchData(
        '/student/resume',
        uploadData,
        { withCredentials: true }
      );

      const updatedStudent = response.data;
      setStudentData((prev) => ({
        ...prev,
        url: updatedStudent.url,
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
        const response = await fetchData('/student/resume', {
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
          url: response.data.url,
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
          value = parseInt(value, 10);
          if (isNaN(value)) value = null;
        }

        const updateData = {
          [field === 'emailId' ? 'email' : field]: value,
        };

        console.log('Sending update:', updateData);

        const response = await patchData('/student/resume', updateData, {
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
      const intValue = value.replace(/[^0-9]/g, '');
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
          className="font-medium border-b border-gray-300 focus:outline-none focus:border-orange-500 py-1 px-2 rounded w-full sm:w-auto"
          placeholder={isPercentage ? "Enter integer (e.g., 85)" : ""}
        />
        <Check
          className="w-5 h-5 ml-2 text-green-500 cursor-pointer hover:text-green-600"
          onClick={() => handleEdit(field)}
        />
      </div>
    ) : (
      <div className="flex items-center">
        <p className="font-medium text-gray-800 break-words">{displayValue}</p>
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
        <div className="flex flex-col items-center space-y-2">
          <Loader className="animate-spin w-12 h-12 text-gray-500" />
          <span className="text-gray-600 text-lg">Loading profile...</span>
        </div>
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
    <div className="min-h-screen bg-slate-50 py-6 lg:p-0 px-4 sm:px-6 lg:px-0">
      <div className="mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold">
              <p className="font-medium text-white break-words">{studentData.name}</p>
            </h1>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6 bg-slate-100">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0 w-full md:w-48 flex flex-col items-center">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {studentData.url ? (
                      <img
                        src={studentData.url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="cursor-pointer bg-orange-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                      <input type="file" onChange={handleFileUpload} className="hidden" accept="image/*" />
                      {uploading ? 'Uploading...' : 'Upload Photo'}
                    </label>
                  </div>
                </div>

                {/* Information */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                    <div className="w-full">
                      <p className="text-xs sm:text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800 break-words">{studentData.emailId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                    <div className="w-full">
                      <p className="text-xs sm:text-sm text-gray-500">Phone Number</p>
                      {renderField('phoneNumber', studentData.phoneNumber, 'Phone Number')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Hash className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                    <div className="w-full">
                      <p className="text-xs sm:text-sm text-gray-500">Registration Number</p>
                      {renderField('regNo', studentData.regNo, 'Registration Number')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                    <div className="w-full">
                      <p className="text-xs sm:text-sm text-gray-500">Department</p>
                      <p className="font-medium text-gray-800 break-words">{studentData.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                    <div className="w-full">
                      <p className="text-xs sm:text-sm text-gray-500">Batch</p>
                      <p className="font-medium text-gray-800 break-words">{studentData.batch}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Academic Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                  <div className="w-full">
                    <p className="text-xs sm:text-sm text-gray-500">10th Mark</p>
                    {renderField('tenthMark', studentData.tenthMark, '10th Mark', true)}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                  <div className="w-full">
                    <p className="text-xs sm:text-sm text-gray-500">12th Mark</p>
                    {renderField('twelfthMark', studentData.twelfthMark, '12th Mark', true)}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Book className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                  <div className="w-full">
                    <p className="text-xs sm:text-sm text-gray-500">CGPA</p>
                    {renderField('cgpa', studentData.cgpa, 'CGPA', true)}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                  <div className="w-full">
                    <p className="text-xs sm:text-sm text-gray-500">Arrears</p>
                    {renderField('noOfArrears', studentData.noOfArrears, 'Arrears')}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Languages */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Skills & Languages</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-center space-x-3">
                  <Code className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                  <div className="w-full">
                    <p className="text-xs sm:text-sm text-gray-500">Skills</p>
                    {renderField('skillSet', studentData.skillSet, 'Skills')}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Languages className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 flex-shrink-0" />
                  <div className="w-full">
                    <p className="text-xs sm:text-sm text-gray-500">Languages Known</p>
                    {renderField('languagesKnown', studentData.languagesKnown, 'Languages Known')}
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Links */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Professional Links</h2>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
                <div className="flex items-center">
                  {editing.linkedinUrl ? (
                    <div className="flex items-center w-full">
                      <input
                        type="text"
                        value={studentData.linkedinUrl}
                        onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                        className="font-medium border-b border-gray-300 focus:outline-none focus:border-orange-500 py-1 px-2 rounded w-full"
                      />
                      <Check
                        className="w-5 h-5 ml-2 text-green-500 cursor-pointer hover:text-green-600 flex-shrink-0"
                        onClick={() => handleEdit('linkedinUrl')}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center w-full">
                      <a
                        href={studentData.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-orange-500 hover:text-orange-600"
                      >
                        <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                        <span className="truncate">LinkedIn</span>
                      </a>
                      <Edit2
                        className="w-5 h-5 ml-2 text-gray-500 cursor-pointer hover:text-orange-500 flex-shrink-0"
                        onClick={() => handleEdit('linkedinUrl')}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  {editing.githubUrl ? (
                    <div className="flex items-center w-full">
                      <input
                        type="text"
                        value={studentData.githubUrl}
                        onChange={(e) => handleChange('githubUrl', e.target.value)}
                        className="font-medium border-b border-gray-300 focus:outline-none focus:border-orange-500 py-1 px-2 rounded w-full"
                      />
                      <Check
                        className="w-5 h-5 ml-2 text-green-500 cursor-pointer hover:text-green-600 flex-shrink-0"
                        onClick={() => handleEdit('githubUrl')}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center w-full">
                      <a
                        href={studentData.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-orange-500 hover:text-orange-600"
                      >
                        <Github className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                        <span className="truncate">GitHub</span>
                      </a>
                      <Edit2
                        className="w-5 h-5 ml-2 text-gray-500 cursor-pointer hover:text-orange-500 flex-shrink-0"
                        onClick={() => handleEdit('githubUrl')}
                      />
                    </div>
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