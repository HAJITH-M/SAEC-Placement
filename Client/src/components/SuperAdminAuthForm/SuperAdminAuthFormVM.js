import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../zodSchema/AuthSchema';
import { registerSchema } from '../../zodSchema/AuthSchema'; // Ensure this is defined

const SuperAdminAuthFormVM = ({ onSubmit, userType }) => {
  const [authError, setAuthError] = useState(null);
  const isRegistration = userType.toLowerCase().includes('registration');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isRegistration ? registerSchema : loginSchema),
    defaultValues: {
      email: '',
      password: '',
      staffEmail: '',
    },
  });

  const onSubmitForm = async (data) => {
    try {
      setAuthError(null);
      const submitData = isRegistration
        ? { email: data.email, password: data.password, staffEmail: data.staffEmail }
        : { email: data.email, password: data.password };
      await onSubmit(submitData);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  return {
    authError,
    register,
    handleSubmit,
    errors,
    onSubmitForm: handleSubmit(onSubmitForm),
  };
};

export default SuperAdminAuthFormVM;