import { hashicon } from '@emeraldpay/hashicon';
import { reactive, readonly } from 'vue';
import { createAutoMap } from './utils';

export type MusicId = string & { _: '__MusicId__' };

export interface CreateMusicParameter {
  id: string
  title: string
  src: string
  tags?: string[]
};

export interface Music {
  id: MusicId
  title: string
  file: {
    src: string
    extension: string
  }
  tags: readonly string[]
  coverUrl: string
  clone: () => Music
};

const { use: useCoverUrl } = createAutoMap((id: MusicId) => {
  const canvas = hashicon(`amalgame${id}`, {
    shift: { min: 30, max: 60 },
  });
  return canvas.toDataURL();
});

export const createMusicId = (id: string) => {
  return id as MusicId;
};

export const createMusic = (data: CreateMusicParameter): Music => {
  const id = createMusicId(data.id);
  const coverUrl = useCoverUrl(id);
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
    tags,
    coverUrl,
    clone,
  }));
};
