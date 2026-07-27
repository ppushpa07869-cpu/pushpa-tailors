import Hero from '../components/Hero';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-serif text-primary text-center mb-8 tracking-wide">Welcome to PUSHPA TAILORS</h2>
        <div className="w-24 h-1 bg-secondary mx-auto mb-10"></div>
        <p className="text-center text-lg max-w-3xl mx-auto text-gray-700 leading-relaxed font-light">
          We bring you the finest in professional ladies tailoring, specializing in bespoke designs that match your unique style. Experience the perfect fit with our premium boutique services, where tradition meets contemporary fashion.
        </p>
      </section>
    </div>
  );
}
