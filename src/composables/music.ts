import { hashicon } from '@emeraldpay/hashicon';
import { reactive, readonly } from 'vue';
import { createAutoMap } from './utils';

export type MusicId = string & { _: '__MusicId__' };

export interface CreateMusicParameter {
  id: string
  title: string
  src: string
};

export interface Music {
  id: MusicId
  title: string
  file: {
    src: string
    extension: string
  }
  coverUrl: string
};

const { use: useCoverUrl } = createAutoMap((id: MusicId) => {
  const canvas = hashicon(id);
  return canvas.toDataURL();
});

export const createMusicId = (id: string) => {
  return id as MusicId;
};

export const createMusic = (data: CreateMusicParameter): Music => {
  const id = createMusicId(data.id);
  const coverUrl = useCoverUrl(id);
  const extension = data.src.match('[^.]+$')?.[0] ?? '';

  return readonly(reactive({
    id,
    title: data.title,
    file: {
      src: data.src,
      extension,
    },
    coverUrl,
  }));
};
