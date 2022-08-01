import { collections } from '../connect-db';

export const getCurrentCollection = (currentPath: string) => {
  const authPatches = [
    { patch: '/login', collection: collections.ipUsersLogin },
    { patch: '/registration', collection: collections.ipUsersRegistration },
    { patch: '/registration-email-resending', collection: collections.ipUsersResending },
    { patch: '/registration-confirmation', collection: collections.ipUsersConfirmation },
  ];

  return authPatches.find((el) => el.patch === currentPath)!.collection;
};
