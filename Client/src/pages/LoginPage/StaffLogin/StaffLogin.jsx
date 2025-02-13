import React from 'react'
import AuthForm from '../../../components/AuthForm/AuthForm'

const StaffLogin = () => {
    const onSubmit = () => {
        console.log('Staff Login')
    }
  return (
    <div>
        <AuthForm userType={'Staff'} onSubmit={onSubmit}/>
    </div>
  )
}

export default StaffLogin
