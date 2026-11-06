// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => {
//   const isProduction = mode === 'production';

//   return {
//     base: isProduction ? '/' : './',
//     plugins: [react()],

//     define: {
//       'process.env': {},
//       'process': {},
//       'global': 'globalThis',
//       'import.meta.env.VITE_REMOVE_LOGS': isProduction,
//     },

//     optimizeDeps: {
//       include: ['axios', 'react-hot-toast', 'dompurify', 'xss'],
//       esbuildOptions: {
//         define: {
//           global: 'globalThis',
//         },
//       },
//     },

//     server: {
//       port: 5173,
//       host: true,
//       strictPort: true,
//       proxy: {
//         '/api': {
//           target: 'http://localhost:5000',
//           changeOrigin: true,
//           secure: false,
//           timeout: 30000,
//           ws: true,
//         },
//       },
//       headers: {
//         'X-Content-Type-Options': 'nosniff',
//         'X-Frame-Options': 'DENY',
//         'X-XSS-Protection': '1; mode=block',
//         'Referrer-Policy': 'strict-origin-when-cross-origin',
//       },
//     },

//     build: {
//       outDir: 'dist',
//       rollupOptions: {
//         output: {
//           entryFileNames: 'assets/[name]-[hash]-v4.js',
//           chunkFileNames: 'assets/[name]-[hash]-v4.js',
//           assetFileNames: 'assets/[name]-[hash]-v4.[ext]'
//         }
//       }
//     },

//     preview: {
//       port: 4173,
//       host: true,
//       strictPort: true,
//       headers: {
//         'X-Content-Type-Options': 'nosniff',
//         'X-Frame-Options': 'DENY',
//         'X-XSS-Protection': '1; mode=block',
//         'Referrer-Policy': 'strict-origin-when-cross-origin',
//       },
//     },

//     esbuild: {
//       drop: isProduction ? ['console', 'debugger'] : [],
//       target: 'es2020',
//     },

//     resolve: {
//       alias: {
//         '@': '/src',
//         '@components': '/src/components',
//         '@services': '/src/services',
//         '@utils': '/src/utils',
//         '@context': '/src/context',
//         '@hooks': '/src/hooks',
//       },
//     },

//     css: {
//       devSourcemap: !isProduction,
//       modules: {
//         localsConvention: 'camelCase',
//         generateScopedName: isProduction
//           ? '[hash:base64:8]'
//           : '[name]__[local]__[hash:base64:5]',
//       },
//     },
//   };
// });




// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => {
//   const isProduction = mode === 'production';

//   return {
//     base: isProduction ? '/' : './',
//     plugins: [
//       react(),
//          ],

//     define: {
//       'process.env': {},
//       'process': {},
//       'global': 'globalThis',
//       'import.meta.env.VITE_REMOVE_LOGS': isProduction,
//     },

//     optimizeDeps: {
//       include: ['axios', 'react-hot-toast', 'dompurify', 'xss'],
//       esbuildOptions: {
//         define: {
//           global: 'globalThis',
//         },
//       },
//     },

//     server: {
//       port: 5173,
//       host: true,
//       strictPort: true,
//       proxy: {
//         '/api': {
//           target: 'http://localhost:5000',
//           changeOrigin: true,
//           secure: false,
//           timeout: 30000,
//           ws: true,
//         },
//       },
//       headers: {
//         'X-Content-Type-Options': 'nosniff',
//         'X-Frame-Options': 'DENY',
//         'X-XSS-Protection': '1; mode=block',
//         'Referrer-Policy': 'strict-origin-when-cross-origin',
//       },
//     },

//     build: {
//       outDir: 'dist',
//       rollupOptions: {
//         output: {
//           entryFileNames: 'assets/[name]-[hash]-v5.js', // Bumped version
//           chunkFileNames: 'assets/[name]-[hash]-v5.js',
//           assetFileNames: 'assets/[name]-[hash]-v5.[ext]'
//         }
//       }
//     },

//     preview: {
//       port: 4173,
//       host: true,
//       strictPort: true,
//       headers: {
//         'X-Content-Type-Options': 'nosniff',
//         'X-Frame-Options': 'DENY',
//         'X-XSS-Protection': '1; mode=block',
//         'Referrer-Policy': 'strict-origin-when-cross-origin',
//       },
//     },

//     esbuild: {
//       drop: isProduction ? ['console', 'debugger'] : [],
//       target: 'es2020',
//     },

//     resolve: {
//       alias: {
//         '@': '/src',
//         '@components': '/src/components',
//         '@services': '/src/services',
//         '@utils': '/src/utils',
//         '@context': '/src/context',
//         '@hooks': '/src/hooks',
//       },
//     },

//     css: {
//       devSourcemap: !isProduction,
//       modules: {
//         localsConvention: 'camelCase',
//         generateScopedName: isProduction
//           ? '[hash:base64:8]'
//           : '[name]__[local]__[hash:base64:5]',
//       },
//     },
//   };
// });

// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerenderStatic from "vite-plugin-prerender-static";

// Import your Firebase config (you'll need to create this)
// Note: This runs during build time, so we need to handle Firebase carefully

export default defineConfig({
  plugins: [
    react(),
    prerenderStatic({
      // Static routes that don't need dynamic data
      routes: [
        {
          path: "/",
          tags: {
            title: "FinLight - Financial Management Platform",
            description: "Simplify financial management for your community organization with FinLight. Track payments, manage members, and generate reports effortlessly."
          }
        },
        {
          path: "/learn-more",
          tags: {
            title: "Learn More | FinLight",
            description: "Discover how FinLight can transform your organization's financial management"
          }
        },
        {
          path: "/terms",
          tags: {
            title: "Terms and Conditions | FinLight",
            description: "Read our terms and conditions"
          }
        },
        {
          path: "/privacy",
          tags: {
            title: "Privacy Policy | FinLight",
            description: "Read our privacy policy"
          }
        },
        {
          path: "/refund",
          tags: {
            title: "Refund Policy | FinLight",
            description: "Read our refund policy"
          }
        },
        {
          path: "/login",
          tags: {
            title: "Login | FinLight",
            description: "Login to your FinLight account"
          }
        },
        {
          path: "/register",
          tags: {
            title: "Register | FinLight",
            description: "Create your FinLight account"
          }
        },
        {
          path: "/signup",
          tags: {
            title: "Sign Up | FinLight",
            description: "Sign up for FinLight"
          }
        },
        {
          path: "/forgot-password",
          tags: {
            title: "Forgot Password | FinLight",
            description: "Reset your FinLight password"
          }
        },
        // Public routes that don't require authentication
        {
          path: "/payment/callback",
          tags: {
            title: "Payment Callback | FinLight",
            description: "Payment processing"
          }
        },
        {
          path: "/payment-verify",
          tags: {
            title: "Payment Verification | FinLight",
            description: "Verify your payment"
          }
        },
      ],
      headless: true,
      waitFor: '#root',
      waitAfter: 2000, // Increased for dynamic content
      // Ignore routes that require authentication
      ignore: [
        '/admin/*',
        '/dashboard',
        '/dashboard1',
        '/profile',
        '/payments',
        '/members/*',
        '/reports',
        '/account',
        '/organization-settings',
        '/bank-change-request',
        '/admin-history',
        '/fine-management',
        '/contribution-management',
        '/payment-history',
        '/make-payment',
        '/admin/organizations',
      ],
    })
  ],
  root: process.cwd(),
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: 'index.html',
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    external: ['firebase', 'firebase/firestore', 'firebase/app']
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@services': '/src/services',
      '@utils': '/src/utils',
      '@context': '/src/context',
      '@hooks': '/src/hooks',
    },
    // Add optimizeDeps for Firebase
    optimizeDeps: {
      include: ['firebase/app', 'firebase/firestore']
    }
  },
})

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import prerenderStatic from "vite-plugin-prerender-static";

// export default defineConfig({
//   plugins: [react(), prerenderStatic({
//     routes: [
//       { path: "/", tags: { title: "Home | https://finlight.web.app", description: "https://finlight.web.app description" } },
//       { path: "/about", tags: { title: "About | https://finlight.web.app", description: "About us" } },
//       { path: "/contact", tags: { title: "Contact | https://finlight.web.app", description: "Contact us" } },
//     ],
//     headless: true,
//     waitFor: '#root', // Wait for your app to mount
//     waitAfter: 1000,
//   })],
//   root: process.cwd(),

//   server: {
//     port: 5173,
//     host: true,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
//   build: {
//     outDir: 'dist',
//     sourcemap: false,
//     rollupOptions: {
//       input: 'index.html',  // Make sure this points to your index.html
//       output: {
//         entryFileNames: 'assets/[name]-[hash].js',
//         chunkFileNames: 'assets/[name]-[hash].js',
//         assetFileNames: 'assets/[name]-[hash].[ext]'
//       }
//     }
//   },
//   resolve: {
//     alias: {
//       '@': '/src',
//       '@components': '/src/components',
//       '@services': '/src/services',
//       '@utils': '/src/utils',
//       '@context': '/src/context',
//       '@hooks': '/src/hooks',
//     },
//   },
// })
