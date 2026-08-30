const products = [
  {
    id: 1,
    name: "AeroXshine Toilet Cleaner",
    category: "Bathroom & Toilet Cleaning",
    packSize: "Add Pack Size",
    price: null,
    image: "assets/products/5.jpg",
    description: "Powerful toilet cleaner that removes tough stains and kills 99.9% germs. Leaves your bathroom clean, fresh and hygienic.",
    available: true,
    features: ["Kills 99.9% Germs", "Tough on Stains", "Fresh Fragrance"]
  },
  {
    id: 2,
    name: "AeroXshine Glass Cleaner",
    category: "Glass & Surface Cleaning",
    packSize: "Add Pack Size",
    price: null,
    image: "assets/products/3.jpg",
    description: "Streak-free glass cleaner for windows, mirrors and glass surfaces. Provides a crystal-clear shine without residue.",
    available: true,
    features: ["Streak-Free Shine", "Quick Drying", "Ammonia Free"]
  },
  {
    id: 3,
    name: "AeroXshine Rose Handwash",
    category: "Hand Hygiene",
    packSize: "Add Pack Size",
    price: null,
    image: "assets/products/1.jpg",
    description: "Gentle rose-scented handwash that effectively removes dirt and germs. Keeps hands soft, fresh and protected.",
    available: true,
    features: ["Rose Fragrance", "Kills Germs", "Skin Friendly"]
  },
  {
    id: 4,
    name: "AeroXshine Dishwash Liquid",
    category: "Kitchen Cleaning",
    packSize: "Add Pack Size",
    price: null,
    image: "assets/products/4.jpg",
    description: "Concentrated dishwash liquid that cuts through tough grease and food stains. Safe for all types of utensils.",
    available: true,
    features: ["Tough on Grease", "Gentle on Hands", "Concentrated Formula"]
  },
  {
    id: 5,
    name: "AeroXshine Floor Cleaner",
    category: "Floor Cleaning",
    packSize: "Add Pack Size",
    price: null,
    image: "assets/products/2.jpg",
    description: "Professional floor cleaning solution for all types of flooring. Removes dirt, germs and leaves a fresh fragrance.",
    available: true,
    features: ["Kills 99.9% Germs", "All Floor Types", "Long-Lasting Freshness"]
  },
  {
    id: 6,
    name: "AeroXshine Phenyl",
    category: "Floor & Surface Disinfection",
    packSize: "Add Pack Size",
    price: null,
    image: "assets/products/6.jpg",
    description: "Traditional phenyl disinfectant for floors and surfaces. Provides powerful germ protection and a clean, fresh smell.",
    available: true,
    features: ["99.9% Germ Protection", "Disinfectant", "Classic Fragrance"]
  },
  {
    id: 7,
    name: "AeroXshine Glass Cleaner",
    category: "Glass & Surface Cleaning",
    packSize: "5L",
    price: null,
    image: "assets/products/7.png",
    description: "Glass, mirrors, windows aur car glass ki cleaning ke liye powerful glass cleaner. Dust, fingerprints, grease aur stains ko remove karke surface ko clean aur shiny banata hai.",
    available: true,
    features: ["Streak-Free Shine", "Multi-Surface", "Powerful Formula"]
  },
  {
    id: 8,
    name: "AeroXshine Dishwash Liquid – Lemon Fresh",
    category: "Kitchen Cleaning",
    packSize: "5L",
    price: null,
    image: "assets/products/8.png",
    description: "Plates, dishes, glasses aur kitchen utensils se tough grease aur food residue remove karne ke liye. Lemon-fresh fragrance ke saath effective dish cleaning.",
    available: true,
    features: ["Tough on Grease", "Lemon Fresh", "Gentle on Hands"]
  },
  {
    id: 9,
    name: "AeroXshine White Phenyl",
    category: "Floor & Surface Disinfection",
    packSize: "5L",
    price: null,
    image: "assets/products/9.png",
    description: "Floors, bathrooms aur hard surfaces ki daily cleaning ke liye disinfectant floor cleaner. Cleaning ke saath fresh fragrance provide karta hai.",
    available: true,
    features: ["Disinfectant", "Fresh Fragrance", "Daily Use"]
  },
  {
    id: 10,
    name: "AeroXshine Laisol – Citrus Fresh",
    category: "Floor & Surface Disinfection",
    packSize: "5L",
    price: null,
    image: "assets/products/10.png",
    description: "Floors aur hard surfaces ke liye multi-purpose disinfectant cleaner. Dirt aur germs ko remove karne mein help karta hai aur citrus-fresh fragrance deta hai.",
    available: true,
    features: ["Multi-Purpose", "Citrus Fresh", "Kills Germs"]
  },
  {
    id: 11,
    name: "AeroXshine Rose Phenyl",
    category: "Floor & Surface Disinfection",
    packSize: "5L",
    price: null,
    image: "assets/products/11.png",
    description: "Floors, bathrooms aur hard surfaces ke liye disinfectant floor cleaner. Rose fragrance ke saath cleaning aur fresh-smelling spaces ke liye suitable.",
    available: true,
    features: ["Rose Fragrance", "Disinfectant", "Fresh Spaces"]
  }
];

const CATEGORIES = [
  "Bathroom & Toilet Cleaning",
  "Glass & Surface Cleaning",
  "Hand Hygiene",
  "Kitchen Cleaning",
  "Floor Cleaning",
  "Floor & Surface Disinfection"
];

/* ===== FIRESTORE PRODUCT LOADING ===== */
var FirestoreProductsLoaded = false;

function loadProductsFromFirestore() {
  if (typeof FirebaseServicesReady === "undefined" || !FirebaseServicesReady || typeof db === "undefined" || !db) {
    return Promise.resolve(false);
  }

  return db.collection("products").where("available", "==", true).get()
    .then(function(snap) {
      if (snap.empty) return false;
      var firestoreProducts = [];
      snap.forEach(function(doc) {
        var d = doc.data();
        firestoreProducts.push({
          id: parseInt(doc.id) || doc.id,
          name: d.name || "",
          category: d.category || "",
          packSize: d.packSize || "Standard",
          price: d.price || null,
          discountPrice: d.discountPrice || null,
          image: d.image || "",
          description: d.description || "",
          available: d.available !== false,
          features: d.features || [],
          sku: d.sku || ""
        });
      });
      if (firestoreProducts.length > 0) {
        products.length = 0;
        firestoreProducts.forEach(function(p) { products.push(p); });
        FirestoreProductsLoaded = true;
        return true;
      }
      return false;
    })
    .catch(function(err) {
      console.warn("Firestore product load failed, using local data:", err);
      return false;
    });
}
