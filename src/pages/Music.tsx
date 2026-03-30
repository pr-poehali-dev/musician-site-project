import MusicPage from '@/components/MusicPage';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';

const Music = () => {
  return (
    <>
      <SEO 
        title="Музыка — Дмитрий Шмелидзэ | Слушать авторские песни и альбомы онлайн"
        description="Слушайте авторские песни Дмитрия Шмелидзэ онлайн бесплатно. Коллекция студийных записей, альбомы и новые треки 2026 в высоком качестве."
        keywords="слушать музыку Шмелидзэ онлайн, авторские песни бесплатно, альбомы Дмитрий Шмелидзэ, студийные записи, новые треки 2026, российская авторская музыка"
        type="music.playlist"
      />
      <StructuredData 
        type="musicAlbum" 
        data={{ 
          name: "Коллекция авторских песен", 
          date: "2024",
          trackCount: 15 
        }} 
      />
      <MusicPage />
    </>
  );
};

export default Music;