import React, { Fragment, useState, useRef } from 'react';
import Image from 'next/image';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { CameraIcon, XIcon } from 'lucide-react';
import { FieldValues, useForm, Controller } from 'react-hook-form';
import { editProfileResolver } from '@/schemas/user.schema';
import { UserInterface } from '@/interfaces/user.interface';
import useToast from '@/hooks/toast.hook';
import { Button } from '../ui/button';
import MediaPreview from '../Posts/MediaPreview';
import ShowError from '../ui/inputerror';
import FileSelector from '../ui/fileselector';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { TextArea } from '../ui/textarea';

type Props = {
  user: UserInterface;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

function EditProfile({ user, isOpen, setIsOpen }: Props) {
  const pfpRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [pfp, setPFP] = useState<File | null>(null);
  const { loading, error, success } = useToast();
  const {
    reset,
    trigger,
    setValue,
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    ...editProfileResolver,
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleCreate = async (data: FieldValues) => {
    try {
      loading({ msg: 'Uploading profile...' });
      const { username, name, pfp, banner, bio, website } = data;
      // const formData = new FormData();
      // formData.append('username', username);
      // formData.append('name', name);
      // formData.append('pfp', pfp);
      // formData.append('banner', banner);
      // formData.append('bio', bio);
      // formData.append('website', website);
      // const res = await updateProfile(formData);
      // if (res.status == true) {
      // await writeContractAsync(
      //   {
      //     abi: CreatorABI,
      //     address: dexaCreator,
      //     functionName: 'editProfile',
      //     args: [
      //       name,
      //       username,
      //       res.data.pfpURI,
      //       res.data.bannerURI,
      //       bio,
      //       website,
      //     ],
      //   },
      //   {
      //     onSuccess: async (data) => {
      //       success({ msg: 'Profile updated' });
      //       closeModal();
      //     },
      //     onError(err) {
      //       error({ msg: `${err.message}` });
      //     },
      //   }
      // );
      // }
    } catch (err: any) {
      if (err instanceof Error) {
        error({ msg: err.message });
      }
      if (err && typeof err === 'object') {
        error({ msg: err.details });
      }
    }
  };

  const toggleBanner = () => {
    if (bannerRef.current) bannerRef.current.click();
  };

  const togglePFP = () => {
    if (pfpRef.current) pfpRef.current.click();
  };

  const removeBanner = () => {
    reset({ banner: undefined });
    setBanner(null);
    if (bannerRef.current) bannerRef.current.value = '';
  };

  const removePFP = () => {
    reset({ pfp: undefined });
    setPFP(null);
    if (pfpRef.current) pfpRef.current.value = '';
  };

  return (
    <Dialog
      open={isOpen}
      as="div"
      className="fixed inset-0 z-50 bg-dark/50 overflow-y-auto scrollbar-hide"
      onClose={closeModal}
    >
      <div className="fixed bg-dark/50 dark:bg-white/10 backdrop-blur-sm inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="inline-block w-full max-w-xl max-h-[40rem] my-8 overflow-scroll scrollbar-hide text-left align-middle transition-all transform bg-white dark:bg-dark shadow-md rounded-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
          >
            <DialogTitle
              as="h3"
              className="text-lg px-4 py-2 flex top-0 sticky z-20 bg-white dark:bg-dark justify-between items-center leading-6 m-0 text-dark/80"
            >
              <div className="flex items-center gap-x-2">
                <Button
                  size={'icon'}
                  type={'button'}
                  variant={'ghost'}
                  onClick={closeModal}
                  className={'hover:bg-medium/20 -translate-x-2'}
                >
                  <XIcon size={22} />
                </Button>
                <span className="font-bold text-dark dark:text-white">
                  Edit Profile
                </span>
              </div>
              <Button
                onClick={handleSubmit(handleCreate)}
                type={'submit'}
                disabled={isSubmitting}
                size={'sm'}
              >
                <p className="text-sm font-semibold">Save</p>
              </Button>
            </DialogTitle>
            <div className="relative max-h-40 md:max-h-52 ">
              <div className="flex h-52 w-full overflow-hidden bg-dark dark:bg-dark-light">
                {banner && <MediaPreview file={banner} isRounded={false} />}
                {user.banner && (
                  <Image
                    src={user.banner}
                    height={2500}
                    width={3000}
                    alt={'Banner'}
                    className={`h-full w-full absolute top-0 z-[1]`}
                  />
                )}
                {errors.banner && (
                  <div className="absolute right-0 bottom-0 mr-2 mb-2">
                    <ShowError error={errors.banner?.message} />
                  </div>
                )}
              </div>
              <div className="bg-transparent h-full w-full absolute top-0 bg-opacity-5 space-x-2 z-10 flex justify-center items-center">
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <FileSelector
                        onSelect={async (ev) => {
                          if (ev.target.files) {
                            const file = ev.target.files[0];
                            onChange(file);
                            const isValid = await trigger('banner');
                            console.log(file);
                            if (isValid) setBanner(file);
                          }
                        }}
                        ref={bannerRef}
                        accept="image/png, image/jpeg, image/gif, image/jpg"
                      />
                      <Button
                        type={'button'}
                        size={'icon'}
                        onClick={toggleBanner}
                        className="bg-dark/70 hover:bg-dark/50 h-[3rem] w-[3rem]"
                        title="Banner"
                      >
                        <CameraIcon className={`text-white`} size={25} />
                      </Button>
                    </>
                  )}
                  name={'banner'}
                />
                <Button
                  type={'button'}
                  size={'icon'}
                  onClick={removeBanner}
                  className={`bg-dark/70 hover:bg-dark/50 h-[3rem] w-[3rem] ${
                    true ? 'flex' : 'hidden'
                  }`}
                  title="Clear"
                >
                  <XIcon className={`text-white`} size={25} />
                </Button>
              </div>
              <div className="h-28 w-28 overflow-hidden bg-gray-900 absolute -bottom-14 left-4 border-4 border-white dark:border-dark-light flex items-center justify-center rounded-full z-10">
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <>
                      <FileSelector
                        onSelect={async (ev) => {
                          if (ev.target.files) {
                            const file = ev.target.files[0];
                            onChange(file);
                            const isValid = await trigger('pfp');
                            if (isValid) setPFP(file);
                          }
                        }}
                        ref={pfpRef}
                        accept="image/png, image/jpeg, image/gif, image/jpg"
                      />
                      <Button
                        type={'button'}
                        size="icon"
                        onClick={togglePFP}
                        className="bg-dark/70 hover:bg-dark/50 h-[3rem] w-[3rem] z-50"
                        title="PFP"
                      >
                        <CameraIcon className={`text-white`} size={25} />
                      </Button>
                    </>
                  )}
                  name={'pfp'}
                />
                {pfp ? (
                  <div className="absolute h-full w-full rounded-full z-0">
                    <MediaPreview file={pfp} isRounded={false} />
                  </div>
                ) : (
                  user.pfp && (
                    <Image
                      src={user.pfp}
                      height={400}
                      width={400}
                      alt={'PFP'}
                      className="h-full w-full rounded-full z-0 absolute"
                    />
                  )
                )}
              </div>
            </div>
            <div className="my-[4.5rem] px-5 flex flex-col space-y-4">
              {errors.pfp && <ShowError error={errors.pfp?.message} />}
              <div className="flex flex-col rounded-md">
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="relative">
                      <Input
                        className="peer placeholder:text-transparent text-dark dark:text-white border border-muted dark:border-muted/70 rounded-sm h-11"
                        placeholder="Username"
                        onChange={onChange}
                        value={value}
                      />
                      <Label
                        title="Username"
                        className="absolute lowercase left-0 px-2 ml-2 py-1 text-gray-500 text-xs font-[400] bg-white dark:bg-dark -translate-y-14 duration-100 ease-linear peer-placeholder-shown:text-[1rem] peer-placeholder-shown:-translate-y-9 peer-placeholder-shown:mt-[0.1rem] peer-focus:-translate-y-14 peer-focus:text-xs peer-focus:mt-0"
                      >
                        Username
                      </Label>
                    </div>
                  )}
                  name={'username'}
                  defaultValue={user.username}
                />
                {errors.username && (
                  <ShowError error={errors.username.message} />
                )}
              </div>
              <div className="flex flex-col rounded-md">
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="relative">
                      <Input
                        className="peer placeholder:text-transparent text-dark dark:text-white border border-muted dark:border-muted/70 rounded-sm h-11"
                        placeholder="Username"
                        onChange={onChange}
                        value={value}
                      />
                      <Label
                        title="Display Name"
                        className="absolute lowercase left-0 px-2 ml-2 py-1 text-gray-500 text-xs font-[400] bg-white dark:bg-dark -translate-y-14 duration-100 ease-linear peer-placeholder-shown:text-[1rem] peer-placeholder-shown:-translate-y-9 peer-placeholder-shown:mt-[0.1rem] peer-focus:-translate-y-14 peer-focus:text-xs peer-focus:mt-0"
                      >
                        Display Name
                      </Label>
                    </div>
                  )}
                  name={'name'}
                  defaultValue={user.name}
                />
                {errors.name && <ShowError error={errors.name.message} />}
              </div>
              <div className="flex flex-col rounded-md">
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="relative">
                      <TextArea
                        onChange={onChange}
                        value={value}
                        placeholder="Biography"
                        className="peer h-full pt-2 outline-none placeholder:text-transparent text-dark bg-transparent dark:text-white border border-muted dark:border-muted/70 rounded-sm"
                        rows={4}
                      ></TextArea>
                      <Label
                        title="Biography"
                        className="absolute top-11 lowercase left-0 px-2 ml-2 py-1 text-gray-500 text-xs font-[400] bg-white dark:bg-dark -translate-y-14 duration-100 ease-linear peer-placeholder-shown:text-[1rem] peer-placeholder-shown:-translate-y-9 peer-placeholder-shown:mt-[0.1rem] peer-focus:-translate-y-14 peer-focus:text-xs peer-focus:mt-0"
                      >
                        Biography
                      </Label>
                    </div>
                  )}
                  name={'bio'}
                  defaultValue={user.bio}
                />
              </div>
              <div className="flex flex-col rounded-md">
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="relative">
                      <Input
                        className="peer placeholder:text-transparent text-dark dark:text-white border border-muted dark:border-muted/70 rounded-sm h-11"
                        placeholder="Website"
                        onChange={onChange}
                        value={value}
                      />
                      <Label
                        title="Website"
                        className="absolute lowercase left-0 px-2 ml-2 py-1 text-gray-500 text-xs font-[400] bg-white dark:bg-dark -translate-y-14 duration-100 ease-linear peer-placeholder-shown:text-[1rem] peer-placeholder-shown:-translate-y-9 peer-placeholder-shown:mt-[0.1rem] peer-focus:-translate-y-14 peer-focus:text-xs peer-focus:mt-0"
                      >
                        Website
                      </Label>
                    </div>
                  )}
                  name={'website'}
                  defaultValue={user.website}
                />
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default EditProfile;
