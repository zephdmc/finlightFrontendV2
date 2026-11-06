// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           50: '#eff6ff',
//           100: '#dbeafe',
//           200: '#bfdbfe',
//           300: '#93c5fd',
//           400: '#60a5fa',
//           500: '#3b82f6',
//           600: '#2563eb',
//           700: '#1d4ed8',
//           800: '#1e40af',
//           900: '#1e3a8a',
//         },
//       },
//       fontFamily: {
//         sans: ['Inter', 'system-ui', 'sans-serif'],
//       },
//       animation: {
//         'spin-slow': 'spin 2s linear infinite',
//       },
//     },
//   },
//   plugins: [],
// }

// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   safelist: [
//     // Common dynamic classes
//     'bg-red-500',
//     'bg-green-500',
//     'bg-blue-500',
//     'bg-yellow-500',
//     'bg-purple-500',
//     'text-red-500',
//     'text-green-500',
//     'text-blue-500',
//     'text-yellow-500',
//     'border-red-500',
//     'border-green-500',
//     // Animation classes
//     'animate-spin',
//     'animate-pulse',
//     'animate-bounce',
//     // Grid and flex
//     'grid-cols-1',
//     'grid-cols-2',
//     'grid-cols-3',
//     'grid-cols-4',
//     // Add any other dynamic classes you use
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: {
//           50: '#eff6ff',
//           100: '#dbeafe',
//           200: '#bfdbfe',
//           300: '#93c5fd',
//           400: '#60a5fa',
//           500: '#3b82f6',
//           600: '#2563eb',
//           700: '#1d4ed8',
//           800: '#1e40af',
//           900: '#1e3a8a',
//         },
//       },
//       fontFamily: {
//         sans: ['Inter', 'system-ui', 'sans-serif'],
//       },
//       animation: {
//         'spin-slow': 'spin 2s linear infinite',
//       },
//     },
//   },
//   plugins: [],
// }
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  safelist: [
    // Common dynamic classes
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-purple-500",
    "text-red-500",
    "text-green-500",
    "text-blue-500",
    "text-yellow-500",
    "border-red-500",
    "border-green-500",

    // Animation classes
    "animate-spin",
    "animate-pulse",
    "animate-bounce",

    // Grid
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-3",
    "grid-cols-4",

    // Add any other dynamic classes you use
  ],

  theme: {
    extend: {
      colors: {
        // ==========================================
        // FINLIGHT BRAND COLORS (Primary Blue System)
        // ==========================================
        brand: {
          50: "#F4FAFE",
          100: "#E8F5FD",
          200: "#CDEBFA",
          300: "#9DD7F7",
          400: "#30A8EE",
          500: "#1E93E5",
          600: "#107EDD",
          700: "#0568D4",
          800: "#0152BF",
          900: "#003B8F",
        },

        // ==========================================
        // FINLIGHT DARK TEXT COLORS
        // ==========================================
        dark: {
          900: "#07111F",
          800: "#0B1220",
          700: "#1E293B",
          600: "#334155",
          500: "#526071",
          400: "#7A8797",
          300: "#A8B2BF",
          200: "#E6ECF2",
          100: "#EEF2F6",
          50: "#F7FAFD",
        },

        // ==========================================
        // FINLIGHT SUCCESS
        // ==========================================
        success: {
          50: "#ECFDF3",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#16A34A",
          600: "#15803D",
          700: "#166534",
          800: "#14532D",
          900: "#0A3D1A",
        },

        // ==========================================
        // FINLIGHT WARNING
        // ==========================================
        warning: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#D97706",
          600: "#B45309",
          700: "#92400E",
          800: "#78350F",
          900: "#451A03",
        },

        // ==========================================
        // FINLIGHT ERROR
        // ==========================================
        error: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#DC2626",
          600: "#B91C1C",
          700: "#991B1B",
          800: "#7F1D1D",
          900: "#450A0A",
        },

        // ==========================================
        // FINLIGHT INFO
        // ==========================================
        info: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
          800: "#1E3A8A",
          900: "#172554",
        },

        // ==========================================
        // SURFACE / BACKGROUND COLORS
        // ==========================================
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F7FAFD",
          brand: "#E8F5FD",
        },

        border: {
          DEFAULT: "#E6ECF2",
          subtle: "#EEF2F6",
        },

        // ==========================================
        // ALIASES FOR EASY REFERENCE
        // ==========================================
        primary: {
          50: "#F4FAFE",
          100: "#E8F5FD",
          200: "#CDEBFA",
          300: "#9DD7F7",
          400: "#30A8EE",
          500: "#1E93E5",
          600: "#107EDD",
          700: "#0568D4",
          800: "#0152BF",
          900: "#003B8F",
        },

        heading: "#07111F",
        body: "#526071",
        background: "#FFFFFF",
        softBackground: "#F7FAFD",
      },

      // ==========================================
      // FINLIGHT TYPOGRAPHY
      // ==========================================
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      // ==========================================
      // FINLIGHT GRADIENTS
      // ==========================================
      backgroundImage: {
        "finlight-gradient":
          "linear-gradient(135deg, #0152BF 0%, #0568D4 55%, #107EDD 100%)",
        "finlight-gradient-soft":
          "linear-gradient(135deg, #0568D4 0%, #30A8EE 100%)",
        "finlight-hero":
          "linear-gradient(135deg, #003B8F 0%, #0152BF 40%, #0568D4 70%, #107EDD 100%)",
        "finlight-cta":
          "linear-gradient(135deg, #0568D4 0%, #0152BF 100%)",
        "finlight-footer":
          "linear-gradient(180deg, #003B8F 0%, #07111F 100%)",
      },

      // ==========================================
      // ANIMATIONS
      // ==========================================
      animation: {
        "spin-slow": "spin 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
      },

      // ==========================================
      // SUBTLE FINTECH SHADOWS
      // ==========================================
      boxShadow: {
        "finlight-card": "0 4px 20px rgba(7, 17, 31, 0.05)",
        "finlight-soft": "0 8px 30px rgba(7, 17, 31, 0.06)",
        "finlight-blue": "0 8px 24px rgba(5, 104, 212, 0.18)",
        "finlight-heavy": "0 20px 60px rgba(7, 17, 31, 0.10)",
        "finlight-glow": "0 0 40px rgba(48, 168, 238, 0.15)",
      },

      // ==========================================
      // PROFESSIONAL BORDER RADIUS
      // ==========================================
      borderRadius: {
        "finlight": "14px",
        "finlight-sm": "10px",
        "finlight-lg": "20px",
        "finlight-xl": "24px",
      },
    },
  },

  plugins: [],
};