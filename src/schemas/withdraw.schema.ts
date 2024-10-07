import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

export const withdrawal = yup.object({
  token: yup.string().required("Choose a token"),
  to: yup
    .string()
    .required("Enter a withdrawal address"),
  amount: yup
    .number()
    .positive("Enter a valid amount")
    .required("Enter withdrawal amount"),
});

export const withdrawalResolver = {
  resolver: yupResolver(withdrawal),
};
