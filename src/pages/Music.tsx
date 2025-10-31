import MusicPage from '@/components/MusicPage';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';

const Music = () => {
  return (
    <>
      <SEO 
        title="Музыка - Дмитрий Шмелидзэ | Слушать авторские песни онлайн"
        description="Слушайте авторские песни Дмитрия Шмелидзэ онлайн. Коллекция студийных записей и эксклюзивных треков в высоком качестве."
        keywords="слушать музыку онлайн, авторские песни, Шмелидзэ музыка, студийные записи, российская музыка"
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