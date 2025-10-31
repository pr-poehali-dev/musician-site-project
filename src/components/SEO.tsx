import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
}

const SEO = ({ 
  title = 'Shmelidze&Co - Музыка слов от сердца к клавишам', 
  description = 'Официальный сайт Дмитрия Шмелидзэ - авторские песни, студийные записи, эксклюзивные треки. Слушайте музыку с душой.',
  keywords = 'Дмитрий Шмелидзэ, авторские песни, музыка, студийные записи, российская музыка, песни под гитару',
  image = 'https://cdn.poehali.dev/files/35bf3198-6bc5-4049-9328-baf39a81cdb5.jpg',
  type = 'website'
}: SEOProps) => {
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}`;

  useEffect(() => {
    document.title = title;
    
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('keywords', keywords);
    
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', currentUrl, true);
    updateMeta('og:type', type, true);
    updateMeta('og:site_name', 'Shmelidze&Co', true);
    
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);
    
    const canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalLink) {
      canonicalLink.href = currentUrl;
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = currentUrl;
      document.head.appendChild(link);
    }
  }, [title, description, keywords, image, currentUrl, type]);

  return null;
};

export default SEO;
