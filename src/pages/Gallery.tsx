import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GalleryItem {
  id: string;
  image_url: string;
  title?: string | null;
}

const fallbackGalleryImages: GalleryItem[] = Array.from({ length: 7 }, (_, i) => ({
  id: String(i + 1),
  image_url: `/gallery${i + 1}.jpg`,
  title: `Gallery image ${i + 1}`,
}));

const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>(fallbackGalleryImages);

  useEffect(() => {
    const loadGallery = async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("id, image_url, title")
        .eq("is_published", true)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        setGalleryImages(data);
      }
    };

    void loadGallery();
  }, []);

  return (
    <Layout>
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
              A visual journey through our events, workshops, and experiences.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {galleryImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mb-4 break-inside-avoid cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative overflow-hidden rounded-xl shadow-soft group">
                  <img
                    src={image.image_url}
                    alt={image.title || "Gallery image"}
                    loading="lazy"
                    className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/30" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition"
          >
            <X size={22} />
          </button>

          {selectedImage && (
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title || "Gallery preview"}
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default GalleryPage;
