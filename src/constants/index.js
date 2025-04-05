import { Asset } from 'expo-asset';

export const DEFAULT_PROFILE_PICTURE =
  'https://i.pinimg.com/736x/9c/8b/20/9c8b201fbac282d91c766e250d0e3bc6.jpg';

// Get the URI of the local asset
const defaultThumbnailAsset = Asset.fromModule(require('../images/thumbnail.png'));
export const DEFAULT_THUMBNAIL = defaultThumbnailAsset.uri;