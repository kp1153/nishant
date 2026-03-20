export default function manifest() {
  return {
    name: "निशांत हार्डवेयर",
    short_name: "निशांत",
    description: "हार्डवेयर दुकान — बिल, स्टॉक, उधारी, GST",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#1e3a8a",
    theme_color: "#1d4ed8",
    orientation: "portrait-primary",
    lang: "hi",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "नया बिल",
        url: "/dashboard/bill/new",
      },
      {
        name: "उधारी",
        url: "/dashboard/udhaari",
      },
    ],
  }
}