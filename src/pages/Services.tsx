import { Scissors } from 'lucide-react';

export default function Services() {
  const services = [
    { title: 'Designer Blouses', description: 'Custom-fitted, intricately designed blouses for sarees and lehengas.' },
    { title: 'Machine Work', description: 'Exquisite machine embroidery that adds elegance to any fabric.' },
    { title: 'Stone Work', description: 'Premium stone embellishments for a luxurious, sparkling finish.' },
    { title: 'Patch Work', description: 'Creative patch designs seamlessly integrated into your garments.' },
  ];

  return (
    <div className="flex flex-col w-full py-20 px-6 max-w-7xl mx-auto min-h-[70vh]">
      <h1 className="text-5xl font-serif text-primary text-center mb-8 tracking-wider">Our Services</h1>
      <div className="w-24 h-1 bg-secondary mx-auto mb-16"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {services.map((service, index) => (
          <div key={index} className="border border-gray-200 p-8 hover:shadow-xl transition-shadow duration-300 rounded-sm bg-white group">
            <Scissors className="text-secondary h-10 w-10 mb-6 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-2xl font-serif text-primary mb-4">{service.title}</h3>
            <p className="text-gray-600 font-light leading-relaxed">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
