import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-indigo-950">
      {/* Header */}
      <header className="p-6">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <h1 
              className="text-2xl font-bold text-emerald-100 cursor-pointer hover:text-emerald-200"
              onClick={() => navigate('/')}
            >
              Дмитрий Шмелидзэ
            </h1>
            <div className="hidden md:flex space-x-6">
              <Button 
                variant="ghost" 
                className="text-emerald-200 hover:text-white"
                onClick={() => navigate('/')}
              >
                Главная
              </Button>
              <Button 
                variant="ghost" 
                className="text-emerald-200 hover:text-white"
                onClick={() => navigate('/music')}
              >
                Музыка
              </Button>
              <Button 
                variant="ghost" 
                className="text-emerald-100 hover:text-white bg-emerald-800/50"
              >
                Контакты
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-300 via-blue-300 to-purple-300 bg-clip-text text-transparent mb-6">
            Свяжитесь со мной
          </h2>
          <p className="text-xl text-emerald-200 max-w-2xl mx-auto">
            Есть вопросы о музыке? Хотите заказать выступление? Или просто поделиться мыслями? Буду рад общению!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-emerald-900/30 rounded-2xl p-8 backdrop-blur-sm border border-emerald-500/30">
            <h3 className="text-2xl font-bold text-emerald-100 mb-6">Напишите мне</h3>
            
            <form className="space-y-6">
              <div>
                <label className="block text-emerald-200 text-sm font-medium mb-2">
                  Ваше имя
                </label>
                <Input 
                  placeholder="Введите ваше имя"
                  className="bg-emerald-800/30 border-emerald-600/50 text-emerald-100 placeholder-emerald-400"
                />
              </div>
              
              <div>
                <label className="block text-emerald-200 text-sm font-medium mb-2">
                  Email
                </label>
                <Input 
                  type="email"
                  placeholder="your@email.com"
                  className="bg-emerald-800/30 border-emerald-600/50 text-emerald-100 placeholder-emerald-400"
                />
              </div>
              
              <div>
                <label className="block text-emerald-200 text-sm font-medium mb-2">
                  Сообщение
                </label>
                <Textarea 
                  placeholder="Напишите ваше сообщение..."
                  rows={5}
                  className="bg-emerald-800/30 border-emerald-600/50 text-emerald-100 placeholder-emerald-400"
                />
              </div>
              
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
              >
                <Icon name="Send" size={20} className="mr-2" />
                Отправить сообщение
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-blue-900/30 rounded-2xl p-6 backdrop-blur-sm border border-blue-500/30">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                  <Icon name="Mail" size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-100">Email</h4>
                  <p className="text-blue-200">music@dmitry-shmelidze.ru</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-900/30 rounded-2xl p-6 backdrop-blur-sm border border-purple-500/30">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-full flex items-center justify-center mr-4">
                  <Icon name="Phone" size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-purple-100">Телефон</h4>
                  <p className="text-purple-200">+7 (999) 123-45-67</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-900/30 rounded-2xl p-6 backdrop-blur-sm border border-emerald-500/30">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center mr-4">
                  <Icon name="MapPin" size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-emerald-100">Местоположение</h4>
                  <p className="text-emerald-200">Москва, Россия</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gradient-to-br from-emerald-900/30 via-blue-900/30 to-purple-900/30 rounded-2xl p-6 backdrop-blur-sm border border-emerald-500/30">
              <h4 className="text-lg font-bold text-emerald-100 mb-4">Социальные сети</h4>
              <div className="flex space-x-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-blue-500/50 text-blue-300 hover:bg-blue-500 hover:text-white"
                >
                  <Icon name="Music" size={16} className="mr-2" />
                  VK Music
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-red-500/50 text-red-300 hover:bg-red-500 hover:text-white"
                >
                  <Icon name="Youtube" size={16} className="mr-2" />
                  YouTube
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-16">
          <Button 
            size="lg" 
            variant="outline"
            className="border-emerald-400 text-emerald-300 hover:bg-emerald-500 hover:text-white"
            onClick={() => navigate('/')}
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Вернуться на главную
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Contact;