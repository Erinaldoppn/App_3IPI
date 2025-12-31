
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="text-brand-blue font-bold text-4xl lg:text-5xl leading-tight">
            Quem Somos na <span className="text-brand-darkBlue dark:text-blue-300">Igreja 3IPI</span>
          </h1>
          <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            <p>
              A 3IPI nasceu de um sonho de ser uma igreja relevante para a sua cidade e fiel ao Evangelho. 
              Somos uma comunidade cristã apaixonada por Jesus e comprometida em amar as pessoas como elas são.
            </p>
            <p>
              Nossa missão é proclamar as boas novas de Cristo, promovendo a transformação integral do ser humano 
              e da sociedade através do ensino bíblico e do serviço ao próximo.
            </p>
            <p>
              Acreditamos que a igreja não é apenas um prédio, mas sim pessoas unidas por um propósito maior. 
              Seja bem-vindo a fazer parte desta família!
            </p>
          </div>
          <div className="flex space-x-4 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-blue">20+</div>
              <div className="text-sm text-gray-500">Anos de História</div>
            </div>
            <div className="border-l border-gray-200 dark:border-gray-700 h-10 self-center"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-blue">500+</div>
              <div className="text-sm text-gray-500">Membros</div>
            </div>
            <div className="border-l border-gray-200 dark:border-gray-700 h-10 self-center"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-blue">15+</div>
              <div className="text-sm text-gray-500">Ministérios</div>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-brand-yellow/20 rounded-3xl blur-xl group-hover:bg-brand-yellow/30 transition-colors"></div>
          <img 
            src="https://picsum.photos/seed/church/800/1000" 
            alt="Nossa Comunidade" 
            className="relative rounded-2xl shadow-2xl object-cover w-full aspect-[4/5]"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
