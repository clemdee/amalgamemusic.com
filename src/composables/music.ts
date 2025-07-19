import { reactive, readonly } from 'vue';

export type MusicId = string & { _: '__MusicId__' };
export type MusicTags = readonly string[];

export interface CreateMusicParameter {
  id: string
  title: string
  src: string
  time: {
    duration: number
    loopStart?: number
    loopEnd?: number
  }
  parts?: {
    src: string
    offset?: number
    duration: number
  }[]
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
  time: {
    duration: number
    loopStart: number
    loopEnd: number
  }
  parts: readonly {
    src: string
    offset: number
    duration: number
  }[]
  tags: MusicTags
  loop?: {
    start?: number
    end?: number
  }
};

export const createMusicId = (id: string) => {
  return id as MusicId;
};

const createDefaultParts = (data: CreateMusicParameter): Music['parts'] => [{
  src: data.src,
  duration: data.time.duration,
  offset: 0,
}];

export const createMusic = (data: CreateMusicParameter): Music => {
  const id = createMusicId(data.id);
  const extension = data.src.match('[^.]+$')?.[0] ?? '';
  const tags = Object.freeze(data.tags?.slice() ?? []);

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
    parts: data.parts?.map(part => ({
      src: part.src,
      offset: part.offset ?? 0,
      duration: part.duration,
    })) ?? createDefaultParts(data),
    tags,
  }));
};
