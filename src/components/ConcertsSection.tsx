import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from '@/components/ui/icon';

interface Concert {
  date: string;
  venue: string;
  city: string;
}

interface ConcertsSectionProps {
  concerts: Concert[];
}

const ConcertsSection: React.FC<ConcertsSectionProps> = ({ concerts }) => {
  return (
    <section id="concerts" className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-vintage-warm mb-4">Концерты</h3>
          <p className="text-vintage-warm/70 text-lg">Встретимся на живых выступлениях</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {concerts.map((concert, index) => (
            <Card key={index} className="bg-vintage-cream/95 border-vintage-brown/20 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-vintage-warm">
                  <Icon name="Calendar" size={20} />
                  {concert.date}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-vintage-warm/80">
                    <Icon name="MapPin" size={16} />
                    {concert.venue}
                  </p>
                  <p className="text-vintage-warm/60">{concert.city}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConcertsSection;