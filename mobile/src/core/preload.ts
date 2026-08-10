import { Image } from 'react-native';

const IMAGES = [
  require('../assets/home-page.png'),
  require('../assets/question-page.png'),
  require('../assets/royal-elephant-game-ui-5x5.png'),
  require('../assets/royal-elephant-game-ui-6x6.png'),
  require('../assets/royal-elephant-game-ui-7x7.png'),
  require('../assets/royal-elephant-game-ui-8x8.png'),
  require('../assets/royal-elephant-levels.png'),
  require('../assets/victory-dialog-0-star.png'),
  require('../assets/victory-dialog-1-star.png'),
  require('../assets/victory-dialog-2-star.png'),
  require('../assets/victory-dialog-3-star.png'),
  require('../assets/Ashok-Chakra.png'),
];

export function preloadAssets() {
  IMAGES.forEach((source) => {
    Image.prefetch(typeof source === 'number' ? source : (source as any).uri);
  });
}
