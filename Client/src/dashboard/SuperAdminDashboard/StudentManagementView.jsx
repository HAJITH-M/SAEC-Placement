  import React, { useState } from "react";
  import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from "lucide-react";

  const StudentManagementView = () => {
    const [expandedYear, setExpandedYear] = useState(null);
    const [expandedBranch, setExpandedBranch] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const years = ["2021 - 2025", "2022 - 2026", "2023 - 2027", "2024 - 2028"];
    const branches = ["Computer Science", "Mechanical", "Electrical", "Civil"];

    const sampleStudents = {
      "2021 - 2025": {
        "Computer Science": [
          { id: 1, name: "John Doe", email: "john@example.com", rollNo: "CS101" },
          { id: 2, name: "Jane Smith", email: "jane@example.com", rollNo: "CS102" },
        ],
      },
    };

    const toggleYear = (year) => {
      setExpandedYear(expandedYear === year ? null : year);
    };

    const toggleBranch = (branch) => {
      setExpandedBranch(expandedBranch === branch ? null : branch);
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Student Management</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-orange-500 cursor-pointer text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <Plus size={20} />
            Add Student
          </button>
        </div>

        <div className="space-y-4">
          {years.map((year) => (
            <div key={year} className="border rounded-lg">
              <div
                className="flex items-center justify-between p-4 cursor-pointer bg-gray-50"
                onClick={() => toggleYear(year)}
              >
                <h3 className="text-lg font-semibold">{year}</h3>
                {expandedYear === year ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </div>

              {expandedYear === year && (
                <div className="p-4">
                  {branches.map((branch) => (
                    <div key={branch} className="border rounded-lg mt-2">
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer bg-gray-50"
                        onClick={() => toggleBranch(branch)}
                      >
                        <h4 className="font-medium">{branch}</h4>
                        {expandedBranch === branch ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </div>

                      {expandedBranch === branch && (
                        <div className="p-3">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="p-2 text-left">Roll No</th>
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-left">Email</th>
                                <th className="p-2 text-left">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sampleStudents[year]?.[branch]?.map((student) => (
                                <tr key={student.id} className="border-b">
                                  <td className="p-2">{student.rollNo}</td>
                                  <td className="p-2">{student.name}</td>
                                  <td className="p-2">{student.email}</td>
                                  <td className="p-2">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => setEditingStudent(student)}
                                        className="text-blue-500 cursor-pointer hover:text-blue-700"
                                      >
                                        <Edit2 size={18} />
                                      </button>
                                      <button className="text-red-500 cursor-pointer hover:text-red-700">
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add/Edit Student Modal would go here */}
        {(isAddModalOpen || editingStudent) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-bold mb-4">
                {editingStudent ? "Edit Student" : "Add New Student"}
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Roll No</label>
                  <input
                    type="text"
                    className="w-full border rounded-md p-2"
                    placeholder="Enter roll number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full border rounded-md p-2"
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border rounded-md p-2"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingStudent(null);
                    }}
                    className="px-4 py-2 border rounded-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-md cursor-pointer"
                  >
                    {editingStudent ? "Update" : "Add"} Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };


  export default StudentManagementView;