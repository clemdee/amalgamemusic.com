import { createMusic } from '~/composables/music';
import discographyJSON from '../../data/discography.json';

const discography = discographyJSON.map(musicData => createMusic(musicData));

export const useDiscography = () => discography;
