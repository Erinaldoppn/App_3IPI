
import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

const Events: React.FC = () => {
  const events = [
    {
      id: '1',
      title: 'Conferência de Mulheres 2024',
      date: '25 Out',
      time: '19:30',
      location: 'Auditório Principal',
      description: 'Um encontro especial de renovo e comunhão para todas as mulheres de nossa comunidade.',
      image: 'https://picsum.photos/seed/event1/600/400'
    },
    {
      id: '2',
      title: 'Retiro de Jovens: Imersão',
      date: '12 Nov',
      time: '08:00',
      location: 'Chácara Vale do Sol',
      description: 'Três dias de busca intensa pela presença de Deus e lazer com amigos.',
      image: 'https://picsum.photos/seed/event2/600/400'
    },
    {
      id: '3',
      title: 'Noite de Adoração & Oração',
      date: '02 Dez',
      time: '20:00',
      location: 'Igreja 3IPI',
      description: 'Venha clamar conosco pelo nosso país e pelas famílias da nossa congregação.',
      image: 'https://picsum.photos/seed/event3/600/400'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Próximos Eventos</h1>
        <p className="text-gray-500 dark:text-gray-400">Fique por dentro de tudo o que acontece na nossa igreja.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <div key={event.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-shadow flex flex-col h-full">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-brand-blue text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                {event.date}
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-brand-darkBlue dark:text-white mb-2">{event.title}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <Clock size={16} className="mr-2 text-brand-blue" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <MapPin size={16} className="mr-2 text-brand-blue" />
                  <span>{event.location}</span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6">
                {event.description}
              </p>

              <button className="mt-auto w-full bg-brand-yellow text-brand-darkBlue font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors">
                Saiba Mais
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
