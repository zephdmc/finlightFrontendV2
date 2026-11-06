// // scripts/generate-sitemap.js
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Your public routes
// const routes = [
//     '/',
//     '/learn-more',
//     '/terms',
//     '/privacy',
//     '/refund',
//     '/login',
//     '/register',
//     '/signup',
//     '/forgot-password',
//     '/reset-password',
// ];

// const baseUrl = 'https://finlight.web.app';
// const currentDate = new Date().toISOString().split('T')[0];

// const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
// ${routes.map(route => `  <url>
//     <loc>${baseUrl}${route}</loc>
//     <lastmod>${currentDate}</lastmod>
//     <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
//     <priority>${route === '/' ? '1.0' : '0.8'}</priority>
//   </url>`).join('\n')}
// </urlset>`;

// // Write sitemap to public folder
// const outputPath = path.join(__dirname, '../public/sitemap.xml');
// fs.writeFileSync(outputPath, sitemap);
// console.log('✅ Sitemap generated at public/sitemap.xml');

// scripts/generate-html.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your static routes with SEO data
const routes = [
  {
    path: '/',
    title: 'FinLight - Financial Management Platform',
    description: 'Simplify financial management for your community organization with FinLight. Track payments, manage members, and generate reports effortlessly.'
  },
  {
    path: '/learn-more',
    title: 'Learn More | FinLight',
    description: 'Discover how FinLight can transform your organization\'s financial management'
  },
  {
    path: '/terms',
    title: 'Terms and Conditions | FinLight',
    description: 'Read our terms and conditions'
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | FinLight',
    description: 'Read our privacy policy'
  },
  {
    path: '/refund',
    title: 'Refund Policy | FinLight',
    description: 'Read our refund policy'
  },
  {
    path: '/login',
    title: 'Login | FinLight',
    description: 'Login to your FinLight account'
  },
  {
    path: '/register',
    title: 'Register | FinLight',
    description: 'Create your FinLight account'
  },
  {
    path: '/signup',
    title: 'Sign Up | FinLight',
    description: 'Sign up for FinLight'
  },
  {
    path: '/forgot-password',
    title: 'Forgot Password | FinLight',
    description: 'Reset your FinLight password'
  },
  {
    path: '/reset-password',
    title: 'Reset Password | FinLight',
    description: 'Reset your FinLight password'
  }
];

// Read the built index.html
const distPath = path.join(__dirname, '../dist');
const indexHtmlPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('❌ Build not found! Run npm run build first.');
  process.exit(1);
}

let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Generate HTML files for each route
routes.forEach(route => {
  let html = indexHtml;

  // Replace title
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${route.title}</title>`
  );

  // Replace description meta
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${route.description}" />`
  );

  // Add canonical URL
  const canonicalTag = `<link rel="canonical" href="https://finlightv2.web.app${route.path}" />`;
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/,
    canonicalTag
  );

  // If no canonical exists, add it
  if (!html.includes('rel="canonical"')) {
    html = html.replace(
      '</head>',
      `${canonicalTag}\n</head>`
    );
  }

  // Add Open Graph tags
  const ogTags = `
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.description}" />
    <meta property="og:url" content="https://finlightv2.web.app${route.path}" />
    <meta property="og:type" content="website" />
  `;

  // Remove existing OG tags and add new ones
  html = html.replace(/<meta property="og:.*?" .*?\/>/g, '');
  html = html.replace(
    '</head>',
    `${ogTags}\n</head>`
  );

  // Determine output path
  let outputPath;
  if (route.path === '/') {
    outputPath = path.join(distPath, 'index.html');
  } else {
    // Create directory for the route
    const routeDir = path.join(distPath, route.path.slice(1));
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    outputPath = path.join(routeDir, 'index.html');
  }

  fs.writeFileSync(outputPath, html);
  console.log(`✅ Generated: ${route.path} -> ${outputPath}`);
});

console.log('🎉 All static HTML files generated successfully!');