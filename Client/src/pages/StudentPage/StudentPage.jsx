import React from 'react'
import StudentDashboardView from '../../dashboard/StudentDashboard/StudentDashboardView'
import { Helmet } from 'react-helmet'

const StudentPage = () => {
  return (
    <div>
      <Helmet>
        <title>Student Dashboard | SAEC Placement Portal</title>
        <meta name="description" content="Access your student dashboard at SAEC Placement Portal. View job opportunities, manage your profile, track events, and monitor placement statistics." />
        <meta name="keywords" content="SAEC student dashboard, placement opportunities, student profile, campus events, placement statistics" />
        <meta property="og:title" content="Student Dashboard | SAEC Placement Portal" />
        <meta property="og:description" content="Access your student dashboard at SAEC Placement Portal. View job opportunities, manage your profile, track events, and monitor placement statistics." />
        <meta property="og:type" content="website" />
      </Helmet>
      <StudentDashboardView/>
    </div>
  )
}

export default StudentPage