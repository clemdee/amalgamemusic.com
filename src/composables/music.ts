import { reactive, readonly } from 'vue';

export type MusicId = string & { _: '__MusicId__' };
export type MusicTags = readonly string[];

export interface MusicPart {
  src: string
  offset?: number
  duration: number
}

export interface ResolvedMusicPart {
  src: string
  offset: number
  duration: number
  buffer: AudioBuffer
}

export interface CreateMusicParameter {
  id: string
  title: string
  src: string
  time: {
    duration: number
    loopStart?: number
    loopEnd?: number
  }
  parts: MusicPart[]
  tags?: string[]
};

export interface Music {
  id: MusicId
  title: string
  file: {
    src: string
    extension: string
  }
  time: {
    duration: number
    loopStart: number
    loopEnd: number
  }
  parts: MusicPart[]
  tags: MusicTags
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
    time: {
      duration: data.time.duration,
      loopStart: data.time.loopStart ?? 0,
      loopEnd: data.time.loopEnd ?? data.time.duration,
    },
    parts: data.parts,
    tags,
    clone,
  }));
};
