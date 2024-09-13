import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

export const welcome = yup.object({
  pfp: yup
    .mixed()
    .test("required", "Choose a profile image", (file) => {
      if (file) return true;
      return false;
    })
    .test("fileSize", "Max file 5MB", (file: any) => {
      return file && file.size <= 5000000;
    }),
  name: yup.string().required("Enter your display name"),
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Enter a valid email address"),
  username: yup.string().required("Enter your username"),
});

export const welcomeResolver = {
  resolver: yupResolver(welcome),
};
