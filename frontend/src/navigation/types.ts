export type RootStackParamList = {
  Auth:   undefined;
  App:    undefined;
};

export type AuthStackParamList = {
  Login:  undefined;
};

export type TabParamList = {
  Home:     undefined;
  Library:  undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  HomeMain:   undefined;
  SongDetail: { songId: string; songName: string };
  SongForm:   { songId?: string };      // undefined = create, string = edit
};

export type LibraryStackParamList = {
  LibraryMain: undefined;
  SongDetail:  { songId: string; songName: string };
  SongForm:    { songId?: string };
};
