import type { Ref } from 'vue';
import type { CreateMusicParameter, Music } from '~/composables/music';
import { ref } from 'vue';
import { createMusic } from '~/composables/music';

const discography = ref<Music[]>([]);
(async () => {
  try {
    const response = await fetch('../../data/discography.json');
    const json: CreateMusicParameter[] = await response.json();
    discography.value = json.map(musicData => createMusic(musicData));
  }
  catch (error) {
    console.error(error);
  }
})();

export const useDiscography = (): Ref<Music[]> => discography;
