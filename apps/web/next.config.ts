import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDE0j6WmH830SlpGmy9XbY1EXU9QdbWTsU",
    VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || "bugsense-ai-28c1b.firebaseapp.com",
    VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || "bugsense-ai-28c1b",
    VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET || "bugsense-ai-28c1b.firebasestorage.app",
    VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "657520549712",
    VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || "1:657520549712:web:39408cbd12d80bbd179655",
    VITE_FIREBASE_MEASUREMENT_ID: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DBY5YBVBRG",
  },
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        "import.meta.env.VITE_FIREBASE_API_KEY": JSON.stringify(
          process.env.VITE_FIREBASE_API_KEY || "AIzaSyDE0j6WmH830SlpGmy9XbY1EXU9QdbWTsU"
        ),
        "import.meta.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(
          process.env.VITE_FIREBASE_AUTH_DOMAIN || "bugsense-ai-28c1b.firebaseapp.com"
        ),
        "import.meta.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(
          process.env.VITE_FIREBASE_PROJECT_ID || "bugsense-ai-28c1b"
        ),
        "import.meta.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(
          process.env.VITE_FIREBASE_STORAGE_BUCKET || "bugsense-ai-28c1b.firebasestorage.app"
        ),
        "import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(
          process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "657520549712"
        ),
        "import.meta.env.VITE_FIREBASE_APP_ID": JSON.stringify(
          process.env.VITE_FIREBASE_APP_ID || "1:657520549712:web:39408cbd12d80bbd179655"
        ),
        "import.meta.env.VITE_FIREBASE_MEASUREMENT_ID": JSON.stringify(
          process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DBY5YBVBRG"
        ),
      })
    );
    return config;
  },
};

export default nextConfig;
