import React from 'react'
import AuthForm from '../../components/AuthForm/AuthForm'

const Login = () => {

    const handleLogin = () =>{
        alert("Login")
    }

  return (
    <div>
      <AuthForm isLogin={false} onSubmit={handleLogin}  />
    </div>
  )
}

export default Login
