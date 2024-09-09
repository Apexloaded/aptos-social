export const fullScreenPath = ["/live/video"];

export const routes = {
  home: "/",
  login: "/auth/login",
  register: "/auth/welcome",
  app: {
    home: "/home",
    explore: "/explore",
    messages: {
      index: "/messages",
      message: (address: string) => `/messages/view?u=${address}`,
    },
    bookmarks: "/bookmarks",
    live: {
      index: "/live",
      desktop: "/live/streams/video",
      webcam: "/live/streams/webcam",
      event: "/live/streams/event",
      credential: "/live/streams/key",
    },
    watch: (id: string) => `/watch?v=${id}`,
    connections: "/connections",
    wallet: {
      index: "/wallet",
      deposit: "/wallet/deposit",
      withdraw: "/wallet/withdraw",
    },
    profile: (username: string) => `/profile?u=${username}`,
    mints: (username: string, postId: string) =>
      `/${username}/mints/${postId}`,
    hashtag: {
      index: "/hashtag",
      hashtag: (hashtag: string) => `/hashtag/${hashtag}`,
    },
    search: (query: string) => `/search?q=${query}`,
    transaction: {
      index: "/transactions",
      id: (id: string) => `/transactions/${id}`,
    },
    community: "/community",
    settings: "/settings",
  },
};
