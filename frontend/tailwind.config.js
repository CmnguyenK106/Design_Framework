/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#186AC7',
        'primary-hover': '#1557A6',
        secondary: '#6C757D',
        success: '#28A745',
        danger: '#DC3545',
        warning: '#FFC107',
        light: '#F8F9FA',
        dark: '#343A40',
        white: '#FFFFFF',
        'gray-100': '#F1F3F5',
        'gray-200': '#E9ECEF',
        'gray-300': '#DEE2E6',
      },
    },
  },
  plugins: [],
}
