import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  jsonLd?: object;
}

const SEO = ({ 
  title = 'Дмитрий Шмелидзэ - Авторские песни, современная музыка и ХИТы 2025', 
  description = 'Авторские песни Дмитрий Шмелидзэ - современная музыка, композиции и ХИТы 2025. Слушайте новые треки онлайн, студийные записи и эксклюзивные песни российского музыканта.',
  keywords = 'Дмитрий Шмелидзэ, авторские песни, музыка, студийные записи, российская музыка, песни под гитару, ХИТы 2025, современная музыка',
  image = 'https://cdn.poehali.dev/files/35bf3198-6bc5-4049-9328-baf39a81cdb5.jpg',
  type = 'website',
  jsonLd
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
    updateMeta('og:site_name', 'Дмитрий Шмелидзэ', true);
    
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

    if (jsonLd) {
      const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic="true"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic', 'true');
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);

      return () => {
        script.remove();
      };
    }
  }, [title, description, keywords, image, currentUrl, type, jsonLd]);

  return null;
};

export default SEO;