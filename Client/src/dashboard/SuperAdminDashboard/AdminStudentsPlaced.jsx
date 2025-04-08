import {
  Workflow,
  Loader,
  GraduationCap,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { fetchData } from "../../services/apiService";
import { toast, ToastContainer } from "react-toastify";

const AdminStudentsPlaced = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batchSearchTerm, setBatchSearchTerm] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    const getStudents = async () => {
      try {
        setLoading(true);
        const response = await fetchData("get-placed-students");
        setStudents(response?.data || []);
      } catch (err) {
        toast.error("Error fetching placed students: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    getStudents();
  }, []);

  const getBatches = () => {
    const batches = [...new Set(students.map((student) => student.batch))];
    return batches.filter((batch) => batch);
  };

  const renderStudentCard = (student, index) => (
    <div
      key={index}
      className="flex-shrink-0 p-4 hover:shadow-orange-300 bg-white rounded-lg shadow-md hover:shadow-md transition-all duration-200 w-full max-w-[180px]"
    >
      <div className="mb-3">
        <img
          src={student.url || "placeholder-image.jpg"}
          alt={student.name || "Student"}
          className="w-20 h-20 object-cover rounded-full mx-auto border-2 border-gray-200"
        />
      </div>
      <div className="text-sm">
        <h3 className="font-semibold text-gray-900 mb-2 text-center text-[0.8em]">
          {student.name || "Unknown"}
        </h3>
        <div className="space-y-2 text-gray-600">
          <div className="flex items-center justify-center">
            <GraduationCap className="mr-1 text-blue-500 w-4 h-4" />
            <span className="truncate">{student.department || "N/A"}</span>
          </div>
          <div className="flex items-center justify-center">
            <Workflow className="mr-1 text-green-500 w-4 h-4" />
            <span className="truncate">{student.companyPlacedIn || "N/A"}</span>
          </div>
          <div className="flex items-center justify-center">
            <Briefcase className="mr-1 text-purple-500 w-4 h-4" />
            <span>{student.batch || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const filteredBatches = getBatches().filter((batch) =>
    batchSearchTerm
      ? batch.toLowerCase().includes(batchSearchTerm.toLowerCase())
      : true
  );

  const filteredStudents = students.filter(
    (student) =>
      (!studentSearchTerm ||
        student.name?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        student.department
          ?.toLowerCase()
          .includes(studentSearchTerm.toLowerCase()) ||
        student.companyPlacedIn
          ?.toLowerCase()
          .includes(studentSearchTerm.toLowerCase())) &&
      student.batch === selectedBatch
  );

  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center space-y-2">
          <Loader className="animate-spin w-10 h-10 text-orange-500" />
          <span className="text-gray-500 text-base">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        {selectedBatch && (
          <button
            onClick={() => {
              setSelectedBatch(null);
              setStudentSearchTerm("");
            }}
            className="px-3 py-1 cursor-pointer bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 font-bold" />
            <span className="hidden md:inline">Back to Batches</span>
          </button>
        )}
        <h2 className="text-xl font-bold text-gray-800 flex-1 text-center">
          Placed Students
        </h2>
      </div>
      {!selectedBatch ? (
        <>
          <div className="mb-6 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search batches..."
              className="w-full px-4 py-2 border border-gray-500 rounded-md bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              value={batchSearchTerm}
              onChange={(e) => setBatchSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {filteredBatches.length > 0 ? (
              filteredBatches.map((batch) => (
                <div
                  key={batch}
                  onClick={() => setSelectedBatch(batch)}
                  className="cursor-pointer bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:bg-orange-50"
                >
                  <h3 className="text-xl font-semibold text-center text-gray-800">
                    Batch {batch}
                  </h3>
                  <p className="text-center text-gray-600 mt-2 text-base">
                    {
                      students.filter((student) => student.batch === batch)
                        .length
                    }{" "}
                    Students
                  </p>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No batches found
              </p>
            )}
          </div>
        </>
      ) : (
        <div>
          <div className="flex flex-row items-center justify-between mb-6 max-w-xl mx-auto gap-4">
            <input
              type="text"
              placeholder={`Search students in Batch ${selectedBatch}...`}
              className="w-full sm:w-auto flex-1 px-4 py-2 border border-gray-400 rounded-md bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) =>
                renderStudentCard(student, index)
              )
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No students found
              </p>
            )}
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default AdminStudentsPlaced;
