import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import SuperAdminAuthFormView from '../../components/SuperAdminAuthForm/SuperAdminAuthFormView'

const SuperAdminRegister = () => {
    const navigate = useNavigate()
    
      const handleSubmitSuperAdminRegister = async (authData) => {
        try {
          const response = await axios.post('http://localhost:9999/superadmin/register', authData)
          if (response.data) {
            // Redirect to super admin dashboard after successful login
            console.log('Super Admin registered successfully + id:', response.data);
            navigate('/super-admin-dashboard');
          }
        } catch (error) {
          console.error('Error in super admin login:', error);
        }
      };
    
  return (
    <div>
<SuperAdminAuthFormView onSubmit={handleSubmitSuperAdminRegister} userType="Super Admin" />    
</div>
  )
}

export default SuperAdminRegister