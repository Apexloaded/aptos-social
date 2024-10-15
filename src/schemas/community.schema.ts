import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

export const addCommunity = yup.object({
  logo: yup
    .mixed()
    .test('required', 'Choose your collection logo', (file) => {
      if (file) return true;
      return false;
    })
    .test('fileSize', 'Max file 5MB', (file: any) => {
      return file && file.size <= 5000000;
    }),
  banner: yup.mixed(),
  name: yup.string().required('Enter your community name'),
  is_paid: yup.boolean(),
  entry_fee: yup.string(),
  is_messageable: yup.boolean(),
  description: yup.string().required('Enter your collection description'),
});

export const addCommunityResolver = {
  resolver: yupResolver(addCommunity),
};
