export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  availability: "In Stock" | "Out of Stock" | "Pre-order";
  sku: string;
  shortSpec: string;
  specifications: Record<string, string>;
  description: string;
};

export type Category = {
  name: string;
  icon: string; // string identifier for lucide-react icon
  image: string;
};

export const categories: Category[] = [
  { name: "Processors", icon: "Cpu", image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600" },
  { name: "Graphics Cards", icon: "Monitor", image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=600" },
  { name: "Motherboards", icon: "Server", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600" },
  { name: "RAM", icon: "MemoryStick", image: "https://images.unsplash.com/photo-1562976540-1502f759600a?auto=format&fit=crop&q=80&w=600" },
  { name: "Storage", icon: "HardDrive", image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=600" },
  { name: "Power Supplies", icon: "Zap", image: "https://images.unsplash.com/photo-1580828343064-fdd4eaa4c1fa?auto=format&fit=crop&q=80&w=600" },
  { name: "Monitors", icon: "Tv", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600" },
  { name: "Peripherals", icon: "Mouse", image: "https://images.unsplash.com/photo-1527814050087-379381547996?auto=format&fit=crop&q=80&w=600" },
];

export const products: Product[] = [
  // PROCESSORS
  {
    id: "p1",
    name: "Intel Core i9-14900K",
    brand: "Intel",
    price: 36500,
    category: "Processors",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviews: 124,
    availability: "In Stock",
    sku: "INT-I9-14900K",
    shortSpec: "24 Cores / 32 Threads, up to 6.0 GHz",
    specifications: { "Cores": "24 (8 P-cores + 16 E-cores)", "Threads": "32", "Socket": "LGA 1700" },
    description: "The Intel Core i9-14900K delivers incredibly fast speeds and multi-tasking capabilities."
  },
  {
    id: "p2",
    name: "AMD Ryzen 7 7800X3D",
    brand: "AMD",
    price: 23500,
    category: "Processors",
    image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviews: 210,
    availability: "In Stock",
    sku: "AMD-R7-7800X3D",
    shortSpec: "8 Cores / 16 Threads, 3D V-Cache",
    specifications: { "Cores": "8", "Threads": "16", "Socket": "AM5" },
    description: "The ultimate gaming processor, featuring AMD 3D V-Cache technology."
  },
  {
    id: "p3",
    name: "Intel Core i5-13600K",
    brand: "Intel",
    price: 18500,
    category: "Processors",
    image: "https://images.unsplash.com/photo-1628126235206-5260b9ea6441?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviews: 180,
    availability: "In Stock",
    sku: "INT-I5-13600K",
    shortSpec: "14 Cores / 20 Threads, up to 5.1 GHz",
    specifications: { "Cores": "14", "Threads": "20", "Socket": "LGA 1700" },
    description: "Excellent mid-range performance for gaming and productivity."
  },

  // GRAPHICS CARDS
  {
    id: "p4",
    name: "NVIDIA GeForce RTX 4090 Founders Edition",
    brand: "NVIDIA",
    price: 115000,
    category: "Graphics Cards",
    image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviews: 89,
    availability: "Out of Stock",
    sku: "NV-RTX4090-FE",
    shortSpec: "24GB GDDR6X, DLSS 3",
    specifications: { "VRAM": "24GB GDDR6X", "CUDA Cores": "16384", "TDP": "450W" },
    description: "The NVIDIA GeForce RTX 4090 is the ultimate GeForce GPU."
  },
  {
    id: "p5",
    name: "ASUS TUF Gaming GeForce RTX 4070 Ti",
    brand: "ASUS",
    price: 52000,
    category: "Graphics Cards",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviews: 145,
    availability: "In Stock",
    sku: "ASUS-TUF-4070TI",
    shortSpec: "12GB GDDR6X, Triple Fan",
    specifications: { "VRAM": "12GB GDDR6X", "CUDA Cores": "7680", "TDP": "285W" },
    description: "Built tough for high-end 1440p and 4K gaming."
  },
  {
    id: "p6",
    name: "Sapphire Pulse AMD Radeon RX 7900 XTX",
    brand: "AMD",
    price: 68000,
    category: "Graphics Cards",
    image: "https://images.unsplash.com/photo-1555617112-922619bb38b9?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviews: 95,
    availability: "In Stock",
    sku: "SAP-RX7900XTX",
    shortSpec: "24GB GDDR6, RDNA 3",
    specifications: { "VRAM": "24GB GDDR6", "Stream Processors": "6144", "TDP": "355W" },
    description: "Incredible rasterization performance with massive 24GB VRAM."
  },

  // MOTHERBOARDS
  {
    id: "p7",
    name: "ASUS ROG Strix X670E-E Gaming WiFi",
    brand: "ASUS",
    price: 31000,
    category: "Motherboards",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviews: 45,
    availability: "In Stock",
    sku: "ASUS-X670E-E",
    shortSpec: "AM5, DDR5, PCIe 5.0, WiFi 6E",
    specifications: { "Socket": "AM5", "Chipset": "AMD X670", "Form Factor": "ATX" },
    description: "Built for maximum performance from AMD Ryzen 7000 Series."
  },
  {
    id: "p8",
    name: "MSI MAG B650 TOMAHAWK WIFI",
    brand: "MSI",
    price: 13500,
    category: "Motherboards",
    image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviews: 120,
    availability: "In Stock",
    sku: "MSI-B650-TOMAHAWK",
    shortSpec: "AM5, DDR5, PCIe 4.0, WiFi 6E",
    specifications: { "Socket": "AM5", "Chipset": "AMD B650", "Form Factor": "ATX" },
    description: "Durable and reliable motherboard for mainstream AM5 builds."
  },
  {
    id: "p9",
    name: "Gigabyte Z790 AORUS ELITE AX",
    brand: "Gigabyte",
    price: 16500,
    category: "Motherboards",
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    reviews: 88,
    availability: "In Stock",
    sku: "GIG-Z790-AORUS",
    shortSpec: "LGA 1700, DDR5, PCIe 5.0, WiFi 6E",
    specifications: { "Socket": "LGA 1700", "Chipset": "Intel Z790", "Form Factor": "ATX" },
    description: "Feature-rich Z790 motherboard for Intel 13th and 14th gen processors."
  },

  // RAM
  {
    id: "p10",
    name: "Corsair Dominator Titanium RGB 64GB",
    brand: "Corsair",
    price: 15500,
    category: "RAM",
    image: "https://images.unsplash.com/photo-1562976540-1502f759600a?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviews: 76,
    availability: "In Stock",
    sku: "COR-DOM-64GB-6000",
    shortSpec: "2x32GB, DDR5-6000, CL30",
    specifications: { "Capacity": "64GB", "Speed": "6000 MHz", "Type": "DDR5" },
    description: "Premium DDR5 Memory with superior construction and advanced lighting."
  },
  {
    id: "p11",
    name: "G.Skill Trident Z5 RGB 32GB",
    brand: "G.Skill",
    price: 8500,
    category: "RAM",
    image: "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviews: 320,
    availability: "In Stock",
    sku: "GSK-TZ5-32GB-6400",
    shortSpec: "2x16GB, DDR5-6400, CL32",
    specifications: { "Capacity": "32GB", "Speed": "6400 MHz", "Type": "DDR5" },
    description: "High-performance overclocking DDR5 memory designed for enthusiasts."
  },
  {
    id: "p12",
    name: "Kingston FURY Beast 32GB",
    brand: "Kingston",
    price: 6800,
    category: "RAM",
    image: "https://images.unsplash.com/photo-1544654803-b69140b285a1?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviews: 215,
    availability: "In Stock",
    sku: "KIN-FURY-32GB-5600",
    shortSpec: "2x16GB, DDR5-5600, CL40",
    specifications: { "Capacity": "32GB", "Speed": "5600 MHz", "Type": "DDR5" },
    description: "Reliable and affordable DDR5 memory for next-gen setups."
  },

  // STORAGE
  {
    id: "p13",
    name: "Samsung 990 PRO 2TB NVMe SSD",
    brand: "Samsung",
    price: 10500,
    category: "Storage",
    image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviews: 312,
    availability: "In Stock",
    sku: "SAM-990PRO-2TB",
    shortSpec: "PCIe 4.0, up to 7450 MB/s",
    specifications: { "Capacity": "2TB", "Interface": "PCIe 4.0 NVMe", "Read Speed": "7450 MB/s" },
    description: "Reach maximum performance of PCIe 4.0. Experience longer-lasting, opponent-blasting speed."
  },
  {
    id: "p14",
    name: "Crucial T700 2TB Gen5 NVMe SSD",
    brand: "Crucial",
    price: 18500,
    category: "Storage",
    image: "https://images.unsplash.com/photo-1600069226367-466f2a6d7f45?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviews: 65,
    availability: "Pre-order",
    sku: "CRU-T700-2TB",
    shortSpec: "PCIe 5.0, up to 12,400 MB/s",
    specifications: { "Capacity": "2TB", "Interface": "PCIe 5.0 NVMe", "Read Speed": "12,400 MB/s" },
    description: "Next-gen storage performance with PCIe 5.0 speeds."
  },
  {
    id: "p15",
    name: "Western Digital WD_BLACK SN850X 1TB",
    brand: "Western Digital",
    price: 5500,
    category: "Storage",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviews: 420,
    availability: "In Stock",
    sku: "WD-SN850X-1TB",
    shortSpec: "PCIe 4.0, up to 7300 MB/s",
    specifications: { "Capacity": "1TB", "Interface": "PCIe 4.0 NVMe", "Read Speed": "7300 MB/s" },
    description: "High-speed storage designed specifically for hardcore gamers."
  },

  // POWER SUPPLIES
  {
    id: "p16",
    name: "Corsair RM1000x Shift",
    brand: "Corsair",
    price: 12000,
    category: "Power Supplies",
    image: "https://images.unsplash.com/photo-1580828343064-fdd4eaa4c1fa?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviews: 58,
    availability: "In Stock",
    sku: "COR-RM1000X-S",
    shortSpec: "1000W, 80 PLUS Gold, Fully Modular",
    specifications: { "Wattage": "1000W", "Efficiency": "80 PLUS Gold", "Modularity": "Fully Modular" },
    description: "Revolutionary side cable interface to keep all your connections within easy reach."
  },
  {
    id: "p17",
    name: "Seasonic FOCUS GX-850",
    brand: "Seasonic",
    price: 8500,
    category: "Power Supplies",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviews: 210,
    availability: "In Stock",
    sku: "SEA-GX850",
    shortSpec: "850W, 80 PLUS Gold, Fully Modular",
    specifications: { "Wattage": "850W", "Efficiency": "80 PLUS Gold", "Modularity": "Fully Modular" },
    description: "Rock-solid reliability and quiet operation from Seasonic."
  },
  {
    id: "p18",
    name: "EVGA SuperNOVA 1000 G6",
    brand: "EVGA",
    price: 11000,
    category: "Power Supplies",
    image: "https://images.unsplash.com/photo-1593361138402-9bc50532ff4a?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviews: 135,
    availability: "Out of Stock",
    sku: "EVGA-1000G6",
    shortSpec: "1000W, 80 PLUS Gold, Compact",
    specifications: { "Wattage": "1000W", "Efficiency": "80 PLUS Gold", "Modularity": "Fully Modular" },
    description: "Next-gen engineering for superior performance and smaller footprint."
  },

  // MONITORS
  {
    id: "p19",
    name: "LG UltraGear 27GR95QE-B",
    brand: "LG",
    price: 55000,
    category: "Monitors",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    reviews: 112,
    availability: "In Stock",
    sku: "LG-27GR95QE",
    shortSpec: "27\" OLED, 1440p, 240Hz, 0.03ms",
    specifications: { "Size": "27 Inches", "Resolution": "2560x1440", "Panel": "OLED", "Refresh": "240Hz" },
    description: "Ultra-fast 240Hz refresh rate on an OLED display, offering vibrant colors."
  },
  {
    id: "p20",
    name: "ASUS ROG Swift PG279QM",
    brand: "ASUS",
    price: 45000,
    category: "Monitors",
    image: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviews: 89,
    availability: "In Stock",
    sku: "ASUS-PG279QM",
    shortSpec: "27\" Fast IPS, 1440p, 240Hz, G-SYNC",
    specifications: { "Size": "27 Inches", "Resolution": "2560x1440", "Panel": "Fast IPS", "Refresh": "240Hz" },
    description: "Esports ready 1440p gaming monitor with hardware G-SYNC."
  },
  {
    id: "p21",
    name: "Samsung Odyssey G7",
    brand: "Samsung",
    price: 38000,
    category: "Monitors",
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviews: 310,
    availability: "In Stock",
    sku: "SAM-G7-32",
    shortSpec: "32\" VA Curved, 1440p, 240Hz",
    specifications: { "Size": "32 Inches", "Resolution": "2560x1440", "Panel": "Curved VA", "Refresh": "240Hz" },
    description: "Deeply immersive 1000R curve with lightning fast performance."
  },

  // PERIPHERALS
  {
    id: "p22",
    name: "Logitech G Pro X Superlight",
    brand: "Logitech",
    price: 8500,
    category: "Peripherals",
    image: "https://images.unsplash.com/photo-1527814050087-379381547996?auto=format&fit=crop&q=80&w=600",
    rating: 4.9,
    reviews: 540,
    availability: "In Stock",
    sku: "LOG-PRO-SUPER",
    shortSpec: "Wireless Gaming Mouse, 63g",
    specifications: { "Type": "Mouse", "Sensor": "HERO 25K", "Weight": "<63g", "Connectivity": "Lightspeed Wireless" },
    description: "Engineered to win. Designed with esports pros."
  },
  {
    id: "p23",
    name: "Razer Huntsman V2 Analog",
    brand: "Razer",
    price: 12500,
    category: "Peripherals",
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    reviews: 125,
    availability: "In Stock",
    sku: "RAZ-HUNT-V2",
    shortSpec: "Analog Optical Switches, RGB",
    specifications: { "Type": "Keyboard", "Switches": "Analog Optical", "Size": "Full Size", "Keycaps": "PBT" },
    description: "Actuation points that can be customized to your exact preference."
  },
  {
    id: "p24",
    name: "SteelSeries Arctis Nova Pro Wireless",
    brand: "SteelSeries",
    price: 19500,
    category: "Peripherals",
    image: "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviews: 210,
    availability: "In Stock",
    sku: "SS-NOVA-PRO",
    shortSpec: "Wireless Gaming Headset, ANC",
    specifications: { "Type": "Headset", "Audio": "High-Res Capable", "ANC": "Active Noise Cancellation", "Battery": "Hot-swappable" },
    description: "Almighty Audio levels up your gaming experience."
  },
  {
    id: "p25",
    name: "Logitech G304 Lightspeed",
    brand: "Logitech",
    price: 2200,
    category: "Peripherals",
    image: "https://images.unsplash.com/photo-1527814050087-379381547996?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviews: 850,
    availability: "In Stock",
    sku: "LOG-G304",
    shortSpec: "Wireless Gaming Mouse, HERO Sensor",
    specifications: { "Type": "Mouse", "Sensor": "HERO", "Battery": "Up to 250 hours" },
    description: "Next-gen wireless gaming mouse designed for serious performance at an affordable price point."
  },
  {
    id: "p26",
    name: "Kingston NV2 500GB NVMe SSD",
    brand: "Kingston",
    price: 2500,
    category: "Storage",
    image: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&q=80&w=600",
    rating: 4.6,
    reviews: 320,
    availability: "In Stock",
    sku: "KIN-NV2-500",
    shortSpec: "PCIe 4.0 NVMe, up to 3500 MB/s",
    specifications: { "Capacity": "500GB", "Interface": "PCIe 4.0 NVMe", "Read Speed": "3500 MB/s" },
    description: "Substantial storage solution that offers read/write speeds up to 3500/2100MB/s."
  },
  {
    id: "p27",
    name: "Corsair Vengeance LPX 16GB",
    brand: "Corsair",
    price: 2800,
    category: "RAM",
    image: "https://images.unsplash.com/photo-1562976540-1502f759600a?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviews: 645,
    availability: "In Stock",
    sku: "COR-VEN-16GB-3200",
    shortSpec: "2x8GB, DDR4-3200, CL16",
    specifications: { "Capacity": "16GB", "Speed": "3200 MHz", "Type": "DDR4" },
    description: "Designed for high-performance overclocking with a pure aluminum heatspreader."
  }
];

export const mockCart = [
  { product: products[0], quantity: 1 },
  { product: products[5], quantity: 2 },
];
