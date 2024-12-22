export type MusicId = string & { _: '__MusicId__' };

export interface Music {
  id: MusicId
  title: string
  src: string
};

export const createMusicId = (id: string) => {
  return id as MusicId;
};
