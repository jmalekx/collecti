/*
  Utility module for formatting data
*/

//Formate date string to localised human readable format
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

//Format platform names with proper capitalisations
export const formatPlatform = (platform) => {
  if (!platform) return 'Gallery';
  return platform.charAt(0).toUpperCase() + platform.slice(1);
};