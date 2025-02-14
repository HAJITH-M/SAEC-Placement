import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../zodSchema/AuthSchema';
import { supabaseConfig } from '../../config/SupabaseConfig';

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
      const { data: authData, error } = await supabaseConfig.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // Store the user type in supabaseConfig user metadata
      const { error: updateError } = await supabaseConfig.auth.updateUser({
        data: { role: props.userType.toLowerCase() }
      });

      if (updateError) throw updateError;

      // Call the parent component's onSubmit
      props.onSubmit(authData);
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