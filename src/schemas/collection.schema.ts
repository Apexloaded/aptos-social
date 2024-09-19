import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

export const addCollection = yup.object({
  logo: yup
    .mixed()
    .test('required', 'Choose your collection logo', (file) => {
      if (file) return true;
      return false;
    })
    .test('fileSize', 'Max file 5MB', (file: any) => {
      return file && file.size <= 5000000;
    }),
  featured: yup.mixed(),
  banner: yup.mixed(),
  name: yup.string().required('Enter your collection name'),
  max_supply: yup.string().required('Enter maximum collections supply'),
  royalty: yup.string(),
  customUrl: yup.string().required('Enter a custom name'),
  description: yup.string().required('Enter your collection description'),
});

export const addCollectionResolver = {
  resolver: yupResolver(addCollection),
};
