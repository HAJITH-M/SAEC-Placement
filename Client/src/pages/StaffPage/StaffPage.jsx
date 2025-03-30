import React from 'react'
import { Helmet } from 'react-helmet'
import StaffDashboardView from '../../dashboard/StaffDashboard/StaffDashboardView'

const StaffPage = () => {
  return (
    <div>
      <Helmet>
        <title>Staff Dashboard | Training and Placement Cell</title>
        <meta name="description" content="Staff dashboard for managing students, job opportunities, events and registrations. Access student management, job postings, and placement activities." />
        <meta name="keywords" content="staff dashboard, placement cell, student management, job postings, training and placement, college placements" />
        <meta property="og:title" content="Staff Dashboard | Training and Placement Cell" />
        <meta property="og:description" content="Staff dashboard for managing students, job opportunities, events and registrations. Access student management, job postings, and placement activities." />
        <meta property="og:type" content="website" />
      </Helmet>
      <StaffDashboardView/>
    </div>
  )
}

export default StaffPage