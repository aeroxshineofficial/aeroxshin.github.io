# AeroGet Medical Supplies - Product Ordering Website

A professional, responsive clinic/hospital product ordering website built with HTML5, CSS3, and vanilla JavaScript. Hosted on GitHub Pages.

## Features

- Product catalogue with 20+ clinic/hospital cleaning and hygiene products
- Search, filter by category, sort by price/name, availability filter
- Shopping cart system with localStorage persistence
- Customer details form with validation
- WhatsApp click-to-chat ordering
- Fully responsive (mobile-first)
- SEO optimized
- Accessibility friendly

## Folder Structure

```
/
├── index.html          (Home page)
├── products.html       (Product catalogue)
├── product.html        (Product details)
├── cart.html           (Order cart & checkout)
├── contact.html        (Contact/About page)
├── robots.txt          (SEO)
├── sitemap.xml         (SEO)
├── css/
│   └── style.css       (All styles)
├── js/
│   ├── products.js     (Product data)
│   ├── app.js          (Shared utilities)
│   ├── products-page.js
│   ├── product-details.js
│   └── cart.js
├── assets/
│   ├── images/         (Site images)
│   └── products/       (Product images)
└── README.md
```

## How to Add/Edit Products

Open `js/products.js` and modify the `products` array. Each product has this structure:

```javascript
{
  id: 21,                    // Unique number
  name: "Product Name",      // Display name
  category: "Floor Cleaners", // Must match a category in CATEGORIES array
  packSize: "5 Litre",       // Pack size display
  price: 450,                // Price in INR (number)
  image: "assets/products/product-image.jpg",
  description: "Product description text.",
  available: true,           // true or false
  features: ["Feature 1", "Feature 2"]  // Optional
}
```

### Adding a New Product

1. Add the product object to the `products` array in `js/products.js`
2. Add a product image to `assets/products/`
3. If adding a new category, add it to the `CATEGORIES` array

### Removing a Product

Remove the product object from the `products` array.

## How to Change WhatsApp Number

Open `js/app.js` and find this line near the top:

```javascript
const WHATSAPP_NUMBER = "91XXXXXXXXXX";
```

Replace `91XXXXXXXXXX` with your full WhatsApp number including country code (no + or spaces).

Example: `const WHATSAPP_NUMBER = "919876543210";`

Also update the number in `contact.html` and any hardcoded `wa.me/` links in HTML files.

## How to Upload to GitHub

1. Create a new repository on GitHub
2. Initialize git in your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

## How to Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** > **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Select **main** branch and **/ (root)** folder
5. Click **Save**
6. Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Technologies Used

- HTML5 (semantic markup)
- CSS3 (custom properties, flexbox, grid)
- Vanilla JavaScript (no frameworks, no dependencies)
- localStorage for cart persistence
- WhatsApp click-to-chat API

## No Backend Required

- No PHP
- No MySQL/database
- No Node.js for production
- No server-side processing
- Fully static website
- Works on any static hosting (GitHub Pages, Netlify, Vercel, etc.)

## License

This project is open source and free to use.
