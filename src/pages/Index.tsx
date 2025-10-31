import HomePage from '@/components/HomePage';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';

const Index = () => {
  return (
    <>
      <SEO 
        title="Дмитрий Шмелидзэ - Авторские песни и музыка"
        description="Официальный сайт Дмитрия Шмелидзэ. Авторские песни с душой и глубоким смыслом. Слушайте студийные записи и эксклюзивные треки."
        keywords="Дмитрий Шмелидзэ, авторские песни, музыка, российский музыкант, песни под гитару, студийная запись"
      />
      <StructuredData type="person" />
      <StructuredData type="musicGroup" />
      <HomePage />
    </>
  );
};

export default Index;