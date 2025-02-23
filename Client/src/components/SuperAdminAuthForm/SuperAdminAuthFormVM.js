import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../zodSchema/AuthSchema';

const SuperAdminAuthFormVM = (props) => {
  const [authError, setAuthError] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmitForm = async (data) => {
    try {
      props.onSubmit({
        email: data.email,
        password: data.password
      });
    } catch (error) {
      setAuthError(error.message);
    }
  };

  return {
    authError,
    register,
    handleSubmit,
    errors,
    onSubmitForm
  };
};

export default SuperAdminAuthFormVM;