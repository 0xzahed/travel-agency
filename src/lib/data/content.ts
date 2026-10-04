import type { Banner, BlogPost, FAQ, Review } from "../types";
import { img } from "../utils";
import { AVATARS, IMG } from "./images";

const av = (id: string) => img(id, 160, 75);

export const reviews: Review[] = [
  { id: "R-1", name: "Sofia Martins", country: "Portugal", avatar: av(AVATARS.w1), rating: 5, text: "Every transfer was on time, every hotel was better than the photos, and when our flight was delayed the team rebooked our seaplane before we'd even landed. Genuinely effortless.", trip: "Maldives Overwater Retreat", date: "2026-08-14", published: true },
  { id: "R-2", name: "Daniel Kim", country: "South Korea", avatar: av(AVATARS.m3), rating: 5, text: "The Japan Golden Route was paced perfectly. Our Kyoto guide was outstanding and the ryokan night was the highlight of the year.", trip: "Japan Golden Route", date: "2026-05-02", published: true },
  { id: "R-3", name: "Amira Haddad", country: "Jordan", avatar: av(AVATARS.w2), rating: 5, text: "I used Voyara for my Schengen visa and a Paris tour. Clear checklist, quick replies and real-time tracking — no stress at all.", trip: "Classic Europe: Paris & Swiss Alps", date: "2026-07-21", published: true },
  { id: "R-4", name: "Rahim Chowdhury", country: "Bangladesh", avatar: av(AVATARS.m1), rating: 4, text: "Great family trip to Dubai. Kids loved Aquaventure. Would have liked a slightly later checkout on the last day, but support sorted it quickly.", trip: "Dubai Family Fun Break", date: "2026-04-11", published: true },
  { id: "R-5", name: "Emma Schultz", country: "Germany", avatar: av(AVATARS.w3), rating: 5, text: "The balloon flight over Cappadocia was magical and the cave hotel was stunning. Istanbul guide knew every corner.", trip: "Cappadocia & Istanbul Discovery", date: "2026-06-09", published: true },
  { id: "R-6", name: "Alex Morgan", country: "United Kingdom", avatar: av(AVATARS.m2), rating: 5, text: "Island hopping without the hassle. Speedboats, hotels and the cooking class were all superbly organised.", trip: "Thailand Island Hopper", date: "2026-03-17", published: true },
];

const body = (topic: string) => [
  `Planning a trip around ${topic} doesn't need to be complicated. After helping more than 25,000 travellers, our specialists have distilled what actually matters into a short, practical guide.`,
  "## Start with the season, not the flight",
  "The single biggest factor in how a trip feels is when you go. Shoulder seasons — the weeks just before and after peak — usually bring softer prices, thinner crowds and weather that is still reliably good.",
  "> The best itineraries leave space. Plan two anchor experiences a day at most, and let the rest happen.",
  "## Documents first",
  "Check passport validity (most countries require six months beyond your return date), visa rules for every nationality in your party, and whether children travelling with one parent need a consent letter.",
  "- Scan your passport and store a copy in your Voyara dashboard",
  "- Buy travel insurance at the time of booking, not just before departure",
  "- Save your embassy's emergency number offline",
  "## Budget with intent",
  "Decide where you want to splurge — a suite with a view, a private guide, a once-in-a-lifetime dinner — and economise elsewhere. Packages often include transfers and entrance fees, which quietly add up when booked individually.",
  "### Our planners' quick checklist",
  "- Confirm transfer times 48 hours before departure",
  "- Download offline maps",
  "- Carry a small amount of local currency for tips",
  "Whatever you're planning, our team is available 24/7 to help shape the details.",
];

export const blogPosts: BlogPost[] = [
  { id: "B-1", slug: "schengen-visa-checklist-2026", title: "The Complete Schengen Visa Checklist for 2026", excerpt: "Every document you need, the new ETIAS timeline and how to avoid the most common rejection reasons.", category: "Visa Guide", image: IMG.parisStreet, author: { name: "Karim Hassan", avatar: av(AVATARS.m3), role: "Senior Visa Consultant" }, date: "2026-09-28", readTime: 8, content: body("a Schengen visa"), published: true },
  { id: "B-2", slug: "best-time-to-visit-maldives", title: "When Is the Best Time to Visit the Maldives?", excerpt: "Dry season, manta season and the shoulder months that offer the best value for overwater villas.", category: "Destinations", image: IMG.maldivesVillas, author: { name: "Mei Tanaka", avatar: av(AVATARS.w3), role: "Destination Specialist" }, date: "2026-09-15", readTime: 6, content: body("the Maldives"), published: true },
  { id: "B-3", slug: "carry-on-packing-guide", title: "How to Pack for Two Weeks in a Carry-On", excerpt: "A capsule wardrobe formula, the toiletries rule and the packing cubes our team actually uses.", category: "Travel Tips", image: IMG.alleyBackpack, author: { name: "Laura Gómez", avatar: av(AVATARS.w1), role: "Travel Writer" }, date: "2026-09-02", readTime: 5, content: body("carry-on travel"), published: true },
  { id: "B-4", slug: "solo-travel-safety", title: "Solo Travel Safety: 12 Habits of Experienced Travellers", excerpt: "Practical, non-alarmist habits that keep you safe while still saying yes to adventure.", category: "Travel Safety", image: IMG.backpacker, author: { name: "Tom Becker", avatar: av(AVATARS.m2), role: "Customer Experience Lead" }, date: "2026-08-20", readTime: 7, content: body("solo travel"), published: true },
  { id: "B-5", slug: "bali-on-a-budget", title: "Bali on a Budget Without Missing the Magic", excerpt: "Where to stay, eat and explore in Bali for under $80 a day — without compromising on experience.", category: "Budget Travel", image: IMG.baliRice, author: { name: "Mei Tanaka", avatar: av(AVATARS.w3), role: "Destination Specialist" }, date: "2026-08-04", readTime: 6, content: body("Bali"), published: true },
  { id: "B-6", slug: "cave-hotels-cappadocia", title: "The Most Beautiful Cave Hotels in Cappadocia", excerpt: "From restored Greek mansions to minimalist suites carved into the rock — our five favourites.", category: "Hotels", image: IMG.cappadociaTravelers, author: { name: "James Carter", avatar: av(AVATARS.m1), role: "Product Director" }, date: "2026-07-22", readTime: 4, content: body("Cappadocia"), published: true },
  { id: "B-7", slug: "uae-visa-changes", title: "UAE Expands Visa-on-Arrival: What Changes for You", excerpt: "New nationalities qualify from November. Here's who benefits and what the fees look like.", category: "News", image: IMG.dubaiSkyline, author: { name: "Karim Hassan", avatar: av(AVATARS.m3), role: "Senior Visa Consultant" }, date: "2026-07-10", readTime: 3, content: body("the UAE"), published: true },
  { id: "B-8", slug: "swiss-rail-guide", title: "A First-Timer's Guide to Swiss Scenic Trains", excerpt: "Glacier Express, Bernina and GoldenPass: which route, which class and which side to sit on.", category: "Destinations", image: IMG.switzerland, author: { name: "Laura Gómez", avatar: av(AVATARS.w1), role: "Travel Writer" }, date: "2026-06-28", readTime: 7, content: body("Swiss rail travel"), published: true },
  { id: "B-9", slug: "boutique-hotels-santorini", title: "Boutique Hotels in Santorini With Caldera Views", excerpt: "Our editors' shortlist of design-led stays in Oia, Imerovigli and Firostefani.", category: "Hotels", image: IMG.santoriniView, author: { name: "Mei Tanaka", avatar: av(AVATARS.w3), role: "Destination Specialist" }, date: "2026-06-12", readTime: 5, content: body("Santorini"), published: false },
];

export const faqs: FAQ[] = [
  { id: "F-1", category: "Booking", q: "How do I book a tour?", a: "Choose a tour, pick your travel date and number of travellers, add any extras, then enter traveller details and pay securely. You'll receive an instant confirmation and your booking appears in your dashboard." },
  { id: "F-2", category: "Booking", q: "Can I cancel my booking?", a: "Yes. Most tours offer free cancellation up to 30 days before departure, 50% refund between 29 and 14 days, and no refund within 13 days. Each tour shows its exact policy before you pay, and you can cancel directly from your dashboard." },
  { id: "F-3", category: "Visa", q: "How does visa assistance work?", a: "Select your destination and visa type, upload your documents and pay the service fee. A dedicated visa agent reviews everything within 24 hours, lodges your application and keeps you updated through live tracking." },
  { id: "F-4", category: "Visa", q: "What documents are required?", a: "Typically a passport valid for 6+ months, a recent photograph, bank statements and proof of travel. Each country page lists its exact requirements, and our agents will flag anything missing before submission." },
  { id: "F-5", category: "Tours", q: "Can I customize a package?", a: "Absolutely. Use ‘Plan My Trip’ or contact our specialists to adjust hotels, add nights, switch to private guides or combine destinations." },
  { id: "F-6", category: "Tours", q: "Do you provide travel insurance?", a: "Yes. Comprehensive cover including medical, cancellation and baggage can be added during booking from $39 per traveller." },
];

export const banners: Banner[] = [
  { id: "BN-1", title: "Early-bird Europe 2027", subtitle: "Save up to 20% on spring departures booked before 30 Nov.", cta: "View Europe tours", active: true, placement: "Homepage" },
  { id: "BN-2", title: "Visa in 72 hours", subtitle: "Express UAE & Malaysia visas for urgent travel.", cta: "Apply now", active: true, placement: "Visa" },
  { id: "BN-3", title: "Honeymoon collection", subtitle: "Complimentary spa ritual on all honeymoon packages.", cta: "Explore", active: false, placement: "Tours" },
];

export const team = [
  { name: "Nadia Rahman", role: "Founder & CEO", avatar: img(AVATARS.w2, 400) },
  { name: "James Carter", role: "Product Director", avatar: img(AVATARS.m1, 400) },
  { name: "Mei Tanaka", role: "Head of Destinations", avatar: img(AVATARS.w3, 400) },
  { name: "Karim Hassan", role: "Head of Visa Services", avatar: img(AVATARS.m3, 400) },
];

export const company = {
  name: "Voyara",
  legal: "Voyara Travel Ltd.",
  phone: "+44 20 7946 0958",
  whatsapp: "+44 7700 900 456",
  email: "hello@voyara.travel",
  support: "support@voyara.travel",
  address: "18 Finsbury Square, London EC2A 1AH, United Kingdom",
  hours: "Mon–Fri 08:00–20:00 · Sat 09:00–17:00 (GMT)",
};
