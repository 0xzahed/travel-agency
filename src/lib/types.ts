export type TourType =
  | "Adventure"
  | "Family"
  | "Honeymoon"
  | "Luxury"
  | "Religious"
  | "Cultural"
  | "Beach"
  | "City Tour";

export type Region = "Asia" | "Europe" | "Middle East" | "Africa";

export interface Destination {
  id: string;
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  region: Region;
  description: string;
  image: string;
  fromPrice: number;
  tourCount: number;
  featured: boolean;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: ("Breakfast" | "Lunch" | "Dinner")[];
  accommodation?: string;
  image?: string;
}

export type TourStatus = "published" | "draft";

export interface Tour {
  id: string;
  slug: string;
  title: string;
  destinationId: string;
  country: string;
  location: string;
  type: TourType;
  days: number;
  nights: number;
  groupSize: number;
  minTravelers: number;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  requirements: string[];
  cancellationPolicy: string[];
  meetingPoint: string;
  itinerary: ItineraryDay[];
  bookings: number;
  status: TourStatus;
  featured: boolean;
  createdAt: string;
}

export type BookingStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending" | "Refunded" | "Failed" | "Partially Refunded";

export interface Traveler {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  passport: string;
  nationality: string;
  dob: string;
  type: "Adult" | "Child" | "Infant";
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  per: "booking" | "person";
}

export interface TimelineEvent {
  id: string;
  label: string;
  at: string;
  by?: string;
  note?: string;
}

export interface Booking {
  id: string;
  tourId: string;
  customerId: string;
  date: string;
  adults: number;
  children: number;
  infants: number;
  addOns: string[];
  travelers: Traveler[];
  subtotal: number;
  addOnsTotal: number;
  taxes: number;
  total: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  createdAt: string;
  timeline: TimelineEvent[];
  notes: { id: string; author: string; text: string; at: string }[];
}

export type VisaType = "Tourist" | "Business" | "Student" | "Transit";

export type VisaStatus =
  | "Submitted"
  | "Under Review"
  | "Documents Required"
  | "Processing"
  | "Approved"
  | "Rejected"
  | "Completed";

export interface VisaCountry {
  id: string;
  name: string;
  code: string;
  types: VisaType[];
  processing: string;
  fromPrice: number;
  validity: string;
  requirements: string[];
  popular: boolean;
}

export type DocStatus = "Pending" | "Verified" | "Rejected" | "Re-upload Requested";

export interface VisaDocument {
  id: string;
  kind: "Passport" | "Photograph" | "Bank Statement" | "NID" | "Invitation Letter" | "Other";
  fileName: string;
  size: string;
  uploadedAt: string;
  status: DocStatus;
  note?: string;
}

export interface VisaApplication {
  id: string;
  customerId: string;
  countryId: string;
  type: VisaType;
  applicant: {
    fullName: string;
    email: string;
    phone: string;
    passport: string;
    passportExpiry: string;
    nationality: string;
    dob: string;
    occupation: string;
  };
  travel: {
    entryDate: string;
    exitDate: string;
    purpose: string;
    accommodation: string;
  };
  documents: VisaDocument[];
  status: VisaStatus;
  submittedAt: string;
  assignedAgent?: string;
  fee: number;
  timeline: TimelineEvent[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  dob: string;
  nationality: string;
  passport: string;
  passportExpiry: string;
  address: string;
  joinedAt: string;
  status: "Active" | "Suspended";
  savedTours: string[];
  twoFactor: boolean;
}

export interface CustomerDocument {
  id: string;
  customerId: string;
  category: "Passport" | "Visa" | "Tickets" | "Invoices" | "Travel Insurance";
  fileName: string;
  size: string;
  uploadedAt: string;
  status: "Verified" | "Pending" | "Expired";
}

export interface Payment {
  id: string;
  customerId: string;
  bookingId?: string;
  visaId?: string;
  amount: number;
  method: "Visa •••• 4242" | "Mastercard •••• 8812" | "PayPal" | "Bank Transfer" | "Apple Pay";
  date: string;
  status: "Completed" | "Pending" | "Refunded" | "Failed";
  kind: "Payment" | "Refund";
}

export interface Review {
  id: string;
  name: string;
  country: string;
  avatar: string;
  rating: number;
  text: string;
  trip: string;
  date: string;
  published: boolean;
}

export type BlogCategory =
  | "Travel Tips"
  | "Visa Guide"
  | "Destinations"
  | "Travel Safety"
  | "Budget Travel"
  | "Hotels"
  | "News";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  image: string;
  author: { name: string; avatar: string; role: string };
  date: string;
  readTime: number;
  content: string[];
  published: boolean;
}

export type TicketStatus = "Open" | "In Progress" | "Waiting" | "Resolved" | "Closed";
export type Priority = "Low" | "Medium" | "High" | "Urgent";

export interface TicketMessage {
  id: string;
  from: "customer" | "agent";
  author: string;
  text: string;
  at: string;
  attachment?: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  category: "Booking" | "Visa" | "Payment" | "Account" | "General";
  priority: Priority;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  relatedId?: string;
  messages: TicketMessage[];
}

export interface Notification {
  id: string;
  audience: "admin" | "customer";
  kind: "booking" | "visa" | "payment" | "support" | "cancellation" | "system";
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
}

export type Permission = "View" | "Create" | "Edit" | "Delete" | "Approve" | "Export";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, Permission[]>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roleId: string;
  status: "Active" | "Invited" | "Disabled";
  lastActive: string;
}

export interface FAQ {
  id: string;
  q: string;
  a: string;
  category: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  active: boolean;
  placement: "Homepage" | "Tours" | "Visa";
}
