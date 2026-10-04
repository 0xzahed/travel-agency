import type { Destination } from "../types";
import { IMG } from "./images";

export const destinations: Destination[] = [
  { id: "d-maldives", slug: "maldives", name: "Maldives", country: "Maldives", countryCode: "mv", region: "Asia", description: "Overwater villas, coral reefs and the clearest water on earth.", image: IMG.maldivesAerial, fromPrice: 1490, tourCount: 6, featured: true },
  { id: "d-dubai", slug: "dubai", name: "Dubai", country: "United Arab Emirates", countryCode: "ae", region: "Middle East", description: "Skyline icons, desert safaris and world-class hospitality.", image: IMG.dubaiBurj, fromPrice: 899, tourCount: 9, featured: true },
  { id: "d-thailand", slug: "thailand", name: "Thailand", country: "Thailand", countryCode: "th", region: "Asia", description: "Island hopping, golden temples and legendary street food.", image: IMG.thailandBoats, fromPrice: 690, tourCount: 11, featured: true },
  { id: "d-bali", slug: "bali", name: "Bali", country: "Indonesia", countryCode: "id", region: "Asia", description: "Rice terraces, cliffside temples and slow tropical mornings.", image: IMG.baliTemple, fromPrice: 780, tourCount: 8, featured: true },
  { id: "d-singapore", slug: "singapore", name: "Singapore", country: "Singapore", countryCode: "sg", region: "Asia", description: "A garden city of future-forward design and hawker classics.", image: IMG.singapore, fromPrice: 950, tourCount: 5, featured: true },
  { id: "d-turkey", slug: "turkey", name: "Turkey", country: "Türkiye", countryCode: "tr", region: "Europe", description: "Balloon sunrises in Cappadocia and Istanbul's layered history.", image: IMG.cappadocia, fromPrice: 840, tourCount: 7, featured: true },
  { id: "d-malaysia", slug: "malaysia", name: "Malaysia", country: "Malaysia", countryCode: "my", region: "Asia", description: "Twin towers, rainforest highlands and Langkawi beaches.", image: IMG.kualaLumpur, fromPrice: 620, tourCount: 6, featured: true },
  { id: "d-europe", slug: "europe", name: "Europe", country: "Multi-country", countryCode: "eu", region: "Europe", description: "Paris, the Swiss Alps and the Greek islands in one journey.", image: IMG.paris, fromPrice: 1890, tourCount: 12, featured: true },
  { id: "d-japan", slug: "japan", name: "Japan", country: "Japan", countryCode: "jp", region: "Asia", description: "Ancient Kyoto lanes and neon Tokyo nights.", image: IMG.kyoto, fromPrice: 1650, tourCount: 4, featured: false },
  { id: "d-egypt", slug: "egypt", name: "Egypt", country: "Egypt", countryCode: "eg", region: "Africa", description: "Pyramids, the Nile and 5,000 years of story.", image: IMG.egypt, fromPrice: 980, tourCount: 3, featured: false },
  { id: "d-kenya", slug: "kenya", name: "Kenya", country: "Kenya", countryCode: "ke", region: "Africa", description: "Big Five safaris across the Maasai Mara.", image: IMG.kenya, fromPrice: 2150, tourCount: 3, featured: false },
  { id: "d-greece", slug: "greece", name: "Greece", country: "Greece", countryCode: "gr", region: "Europe", description: "Whitewashed villages above the deep-blue Aegean.", image: IMG.santorini, fromPrice: 1180, tourCount: 5, featured: false },
];
