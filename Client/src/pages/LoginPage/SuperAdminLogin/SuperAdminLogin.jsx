import React from 'react'
import SuperAdminAuthFormView from '../../../components/SuperAdminAuthForm/SuperAdminAuthFormView'

const SuperAdminLogin = () => {
    
      const handleSubmit = async (authData) => {
        try {
          // You can add any additional logic here like checking if the user is actually a super admin
          if (authData?.user) {
            // Redirect to super admin dashboard after successful login
            navigate('/super-admin-dashboard'); // Adjust this route based on your routing setup
          }
        } catch (error) {
          console.error('Error in super admin login:', error);
        }
      };
    
    
    
  return (
    <div>
<SuperAdminAuthFormView onSubmit={handleSubmit} userType="Super Admin" />    
</div>
  )
}

export default SuperAdminLogin
