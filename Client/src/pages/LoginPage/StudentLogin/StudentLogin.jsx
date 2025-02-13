import React from 'react'
import AuthForm from '../../../components/AuthForm/AuthForm'

const StudentLogin = () => {
  const onSubmit = () => {
    console.log('Staff Login')
}
  return (
    <>
    <AuthForm userType={"Student"} onSubmit={onSubmit}/>
    </>
  )
}

export default StudentLogin
