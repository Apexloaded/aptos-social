import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

export const post = yup.object({
  content: yup.string().required("Enter a post"),
  images: yup
    .mixed()
    .test("required", "Choose a NFT image", (file) => {
      // return file && file.size <-- u can use this if you don't want to allow empty files to be uploaded;
      if (file) return true;
      return false;
    })
    .test("fileSize", "Max file 5MB", (file: any) => {
      //if u want to allow only certain file sizes
      return file && file.size <= 5000000;
    })
});

export const postResolver = {
  resolver: yupResolver(post),
};
