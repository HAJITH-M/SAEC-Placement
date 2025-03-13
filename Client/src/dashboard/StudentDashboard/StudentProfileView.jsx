import React, { useState, useEffect } from 'react';
import { Mail, Phone, Book, Code, Languages, Award, Briefcase, Github, Linkedin, Hash, Building, AlertCircle, Edit2, Check } from 'lucide-react';
import axios from 'axios';

const StudentProfileView = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState({});

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
      const updateData = {
        [field]: studentData[field] === 'N/A' ? null : studentData[field], // Convert 'N/A' back to null for backend
      };

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
      setError(`Failed to update ${field}. Please try again.`);
      return;
    }
  }
  setEditing((prev) => ({ ...prev, [field]: !prev[field] }));
};

  const handleChange = (field, value) => {
    setStudentData((prev) => ({ ...prev, [field]: value }));
  };

  const renderField = (field, value, label) => {
    return editing[field] ? (
      <div className="flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          className="font-medium border-b border-gray-300 focus:outline-none"
        />
        <Check
          className="w-4 h-4 ml-2 text-green-500 cursor-pointer hover:text-green-600"
          onClick={() => handleEdit(field)}
        />
      </div>
    ) : (
      <div className="flex items-center">
        <p className="font-medium">{value}</p>
        <Edit2
          className="w-4 h-4 ml-2 text-gray-500 cursor-pointer hover:text-blue-600"
          onClick={() => handleEdit(field)}
        />
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!studentData) {
    return <div className="min-h-screen flex items-center justify-center">No student data available.</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-orange-500 text-white p-3">
            <h1 className="text-xl font-bold">{renderField('name', studentData.name)}</h1>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  {renderField('emailId', studentData.emailId)}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  {renderField('phoneNumber', studentData.phoneNumber)}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Hash className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Registration Number</p>
                  {renderField('regNo', studentData.regNo)}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  {renderField('department', studentData.department)}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Batch</p>
                  {renderField('batch', studentData.batch)}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Academic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">10th Mark</p>
                    {renderField('tenthMark', `${studentData.tenthMark}%`)}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">12th Mark</p>
                    {renderField('twelfthMark', `${studentData.twelfthMark}%`)}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Book className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">CGPA</p>
                    {renderField('cgpa', studentData.cgpa)}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Arrears</p>
                    {renderField('noOfArrears', studentData.noOfArrears)}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Skills & Languages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Code className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Skills</p>
                    {renderField('skillSet', studentData.skillSet)}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Languages className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Languages Known</p>
                    {renderField('languagesKnown', studentData.languagesKnown)}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Professional Links</h2>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  {editing.linkedinUrl ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={studentData.linkedinUrl}
                        onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                        className="font-medium border-b border-gray-300 focus:outline-none"
                      />
                      <Check
                        className="w-4 h-4 ml-2 text-green-500 cursor-pointer hover:text-green-600"
                        onClick={() => handleEdit('linkedinUrl')}
                      />
                    </div>
                  ) : (
                    <>
                      <a
                        href={studentData.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span>LinkedIn</span>
                      </a>
                      <Edit2
                        className="w-4 h-4 ml-2 text-gray-500 cursor-pointer hover:text-blue-600"
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
                        className="font-medium border-b border-gray-300 focus:outline-none"
                      />
                      <Check
                        className="w-4 h-4 ml-2 text-green-500 cursor-pointer hover:text-green-600"
                        onClick={() => handleEdit('githubUrl')}
                      />
                    </div>
                  ) : (
                    <>
                      <a
                        href={studentData.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                      >
                        <Github className="w-5 h-5" />
                        <span>GitHub</span>
                      </a>
                      <Edit2
                        className="w-4 h-4 ml-2 text-gray-500 cursor-pointer hover:text-blue-600"
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