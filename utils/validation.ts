import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export function validateForm(schema: any, data: any) {
  try {
    schema.validateSync(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err: any) {
    const errors: Record<string, string> = {};
    if (err.inner) {
      err.inner.forEach((validationError: any) => {
        errors[validationError.path] = validationError.message;
      });
    }
    return { isValid: false, errors };
  }
}
export function validateSchema(schema: any, data: any) {
  return schema.isValid(data).then((isValid: boolean) => {
    if (!isValid) {
      return schema.validate(data, { abortEarly: false });
    }
    return Promise.resolve();
  });
}
