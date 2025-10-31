import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'person' | 'musicGroup' | 'musicAlbum' | 'musicRecording' | 'event' | 'blog';
  data?: Record<string, unknown>;
}

const StructuredData = ({ type, data }: StructuredDataProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    let structuredData: Record<string, unknown> = {};

    switch (type) {
      case 'person':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Дмитрий Шмелидзэ",
          "alternateName": "Shmelidze&Co",
          "url": "https://musician-site-project.poehali.dev",
          "image": "https://cdn.poehali.dev/files/57940c73-7a29-4c84-8c4b-d402f03adc4a.png",
          "jobTitle": "Музыкант, автор песен",
          "description": "Российский музыкант и автор песен. Создаю авторские композиции с глубоким смыслом.",
          "nationality": "Россия",
          "genre": ["Авторская песня", "Русская музыка"],
          "sameAs": [
            "https://vk.com/shmelidze",
            "https://youtube.com/@shmelidze"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+7-999-123-45-67",
            "email": "music@dmitry-shmelidze.ru",
            "contactType": "Booking"
          }
        };
        break;

      case 'musicGroup':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "MusicGroup",
          "name": "Shmelidze&Co",
          "url": "https://musician-site-project.poehali.dev",
          "image": "https://cdn.poehali.dev/files/35bf3198-6bc5-4049-9328-baf39a81cdb5.jpg",
          "genre": ["Авторская песня", "Русская музыка"],
          "member": {
            "@type": "Person",
            "name": "Дмитрий Шмелидзэ"
          },
          "foundingDate": "2020",
          "foundingLocation": "Москва, Россия"
        };
        break;

      case 'musicAlbum':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "MusicAlbum",
          "name": data?.name || "Коллекция песен",
          "byArtist": {
            "@type": "Person",
            "name": "Дмитрий Шмелидзэ"
          },
          "datePublished": data?.date || "2024",
          "genre": "Авторская песня",
          "inLanguage": "ru",
          "numberOfTracks": data?.trackCount || 10
        };
        break;

      case 'musicRecording':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "MusicRecording",
          "name": data?.title || "Авторская композиция",
          "byArtist": {
            "@type": "Person",
            "name": "Дмитрий Шмелидзэ"
          },
          "duration": data?.duration || "PT3M30S",
          "genre": "Авторская песня",
          "inLanguage": "ru",
          "datePublished": data?.date || "2024"
        };
        break;

      case 'event':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "MusicEvent",
          "name": data?.name || "Концерт Дмитрия Шмелидзэ",
          "startDate": data?.startDate,
          "endDate": data?.endDate,
          "eventStatus": "https://schema.org/EventScheduled",
          "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "location": {
            "@type": "Place",
            "name": data?.venue || "Концертный зал",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": data?.city || "Москва",
              "addressCountry": "RU"
            }
          },
          "performer": {
            "@type": "Person",
            "name": "Дмитрий Шмелидзэ"
          },
          "offers": {
            "@type": "Offer",
            "url": "https://musician-site-project.poehali.dev/contact",
            "price": data?.price || "0",
            "priceCurrency": "RUB",
            "availability": "https://schema.org/InStock"
          }
        };
        break;

      case 'blog':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "Блог Дмитрия Шмелидзэ",
          "description": "Мысли о музыке, творчестве и жизни",
          "url": "https://musician-site-project.poehali.dev/blog",
          "author": {
            "@type": "Person",
            "name": "Дмитрий Шмелидзэ"
          },
          "inLanguage": "ru"
        };
        break;
    }

    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [type, data]);

  return null;
};

export default StructuredData;