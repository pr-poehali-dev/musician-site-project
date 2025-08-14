import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from '@/components/ui/icon';

const Index = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tracks = [
    { title: "Vintage Dreams", duration: "3:42", file: "" },
    { title: "Golden Memories", duration: "4:15", file: "" },
    { title: "Sunset Boulevard", duration: "3:28", file: "" },
    { title: "Old Soul", duration: "4:03", file: "" }
  ];

  const concerts = [
    { date: "15 сентября", venue: "Клуб «Джаз Кафе»", city: "Москва" },
    { date: "22 октября", venue: "Арт-центр «Винил»", city: "СПб" },
    { date: "10 ноября", venue: "Ретро Холл", city: "Казань" }
  ];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-vintage-cream via-vintage-brown to-vintage-dark-brown">
      {/* Навигация */}
      <nav className="sticky top-0 z-50 backdrop-blur-sm bg-vintage-cream/80 border-b border-vintage-brown/20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-vintage-warm">MUSICIAN</h1>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Главная</a>
              <a href="#music" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Музыка</a>
              <a href="#concerts" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Концерты</a>
              <a href="#contact" className="text-vintage-warm hover:text-vintage-dark-brown transition-colors">Контакты</a>
            </div>
            <Button variant="ghost" className="md:hidden">
              <Icon name="Menu" size={24} />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero секция */}
      <section id="home" className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-bold text-vintage-warm leading-tight">
                Винтажная<br />
                <span className="text-vintage-dark-brown">Музыка</span><br />
                Души
              </h2>
              <p className="text-xl text-vintage-warm/80 leading-relaxed">
                Погрузитесь в мир теплых мелодий и атмосферных звуков, 
                вдохновленных золотой эрой музыки
              </p>
              <div className="flex gap-4">
                <Button className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream px-8 py-3">
                  <Icon name="Play" size={20} className="mr-2" />
                  Слушать
                </Button>
                <Button variant="outline" className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream">
                  <Icon name="Download" size={20} className="mr-2" />
                  Скачать
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/img/d10a9c15-7d7f-41eb-b586-bff4324f107a.jpg" 
                  alt="Музыкант в винтажном стиле" 
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-vintage-warm/40 to-transparent"></div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-vintage-dark-brown rounded-full flex items-center justify-center shadow-xl">
                <Icon name="Music" size={32} className="text-vintage-cream" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Музыкальный плеер */}
      <section id="music" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-vintage-warm mb-4">Музыка</h3>
            <p className="text-vintage-warm/70 text-lg">Коллекция авторских треков</p>
          </div>

          <Card className="bg-vintage-cream/95 border-vintage-brown/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-vintage-warm">
                <Icon name="Disc3" size={24} />
                Сейчас играет: {tracks[currentTrack].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Плеер контролы */}
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="sm">
                  <Icon name="SkipBack" size={20} className="text-vintage-dark-brown" />
                </Button>
                <Button 
                  onClick={togglePlay}
                  className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream w-16 h-16 rounded-full"
                >
                  <Icon name={isPlaying ? "Pause" : "Play"} size={24} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Icon name="SkipForward" size={20} className="text-vintage-dark-brown" />
                </Button>
              </div>

              {/* Прогресс бар */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-vintage-warm/70">
                  <span>{formatTime(currentTime)}</span>
                  <span>{tracks[currentTrack].duration}</span>
                </div>
                <div className="w-full bg-vintage-brown/20 rounded-full h-2">
                  <div 
                    className="bg-vintage-dark-brown h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Список треков */}
              <div className="space-y-3">
                {tracks.map((track, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      currentTrack === index 
                        ? 'bg-vintage-dark-brown/10 border border-vintage-dark-brown/20' 
                        : 'hover:bg-vintage-brown/10'
                    }`}
                    onClick={() => setCurrentTrack(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-vintage-dark-brown rounded-full flex items-center justify-center">
                        <Icon name="Music" size={16} className="text-vintage-cream" />
                      </div>
                      <div>
                        <p className="font-medium text-vintage-warm">{track.title}</p>
                        <p className="text-sm text-vintage-warm/60">{track.duration}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Icon name="Play" size={16} className="text-vintage-dark-brown" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <audio ref={audioRef} />
        </div>
      </section>

      {/* Концерты */}
      <section id="concerts" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-vintage-warm mb-4">Концерты</h3>
            <p className="text-vintage-warm/70 text-lg">Ближайшие выступления</p>
          </div>

          <div className="grid gap-6">
            {concerts.map((concert, index) => (
              <Card key={index} className="bg-vintage-cream/95 border-vintage-brown/20 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-vintage-brown to-vintage-dark-brown rounded-full flex items-center justify-center">
                        <Icon name="Calendar" size={24} className="text-vintage-cream" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-vintage-warm">{concert.date}</h4>
                        <p className="text-vintage-warm/80">{concert.venue}</p>
                        <p className="text-sm text-vintage-warm/60">{concert.city}</p>
                      </div>
                    </div>
                    <Button className="bg-vintage-dark-brown hover:bg-vintage-warm text-vintage-cream">
                      Билеты
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section id="contact" className="py-16 px-6 bg-vintage-warm/5">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-vintage-warm mb-8">Контакты</h3>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-vintage-cream/95 border-vintage-brown/20">
              <CardContent className="p-6 text-center">
                <Icon name="Mail" size={32} className="mx-auto mb-4 text-vintage-dark-brown" />
                <h4 className="font-bold text-vintage-warm mb-2">Email</h4>
                <p className="text-vintage-warm/70">music@vintage.ru</p>
              </CardContent>
            </Card>

            <Card className="bg-vintage-cream/95 border-vintage-brown/20">
              <CardContent className="p-6 text-center">
                <Icon name="Phone" size={32} className="mx-auto mb-4 text-vintage-dark-brown" />
                <h4 className="font-bold text-vintage-warm mb-2">Телефон</h4>
                <p className="text-vintage-warm/70">+7 (999) 123-45-67</p>
              </CardContent>
            </Card>

            <Card className="bg-vintage-cream/95 border-vintage-brown/20">
              <CardContent className="p-6 text-center">
                <Icon name="Instagram" size={32} className="mx-auto mb-4 text-vintage-dark-brown" />
                <h4 className="font-bold text-vintage-warm mb-2">Соцсети</h4>
                <p className="text-vintage-warm/70">@vintage_music</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-6">
            <Button variant="outline" size="lg" className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream">
              <Icon name="Youtube" size={20} className="mr-2" />
              YouTube
            </Button>
            <Button variant="outline" size="lg" className="border-vintage-dark-brown text-vintage-dark-brown hover:bg-vintage-dark-brown hover:text-vintage-cream">
              <Icon name="Music" size={20} className="mr-2" />
              Spotify
            </Button>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-vintage-warm text-vintage-cream py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-4">&copy; 2024 Vintage Music. Все права защищены.</p>
          <p className="text-vintage-cream/70">Создано с любовью к музыке</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;