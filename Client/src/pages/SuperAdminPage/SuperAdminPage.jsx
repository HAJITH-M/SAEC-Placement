import React from 'react'
import { Helmet } from 'react-helmet'
import SuperAdminDashboardView from '../../dashboard/SuperAdminDashboard/SuperAdminDashboardView'

const SuperAdminPage = () => {
  return (
    <div>
      <Helmet>
        <title>Super Admin Dashboard | Placement Management System</title>
        <meta name="description" content="Super Admin control panel for managing students, staff, job postings, events, and system settings in the Placement Management System." />
        <meta name="keywords" content="super admin, dashboard, placement management, staff management, student management, job postings, events" />
        <meta property="og:title" content="Super Admin Dashboard | Placement Management System" />
        <meta property="og:description" content="Comprehensive admin control panel for managing placement activities and system settings." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SuperAdminDashboardView/>
    </div>
  )
}

export default SuperAdminPage