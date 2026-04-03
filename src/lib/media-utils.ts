export const getEmbedUrl = (url: string) => {
  if (!url) return "";

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    // Extract video ID safely
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1`;
    }
  }
  
  // Spotify
  if (url.includes('spotify.com')) {
    // E.g. https://open.spotify.com/playlist/ID -> https://open.spotify.com/embed/playlist/ID
    const path = url.split('spotify.com/')[1];
    if (path) {
      return `https://open.spotify.com/embed/${path}`;
    }
  }
  
  // SoundCloud
  if (url.includes('soundcloud.com')) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
  }
  
  return url; // Fallback
};

export const detectPlatform = (url: string): 'youtube' | 'spotify' | 'soundcloud' | 'custom' => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('spotify.com')) return 'spotify';
  if (url.includes('soundcloud.com')) return 'soundcloud';
  return 'custom';
};
