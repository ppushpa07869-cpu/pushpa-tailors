export default function Contact() {
  return (
    <div className="flex flex-col w-full py-20 px-6 max-w-7xl mx-auto min-h-[70vh]">
      <h1 className="text-5xl font-serif text-primary text-center mb-8 tracking-wider">Contact Us</h1>
      <div className="w-24 h-1 bg-secondary mx-auto mb-16"></div>
      
      <div className="max-w-3xl mx-auto w-full bg-white border border-gray-100 shadow-lg p-10 rounded-sm">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input type="text" id="name" className="w-full border border-gray-300 px-4 py-3 rounded-sm focus:ring-secondary focus:border-secondary outline-none transition-colors" placeholder="Your Name" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input type="tel" id="phone" className="w-full border border-gray-300 px-4 py-3 rounded-sm focus:ring-secondary focus:border-secondary outline-none transition-colors" placeholder="Your Phone Number" />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea id="message" rows={5} className="w-full border border-gray-300 px-4 py-3 rounded-sm focus:ring-secondary focus:border-secondary outline-none transition-colors" placeholder="How can we help you?"></textarea>
          </div>
          <button type="button" className="w-full bg-primary text-white font-semibold py-4 rounded-sm hover:bg-black transition-colors duration-300 tracking-widest uppercase">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
