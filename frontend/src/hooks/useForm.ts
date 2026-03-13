import { useState } from "react";


const useForm = <T extends Record<string, unknown>>( initialValues: T) => { 
  const [formData, setFormData] = useState<T>(initialValues);

  const handleChange = ({ target }: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData(initialValues);
   }

  return { formData, handleChange, resetForm };
};

export { useForm }