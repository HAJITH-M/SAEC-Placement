  import React, { useState } from 'react';
  import { Mail, Phone, Book, Code, Languages, Award, Briefcase, Github, Linkedin, Hash, Building, AlertCircle, Edit2, Check } from 'lucide-react';

  const StudentProfileView = () => {
    const [studentData, setStudentData] = useState({
      name: "John Doe",
      username: "johndoe123",
      emailId: "john.doe@example.com",
      phoneNumber: "1234567890",
      regNo: "2021CSE001",
      department: "Computer Science",
      tenthMark: "95",
      twelfthMark: "92",
      cgpa: "8.5",
      noOfArrears: "0",
      skillSet: "React, Node.js, JavaScript",
      languagesKnown: "English, Hindi",
      linkedinUrl: "https://linkedin.com/in/johndoe",
      githubUrl: "https://github.com/johndoe"
    });

    const [editing, setEditing] = useState({});

    const handleEdit = (field) => {
      setEditing(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleChange = (field, value) => {
      setStudentData(prev => ({ ...prev, [field]: value }));
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

    return (
      <div className="min-h-screen">
        <div className=" mx-auto">
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
                        <a href={studentData.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
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
                        <a href={studentData.githubUrl} target="_blank" rel="noopener noreferrer"
                         className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
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