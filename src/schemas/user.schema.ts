import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const editProfileSchema = yup.object().shape({
  // banner: yup
  //   .mixed()
  //   .test("required", "Choose a banner", (file) => {
  //     if (file) return true;
  //     return false;
  //   })
  //   .test("fileSize", "Max file 5MB", (file: any) => {
  //     return file && file.size <= 5000000;
  //   })
  //   .test("Mimetype", "Invalid image", (file: any) => {
  //     return file && file.name.match(/\.(jpg|jpeg|png|gif)$/);
  //   }),
  // pfp: yup.mixed()
  //   .test("required", "Choose a PFP", (file) => {
  //     if (file) return true;
  //     return false;
  //   })
  //   .test("fileSize", "Max file 5MB", (file: any) => {
  //     return file && file.size <= 5000000;
  //   })
  //   .test("Mimetype", "Invalid image", (file: any) => {
  //     return file && file.name.match(/\.(jpg|jpeg|png|gif)$/);
  //   }),
  username: yup.string().required("Userame is required").min(3),
  name: yup.string().required("Display name is required").min(3),
  bio: yup.string(),
  website: yup.string(),
});

export const editProfileResolver = {
  resolver: yupResolver(editProfileSchema),
};
