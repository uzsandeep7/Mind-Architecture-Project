import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string | null;
  image_url: string;
  category: string | null;
}

const GalleryPage = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("is_published", true)
        .order("display_order");

      if (error) {
        console.error("Error fetching gallery:", error);
      } else {
        setImages(data || []);
      }
      setIsLoading(false);
    };

    fetchGallery();
  }, []);

  const categories = ["All", ...new Set(images.map((img) => img.category).filter(Boolean))] as string[];
  
  const filteredImages = selectedCategory === "All" 
    ? images 
    : images.filter((img) => img.category === selectedCategory);

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-hero text-cream">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="text-primary font-medium tracking-widest uppercase text-sm">
              Gallery
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mt-4 mb-6">
              Moments of
              <span className="text-gradient-gold"> Transformation</span>
            </h1>
            <p className="text-cream/70 text-lg">
              Explore our collection of inspiring moments from events, workshops, 
              and transformative experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 bg-background border-b border-border">
        <div className="container-wide">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedImage(image)}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                >
                  <img
                    src={image.image_url}
                    alt={image.title || "Gallery image"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/40 transition-colors flex items-end">
                    <div className="p-4 text-cream opacity-0 group-hover:opacity-100 transition-opacity">
                      {image.title && (
                        <p className="font-medium">{image.title}</p>
                      )}
                      {image.category && (
                        <p className="text-sm text-cream/70">{image.category}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No images found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-dark/50 rounded-full text-cream hover:bg-dark/70 transition-colors z-10"
          >
            <X size={20} />
          </button>
          {selectedImage && (
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title || "Gallery image"}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default GalleryPage;
