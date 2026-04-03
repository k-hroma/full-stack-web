import { useState } from "react";

type FormElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export function useForm<T extends Record<string, unknown>>(initialValues: T) {
  const [formData, setFormData] = useState<T>(initialValues);

  const handleChange = (event: React.ChangeEvent<FormElement>) => {
    const target = event.target;
    const { name, type, value } = target;

    let newValue: string | number | boolean = value;

    if (target instanceof HTMLInputElement) {
      if (type === "checkbox") {
        newValue = target.checked;
      }

      if (type === "number") {
        newValue = value === "" ? "" : Number(value);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const resetForm = () => setFormData(initialValues);

  return {
    formData,
    handleChange,
    resetForm,
    setFormData,
  };
}