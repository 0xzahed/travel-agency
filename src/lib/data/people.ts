import type { AdminUser, Role, User } from "../types";
import { img } from "../utils";
import { AVATARS } from "./images";

const av = (id: string) => img(id, 200, 75);

export const CURRENT_USER_ID = "C-2001";

export const customers: User[] = [
  { id: "C-2001", name: "Alex Morgan", email: "alex.morgan@example.com", phone: "+44 7700 900123", avatar: av(AVATARS.m2), dob: "1990-04-12", nationality: "British", passport: "GB5520918", passportExpiry: "2031-08-30", address: "21 Kensington Park Rd, London W11 2EU, UK", joinedAt: "2024-02-18", status: "Active", savedTours: ["T-1002", "T-1008", "T-1010"], twoFactor: true },
  { id: "C-2002", name: "Sofia Martins", email: "sofia.martins@example.com", phone: "+351 912 345 678", avatar: av(AVATARS.w1), dob: "1993-09-02", nationality: "Portuguese", passport: "PT8812034", passportExpiry: "2029-03-11", address: "Rua Augusta 112, Lisbon, Portugal", joinedAt: "2024-06-04", status: "Active", savedTours: [], twoFactor: false },
  { id: "C-2003", name: "Daniel Kim", email: "daniel.kim@example.com", phone: "+82 10 5555 0199", avatar: av(AVATARS.m3), dob: "1987-01-21", nationality: "South Korean", passport: "M44012833", passportExpiry: "2030-11-05", address: "Gangnam-gu, Seoul, South Korea", joinedAt: "2023-11-12", status: "Active", savedTours: [], twoFactor: true },
  { id: "C-2004", name: "Amira Haddad", email: "amira.haddad@example.com", phone: "+971 50 123 4567", avatar: av(AVATARS.w2), dob: "1995-07-30", nationality: "Jordanian", passport: "N7731942", passportExpiry: "2028-02-14", address: "Jumeirah Lake Towers, Dubai, UAE", joinedAt: "2025-01-09", status: "Active", savedTours: [], twoFactor: false },
  { id: "C-2005", name: "Rahim Chowdhury", email: "rahim.c@example.com", phone: "+880 1711 223344", avatar: av(AVATARS.m1), dob: "1984-12-08", nationality: "Bangladeshi", passport: "EB0912345", passportExpiry: "2027-05-19", address: "Gulshan 2, Dhaka, Bangladesh", joinedAt: "2024-09-27", status: "Active", savedTours: [], twoFactor: false },
  { id: "C-2006", name: "Emma Schultz", email: "emma.schultz@example.com", phone: "+49 151 2345 6789", avatar: av(AVATARS.w3), dob: "1998-03-15", nationality: "German", passport: "C01X00T47", passportExpiry: "2032-10-01", address: "Prenzlauer Berg, Berlin, Germany", joinedAt: "2025-05-21", status: "Suspended", savedTours: [], twoFactor: false },
  { id: "C-2007", name: "Lucas Bennett", email: "lucas.bennett@example.com", phone: "+1 415 555 0142", dob: "1991-06-11", nationality: "American", passport: "564890123", passportExpiry: "2033-01-20", address: "Mission District, San Francisco, USA", joinedAt: "2025-08-02", status: "Active", savedTours: [], twoFactor: true },
  { id: "C-2008", name: "Priya Nair", email: "priya.nair@example.com", phone: "+91 98450 12345", dob: "1992-10-25", nationality: "Indian", passport: "Z4412098", passportExpiry: "2030-07-07", address: "Indiranagar, Bengaluru, India", joinedAt: "2026-02-14", status: "Active", savedTours: [], twoFactor: false },
  { id: "C-2009", name: "Omar Farouk", email: "omar.farouk@example.com", phone: "+20 100 555 7788", dob: "1980-02-03", nationality: "Egyptian", passport: "A22918374", passportExpiry: "2028-12-12", address: "Zamalek, Cairo, Egypt", joinedAt: "2026-04-30", status: "Active", savedTours: [], twoFactor: false },
  { id: "C-2010", name: "Chloé Laurent", email: "chloe.laurent@example.com", phone: "+33 6 12 34 56 78", dob: "1996-08-19", nationality: "French", passport: "19AV12345", passportExpiry: "2031-04-04", address: "Le Marais, Paris, France", joinedAt: "2026-07-11", status: "Active", savedTours: [], twoFactor: true },
];

export const RESOURCES = ["Tours", "Bookings", "Visa", "Customers", "Payments", "Content", "Support", "Reports", "Settings"] as const;
const all = ["View", "Create", "Edit", "Delete", "Approve", "Export"] as const;

export const roles: Role[] = [
  { id: "super-admin", name: "Super Admin", description: "Full access to every module, billing and security.", permissions: Object.fromEntries(RESOURCES.map((r) => [r, [...all]])) },
  { id: "admin", name: "Admin", description: "Manages operations; cannot change security settings.", permissions: Object.fromEntries(RESOURCES.map((r) => [r, r === "Settings" ? ["View"] : [...all]])) },
  { id: "tour-manager", name: "Tour Manager", description: "Owns tour catalogue and bookings.", permissions: { Tours: [...all], Bookings: ["View", "Edit", "Approve", "Export"], Customers: ["View"], Content: ["View", "Edit"], Reports: ["View"] } },
  { id: "visa-agent", name: "Visa Agent", description: "Reviews visa applications and documents.", permissions: { Visa: ["View", "Edit", "Approve", "Export"], Customers: ["View"], Support: ["View", "Edit"] } },
  { id: "support-agent", name: "Support Agent", description: "Handles customer messages and tickets.", permissions: { Support: ["View", "Create", "Edit"], Bookings: ["View"], Customers: ["View"], Visa: ["View"] } },
  { id: "accountant", name: "Accountant", description: "Payments, refunds and financial reports.", permissions: { Payments: ["View", "Edit", "Approve", "Export"], Reports: ["View", "Export"], Bookings: ["View"] } },
];

export const adminUsers: AdminUser[] = [
  { id: "A-1", name: "Nadia Rahman", email: "nadia@voyara.travel", avatar: av(AVATARS.w2), roleId: "super-admin", status: "Active", lastActive: "2026-10-04T08:12:00" },
  { id: "A-2", name: "James Carter", email: "james@voyara.travel", avatar: av(AVATARS.m1), roleId: "admin", status: "Active", lastActive: "2026-10-04T07:40:00" },
  { id: "A-3", name: "Mei Tanaka", email: "mei@voyara.travel", avatar: av(AVATARS.w3), roleId: "tour-manager", status: "Active", lastActive: "2026-10-03T18:02:00" },
  { id: "A-4", name: "Karim Hassan", email: "karim@voyara.travel", avatar: av(AVATARS.m3), roleId: "visa-agent", status: "Active", lastActive: "2026-10-04T09:05:00" },
  { id: "A-5", name: "Laura Gómez", email: "laura@voyara.travel", avatar: av(AVATARS.w1), roleId: "visa-agent", status: "Active", lastActive: "2026-10-03T16:44:00" },
  { id: "A-6", name: "Tom Becker", email: "tom@voyara.travel", avatar: av(AVATARS.m2), roleId: "support-agent", status: "Active", lastActive: "2026-10-04T06:58:00" },
  { id: "A-7", name: "Grace Owusu", email: "grace@voyara.travel", avatar: "", roleId: "accountant", status: "Invited", lastActive: "2026-09-30T10:00:00" },
];

export const CURRENT_ADMIN_ID = "A-1";
export const visaAgents = adminUsers.filter((a) => a.roleId === "visa-agent").map((a) => a.name);
export const supportAgents = adminUsers.filter((a) => ["support-agent", "admin"].includes(a.roleId)).map((a) => a.name);
