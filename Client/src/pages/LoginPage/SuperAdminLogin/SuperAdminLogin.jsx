import React from 'react'
import SuperAdminAuthFormView from '../../../components/SuperAdminAuthForm/SuperAdminAuthFormView'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const SuperAdminLogin = () => {
    const navigate = useNavigate()
    
      const handleSubmit = async (authData) => {
        try {
          const response = await axios.post('http://localhost:9999/superadmin', authData)
          if (response.data) {
            // Redirect to super admin dashboard with id from response
            console.log('Super Admin logged in successfully + id:', response.data);
            navigate(`/home`);
          }
        } catch (error) {
          console.error('Error in super admin login:', error);
        }
      };
    
  return (
    <div>
<SuperAdminAuthFormView onSubmit={handleSubmit} userType="Super Admin Login" />    
</div>
  )
}

export default SuperAdminLogin