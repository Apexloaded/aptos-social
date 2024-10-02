export const fullScreenPath = ['/live/video'];
export const protectedRoutes = [
  '/feeds',
  '/welcome',
  '/**/mints',
  '/collections',
  '/collections/create'
];
export const publicRoutes = ['/', '/support'];

export const routes = {
  home: '/',
  login: '/auth/login',
  app: {
    home: '/feeds',
    welcome: '/welcome',
    explore: '/explore',
    messages: {
      index: '/messages',
      message: (address: string) => `/messages/view?u=${address}`,
    },
    notifications: '/notifications',
    collections: {
      index: '/collections',
      create: '/collections/create',
      view: (id: string) => `/collections/${id}`,
      edit: (id: string) => `/collections/${id}/edit`,
    },
    bookmarks: '/bookmarks',
    live: {
      index: '/live',
      desktop: '/live/streams/video',
      webcam: '/live/streams/webcam',
      event: '/live/streams/event',
      credential: '/live/streams/key',
    },
    watch: (id: string) => `/watch?v=${id}`,
    connections: '/connections',
    wallet: {
      index: '/wallet',
      deposit: '/wallet/deposit',
      withdraw: '/wallet/withdraw',
    },
    profile: (username: string) => `/${username}`,
    mints: (username: string, postId: string) => `/${username}/mints/${postId}`,
    hashtag: {
      index: '/hashtag',
      hashtag: (hashtag: string) => `/hashtag/${hashtag}`,
    },
    search: (query: string) => `/search?q=${query}`,
    transaction: {
      index: '/transactions',
      id: (id: string) => `/transactions/${id}`,
    },
    community: '/community',
    settings: '/settings',
  },
};
