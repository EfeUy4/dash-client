import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const HeroSectionV2 = () => {
  const [currentImage, setCurrentImage] = useState(0);
  
  // Sample carousel images - replace with your actual images
  const carouselImages = [
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070"
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary-50 to-accent-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/5"></div>
      <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
        {/* Left Side: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-left"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
            Elevate Your
            <span className="block text-primary-600">Style Journey</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-700 max-w-xl mb-8">
            Discover our curated collection of premium clothing and accessories. Where luxury meets
            sophistication in every thread.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#products" className="px-6 py-3 bg-primary-600 text-white rounded-md font-medium flex items-center hover:bg-primary-700 transition-colors">
              Explore Collection
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
            <a href="#new-arrivals" className="px-6 py-3 bg-white text-primary-600 border border-primary-600 rounded-md font-medium hover:bg-primary-50 transition-colors">
              New Arrivals
            </a>
          </div>
        </motion.div>

        {/* Right Side: Image Carousel */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative h-[500px] rounded-xl overflow-hidden shadow-2xl"
        >
          {carouselImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: currentImage === index ? 1 : 0,
                scale: currentImage === index ? 1 : 1.1
              }}
              transition={{ 
                opacity: { duration: 1.2 },
                scale: { duration: 8 }
              }}
            >
              <img
                src={image}
                alt={`Fashion item ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </motion.div>
          ))}
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentImage === index ? 'w-8 bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-32 h-32 bg-accent-200 rounded-full opacity-20"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </section>
  );
};

export default HeroSectionV2;