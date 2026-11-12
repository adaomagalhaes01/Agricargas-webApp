export interface MockCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
}

export interface MockProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  category_id: string;
  image: string;
  description: string;
  fullDescription: string;
  stock: number;
  rating: number;
  reviews: number;
  badge?: string;
  status: string;
  unit: string;
  weight: string;
  origin: string;
  supplier: string;
  supplierLocation: string;
  location: string;
}

export const mockCategories: MockCategory[] = [
  { id: "1", name: "Vegetables", icon: "leaf-outline", color: "#22C55E", bg: "#D4F4E7" },
  { id: "2", name: "Fruits", icon: "nutrition-outline", color: "#F59E0B", bg: "#FFF8E1" },
  { id: "3", name: "Cereals", icon: "grid-outline", color: "#8B5CF6", bg: "#EDE9FE" },
  { id: "4", name: "Legumes", icon: "flask-outline", color: "#3B82F6", bg: "#DBEAFE" },
];

const image = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;

export const mockProducts: MockProduct[] = [
  {
    id: "mock-1",
    name: "Fresh Tomatoes",
    price: 1200,
    category: "Vegetables",
    category_id: "1",
    image: image("1546097759-4bd817f51931"),
    description: "Juicy, sun-ripened tomatoes picked fresh from the farm.",
    fullDescription:
      "Juicy, sun-ripened tomatoes picked fresh from the farm every morning. Rich in flavor and perfect for salads, sauces and everyday cooking. Grown in Angola with careful attention to quality from harvest to delivery.",
    stock: 180,
    rating: 4.8,
    reviews: 124,
    badge: "Best Seller",
    status: "active",
    unit: "kg",
    weight: "1 kg",
    origin: "Luanda, Angola",
    supplier: "Green Farm Ltd",
    supplierLocation: "Luanda, Angola",
    location: "Luanda, Angola",
  },
  {
    id: "mock-2",
    name: "Hass Avocado",
    price: 2500,
    category: "Fruits",
    category_id: "2",
    image: image("1523049673857-eb18f1d7b578"),
    description: "Creamy Hass avocados, naturally ripened and ready to eat.",
    fullDescription:
      "Creamy Hass avocados, naturally ripened and ready to eat. Perfect for toast, salads and smoothies. Hand-selected to guarantee the ideal texture and a rich, buttery flavor.",
    stock: 95,
    rating: 4.7,
    reviews: 89,
    badge: "New",
    status: "active",
    unit: "kg",
    weight: "1 kg",
    origin: "Huambo, Angola",
    supplier: "AgroFresh Angola",
    supplierLocation: "Benguela, Angola",
    location: "Huambo, Angola",
  },
  {
    id: "mock-3",
    name: "Bananas",
    price: 1400,
    category: "Fruits",
    category_id: "2",
    image: image("1571771894821-ce9b6c11b08e"),
    description: "Sweet, energy-packed bananas from local plantations.",
    fullDescription:
      "Sweet, energy-packed bananas from local plantations. Naturally ripened, rich in potassium and ideal for breakfast, desserts or a quick snack at any time of the day.",
    stock: 320,
    rating: 4.6,
    reviews: 156,
    badge: "Best Seller",
    status: "active",
    unit: "bunch",
    weight: "1 bunch",
    origin: "Benguela, Angola",
    supplier: "Green Farm Ltd",
    supplierLocation: "Luanda, Angola",
    location: "Benguela, Angola",
  },
  {
    id: "mock-4",
    name: "Kale",
    price: 800,
    category: "Vegetables",
    category_id: "1",
    image: image("1540420773420-3366772f4999"),
    description: "Fresh organic kale with crisp, nutrient-rich leaves.",
    fullDescription:
      "Fresh organic kale with crisp, nutrient-rich leaves. Grown without harmful pesticides and harvested daily. Excellent for smoothies, salads and traditional Angolan dishes.",
    stock: 210,
    rating: 4.9,
    reviews: 67,
    badge: "Organic",
    status: "active",
    unit: "bunch",
    weight: "500 g",
    origin: "Luanda, Angola",
    supplier: "Green Farm Ltd",
    supplierLocation: "Luanda, Angola",
    location: "Luanda, Angola",
  },
  {
    id: "mock-5",
    name: "Mango",
    price: 1800,
    category: "Fruits",
    category_id: "2",
    image: image("1553279768-865429fa0078"),
    description: "Sweet, aromatic mangoes at the peak of ripeness.",
    fullDescription:
      "Sweet, aromatic mangoes at the peak of ripeness. Carefully selected for their vibrant color and tropical flavor. A refreshing treat on its own or in juices and desserts.",
    stock: 140,
    rating: 4.8,
    reviews: 98,
    badge: "10% OFF",
    status: "active",
    unit: "kg",
    weight: "1 kg",
    origin: "Benguela, Angola",
    supplier: "AgroFresh Angola",
    supplierLocation: "Benguela, Angola",
    location: "Benguela, Angola",
  },
  {
    id: "mock-6",
    name: "Pineapple",
    price: 1600,
    category: "Fruits",
    category_id: "2",
    image: image("1550258987-190a2d41a8ba"),
    description: "Tropical pineapples with a sweet and tangy flavor.",
    fullDescription:
      "Tropical pineapples with a sweet and tangy flavor. Harvested at the right moment to guarantee juiciness and freshness. Great for juices, fruit salads and grilling.",
    stock: 110,
    rating: 4.5,
    reviews: 54,
    status: "active",
    unit: "unit",
    weight: "1 unit",
    origin: "Cabinda, Angola",
    supplier: "Tropical Harvest Co.",
    supplierLocation: "Cabinda, Angola",
    location: "Cabinda, Angola",
  },
  {
    id: "mock-7",
    name: "Onions",
    price: 950,
    category: "Vegetables",
    category_id: "1",
    image: image("1508747703725-719777637510"),
    description: "Firm, full-flavored onions for everyday cooking.",
    fullDescription:
      "Firm, full-flavored onions for everyday cooking. Stored in ideal conditions to preserve their freshness and aroma. An essential ingredient in every kitchen.",
    stock: 260,
    rating: 4.4,
    reviews: 72,
    status: "active",
    unit: "kg",
    weight: "1 kg",
    origin: "Huíla, Angola",
    supplier: "Green Farm Ltd",
    supplierLocation: "Luanda, Angola",
    location: "Huíla, Angola",
  },
  {
    id: "mock-8",
    name: "Bell Peppers",
    price: 2100,
    category: "Vegetables",
    category_id: "1",
    image: image("1563565375-f3fdfdbefa83"),
    description: "Colorful bell peppers, crisp and full of vitamins.",
    fullDescription:
      "Colorful bell peppers, crisp and full of vitamins. Available in red, green and yellow varieties. Add color, crunch and flavor to salads, stir-fries and grilled dishes.",
    stock: 130,
    rating: 4.7,
    reviews: 61,
    badge: "Fresh",
    status: "active",
    unit: "kg",
    weight: "1 kg",
    origin: "Luanda, Angola",
    supplier: "AgroFresh Angola",
    supplierLocation: "Benguela, Angola",
    location: "Luanda, Angola",
  },
  {
    id: "mock-9",
    name: "White Maize",
    price: 1100,
    category: "Cereals",
    category_id: "3",
    image: image("1551754655-cd27e38d2076"),
    description: "Premium white maize, dried and ready to mill.",
    fullDescription:
      "Premium white maize, dried and ready to mill. A staple for traditional dishes such as funge. Stored in dry conditions to preserve quality and flavor.",
    stock: 400,
    rating: 4.6,
    reviews: 83,
    badge: "Best Seller",
    status: "active",
    unit: "kg",
    weight: "5 kg",
    origin: "Malanje, Angola",
    supplier: "Angola Grain Co.",
    supplierLocation: "Malanje, Angola",
    location: "Malanje, Angola",
  },
  {
    id: "mock-10",
    name: "Long Grain Rice",
    price: 3200,
    category: "Cereals",
    category_id: "3",
    image: image("1586201375761-83865001e31c"),
    description: "High-quality long grain rice with a fluffy texture.",
    fullDescription:
      "High-quality long grain rice with a fluffy texture. Carefully processed to retain its nutritional value and natural flavor. Perfect for everyday meals and special occasions.",
    stock: 275,
    rating: 4.5,
    reviews: 47,
    status: "active",
    unit: "bag",
    weight: "5 kg",
    origin: "Lunda Norte, Angola",
    supplier: "Angola Grain Co.",
    supplierLocation: "Malanje, Angola",
    location: "Lunda Norte, Angola",
  },
  {
    id: "mock-11",
    name: "Red Beans",
    price: 1700,
    category: "Legumes",
    category_id: "4",
    image: image("1551462147-37885acc36f1"),
    description: "Protein-rich red beans, sorted and cleaned.",
    fullDescription:
      "Protein-rich red beans, sorted and cleaned. A versatile ingredient for stews, rice dishes and traditional recipes. Packed with fiber and essential nutrients.",
    stock: 190,
    rating: 4.7,
    reviews: 59,
    badge: "Organic",
    status: "active",
    unit: "kg",
    weight: "1 kg",
    origin: "Huambo, Angola",
    supplier: "Angola Grain Co.",
    supplierLocation: "Malanje, Angola",
    location: "Huambo, Angola",
  },
  {
    id: "mock-12",
    name: "Peanuts",
    price: 2200,
    category: "Legumes",
    category_id: "4",
    image: image("1567892737950-30c4db37cd89"),
    description: "Crunchy, naturally roasted peanuts rich in protein.",
    fullDescription:
      "Crunchy, naturally roasted peanuts rich in protein and healthy fats. Ideal for snacks, sauces and traditional dishes. Sorted and packed with care to preserve freshness.",
    stock: 165,
    rating: 4.8,
    reviews: 76,
    status: "active",
    unit: "kg",
    weight: "1 kg",
    origin: "Bié, Angola",
    supplier: "Tropical Harvest Co.",
    supplierLocation: "Cabinda, Angola",
    location: "Bié, Angola",
  },
  {
    id: "mock-13",
    name: "Soybeans",
    price: 1950,
    category: "Legumes",
    category_id: "4",
    image: image("1599940824399-b87987ceb72a"),
    description: "High-protein soybeans for healthy meals.",
    fullDescription:
      "High-protein soybeans for healthy meals. Carefully selected and dried to ensure long shelf life and consistent quality. A great plant-based source of protein.",
    stock: 120,
    rating: 4.4,
    reviews: 33,
    badge: "New",
    status: "active",
    unit: "kg",
    weight: "1 kg",
    origin: "Cuando Cubango, Angola",
    supplier: "AgroFresh Angola",
    supplierLocation: "Benguela, Angola",
    location: "Cuando Cubango, Angola",
  },
];
