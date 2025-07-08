import { reactive, readonly } from 'vue';

export type MusicId = string & { _: '__MusicId__' };
export type MusicTags = readonly string[];

export interface CreateMusicParameter {
  id: string
  title: string
  src: string
  tags?: string[]
  loop?: {
    start?: number
    end?: number
  }
};

export interface Music {
  id: MusicId
  title: string
  file: {
    src: string
    extension: string
  }
  tags: MusicTags
  loop?: {
    start?: number
    end?: number
  }
  clone: () => Music
};

export const createMusicId = (id: string) => {
  return id as MusicId;
};

export const createMusic = (data: CreateMusicParameter): Music => {
  const id = createMusicId(data.id);
  const extension = data.src.match('[^.]+$')?.[0] ?? '';
  const tags = Object.freeze(data.tags?.slice() ?? []);
  const clone = () => createMusic(data);

  return readonly(reactive({
    id,
    title: data.title,
    file: {
      src: data.src,
      extension,
    },
    loop: data.loop,
    tags,
    clone,
  }));
};
