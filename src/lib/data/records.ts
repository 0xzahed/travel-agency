import type {
  Booking,
  BookingStatus,
  CustomerDocument,
  Notification,
  Payment,
  PaymentStatus,
  SupportTicket,
  VisaApplication,
  VisaStatus,
  VisaType,
} from "../types";
import { quote } from "../pricing";
import { customers } from "./people";
import { tours } from "./tours";
import { visaCountries } from "./visa";

// Deterministic PRNG so server and client render identical seed data.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const rand = rng(42);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const iso = (y: number, m: number, d: number, h = 10, min = 0) =>
  new Date(Date.UTC(y, m - 1, d, h, min)).toISOString();

const methods: Payment["method"][] = ["Visa •••• 4242", "Mastercard •••• 8812", "PayPal", "Bank Transfer", "Apple Pay"];
const firstNames = ["Liam", "Olivia", "Noah", "Ava", "Ethan", "Mia", "Lucas", "Zara", "Yusuf", "Hana"];

function mkBooking(
  n: number,
  tourId: string,
  customerId: string,
  date: string,
  createdAt: string,
  status: BookingStatus,
  paymentStatus: PaymentStatus,
  adults: number,
  children = 0,
  addOnIds: string[] = [],
): Booking {
  const tour = tours.find((t) => t.id === tourId)!;
  const cust = customers.find((c) => c.id === customerId)!;
  const q = quote(tour, adults, children, 0, addOnIds);
  const [first, ...rest] = cust.name.split(" ");
  const travelers = [
    { id: `${n}-t1`, firstName: first, lastName: rest.join(" "), email: cust.email, phone: cust.phone, passport: cust.passport, nationality: cust.nationality, dob: cust.dob, type: "Adult" as const },
    ...Array.from({ length: adults - 1 + children }, (_, i) => ({
      id: `${n}-t${i + 2}`,
      firstName: firstNames[(n + i) % firstNames.length],
      lastName: rest.join(" "),
      passport: `P${(n * 7919 + i * 104729) % 9000000 + 1000000}`,
      nationality: cust.nationality,
      dob: i < adults - 1 ? "1991-05-10" : "2016-08-22",
      type: (i < adults - 1 ? "Adult" : "Child") as "Adult" | "Child",
    })),
  ];
  const timeline = [
    { id: `${n}-e1`, label: "Booking created", at: createdAt, by: cust.name },
    ...(paymentStatus !== "Pending" ? [{ id: `${n}-e2`, label: "Payment received", at: createdAt, by: "System" }] : []),
    ...(status === "Confirmed" || status === "Completed" ? [{ id: `${n}-e3`, label: "Booking confirmed", at: createdAt, by: "Mei Tanaka" }] : []),
    ...(status === "Completed" ? [{ id: `${n}-e4`, label: "Trip completed", at: date, by: "System" }] : []),
    ...(status === "Cancelled" ? [{ id: `${n}-e5`, label: "Booking cancelled", at: createdAt, by: cust.name }] : []),
  ];
  return {
    id: `TRV-2026-${String(1000 + n).padStart(6, "0")}`,
    tourId,
    customerId,
    date,
    adults,
    children,
    infants: 0,
    addOns: addOnIds,
    travelers,
    ...q,
    status,
    paymentStatus,
    paymentMethod: pick(methods),
    createdAt,
    timeline,
    notes: [],
  };
}

const alexBookings: Booking[] = [
  mkBooking(201, "T-1001", "C-2001", "2026-11-24", iso(2026, 8, 30, 14, 20), "Confirmed", "Paid", 2, 0, ["airport-transfer", "insurance"]),
  mkBooking(202, "T-1004", "C-2001", "2027-01-12", iso(2026, 9, 28, 9, 5), "Pending", "Pending", 2, 1, ["insurance"]),
  mkBooking(203, "T-1003", "C-2001", "2026-03-08", iso(2026, 1, 15, 11, 0), "Completed", "Paid", 2),
  mkBooking(204, "T-1006", "C-2001", "2026-06-14", iso(2026, 4, 2, 16, 30), "Cancelled", "Refunded", 2, 2),
];

const statuses: [BookingStatus, PaymentStatus][] = [
  ["Confirmed", "Paid"],
  ["Confirmed", "Paid"],
  ["Confirmed", "Paid"],
  ["Pending", "Pending"],
  ["Completed", "Paid"],
  ["Completed", "Paid"],
  ["Cancelled", "Refunded"],
];

const generated: Booking[] = Array.from({ length: 44 }, (_, i) => {
  const tour = pick(tours.filter((t) => t.status === "published"));
  const cust = pick(customers.slice(1));
  const [status, pay] = pick(statuses);
  const month = 1 + Math.floor(rand() * 9);
  const day = 1 + Math.floor(rand() * 27);
  const created = iso(2026, month, day, 8 + Math.floor(rand() * 10), Math.floor(rand() * 59));
  const travelMonth = status === "Completed" ? Math.min(month + 1, 9) : month + 2;
  const travelDate = new Date(Date.UTC(2026, travelMonth - 1, Math.min(day + 5, 28))).toISOString().slice(0, 10);
  return mkBooking(300 + i, tour.id, cust.id, travelDate, created, status, pay, 1 + Math.floor(rand() * 3), rand() > 0.7 ? 1 : 0, rand() > 0.5 ? ["insurance"] : []);
});

export const bookings: Booking[] = [...alexBookings, ...generated].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

// ── Visa applications ──────────────────────────────────────────────
function mkVisa(
  n: number,
  customerId: string,
  countryId: string,
  type: VisaType,
  status: VisaStatus,
  submittedAt: string,
  agent?: string,
): VisaApplication {
  const c = customers.find((x) => x.id === customerId)!;
  const country = visaCountries.find((x) => x.id === countryId)!;
  const docStatus = (k: number) =>
    status === "Submitted" ? "Pending" : status === "Documents Required" && k === 2 ? "Re-upload Requested" : status === "Under Review" && k > 1 ? "Pending" : "Verified";
  const slug = c.name.split(" ")[1].toLowerCase();
  return {
    id: `VISA-2026-${String(n).padStart(5, "0")}`,
    customerId,
    countryId,
    type,
    applicant: { fullName: c.name, email: c.email, phone: c.phone, passport: c.passport, passportExpiry: c.passportExpiry, nationality: c.nationality, dob: c.dob, occupation: "Product Designer" },
    travel: { entryDate: "2026-11-24", exitDate: "2026-11-28", purpose: "Tourism", accommodation: "Address Downtown, Dubai" },
    documents: [
      { id: `${n}-d1`, kind: "Passport", fileName: `passport_${slug}.pdf`, size: "1.2 MB", uploadedAt: submittedAt, status: docStatus(0) },
      { id: `${n}-d2`, kind: "Photograph", fileName: `photo_${slug}.jpg`, size: "340 KB", uploadedAt: submittedAt, status: docStatus(1) },
      { id: `${n}-d3`, kind: "Bank Statement", fileName: `bank_statement_6m.pdf`, size: "2.8 MB", uploadedAt: submittedAt, status: docStatus(2), note: status === "Documents Required" ? "Statement must cover the last 6 months and be bank-stamped." : undefined },
    ],
    status,
    submittedAt,
    assignedAgent: agent,
    fee: country.fromPrice,
    timeline: [
      { id: `${n}-v1`, label: "Application submitted", at: submittedAt, by: c.name },
      ...(status !== "Submitted" ? [{ id: `${n}-v2`, label: `Assigned to ${agent ?? "Visa desk"}`, at: submittedAt, by: "System" }] : []),
      ...(status === "Documents Required" ? [{ id: `${n}-v3`, label: "Additional document requested", at: submittedAt, by: agent }] : []),
      ...(["Processing", "Approved", "Completed"].includes(status) ? [{ id: `${n}-v4`, label: "Documents verified", at: submittedAt, by: agent }] : []),
      ...(["Approved", "Completed"].includes(status) ? [{ id: `${n}-v5`, label: "Visa approved", at: submittedAt, by: agent }] : []),
    ],
  };
}

export const visaApplications: VisaApplication[] = [
  mkVisa(452, "C-2001", "uae", "Tourist", "Processing", iso(2026, 9, 21, 10, 40), "Karim Hassan"),
  mkVisa(398, "C-2001", "turkey", "Tourist", "Completed", iso(2026, 2, 10, 9, 15), "Laura Gómez"),
  mkVisa(461, "C-2004", "schengen", "Tourist", "Under Review", iso(2026, 10, 1, 13, 5), "Karim Hassan"),
  mkVisa(463, "C-2005", "uk", "Business", "Documents Required", iso(2026, 9, 29, 11, 22), "Laura Gómez"),
  mkVisa(465, "C-2008", "canada", "Student", "Submitted", iso(2026, 10, 3, 17, 45)),
  mkVisa(466, "C-2009", "thailand", "Tourist", "Submitted", iso(2026, 10, 4, 7, 30)),
  mkVisa(440, "C-2003", "usa", "Business", "Approved", iso(2026, 8, 18, 15, 0), "Karim Hassan"),
  mkVisa(431, "C-2002", "singapore", "Tourist", "Rejected", iso(2026, 8, 4, 12, 10), "Laura Gómez"),
  mkVisa(455, "C-2007", "malaysia", "Transit", "Processing", iso(2026, 9, 25, 9, 50), "Laura Gómez"),
  mkVisa(420, "C-2010", "japan", "Tourist", "Completed", iso(2026, 7, 12, 10, 0), "Karim Hassan"),
  mkVisa(458, "C-2006", "uae", "Business", "Approved", iso(2026, 9, 27, 14, 30), "Karim Hassan"),
];

// ── Payments ───────────────────────────────────────────────────────
export const payments: Payment[] = [
  ...bookings
    .filter((b) => b.paymentStatus !== "Pending")
    .map<Payment>((b, i) => ({
      id: `TXN-${String(880100 + i)}`,
      customerId: b.customerId,
      bookingId: b.id,
      amount: b.total,
      method: b.paymentMethod as Payment["method"],
      date: b.createdAt,
      status: "Completed",
      kind: "Payment",
    })),
  ...bookings
    .filter((b) => b.paymentStatus === "Pending")
    .map<Payment>((b, i) => ({ id: `TXN-${String(880500 + i)}`, customerId: b.customerId, bookingId: b.id, amount: b.total, method: "Bank Transfer", date: b.createdAt, status: "Pending", kind: "Payment" })),
  ...bookings
    .filter((b) => b.paymentStatus === "Refunded")
    .map<Payment>((b, i) => ({ id: `RFD-${String(440100 + i)}`, customerId: b.customerId, bookingId: b.id, amount: b.total, method: b.paymentMethod as Payment["method"], date: b.createdAt, status: "Refunded", kind: "Refund" })),
  ...visaApplications.map<Payment>((v, i) => ({ id: `TXN-${String(881000 + i)}`, customerId: v.customerId, visaId: v.id, amount: v.fee, method: "Visa •••• 4242", date: v.submittedAt, status: "Completed", kind: "Payment" })),
].sort((a, b) => b.date.localeCompare(a.date));

// ── Customer documents ─────────────────────────────────────────────
export const customerDocuments: CustomerDocument[] = [
  { id: "DOC-1", customerId: "C-2001", category: "Passport", fileName: "Passport_AlexMorgan.pdf", size: "1.2 MB", uploadedAt: "2026-08-30", status: "Verified" },
  { id: "DOC-2", customerId: "C-2001", category: "Visa", fileName: "Turkiye_eVisa_2026.pdf", size: "420 KB", uploadedAt: "2026-02-14", status: "Verified" },
  { id: "DOC-3", customerId: "C-2001", category: "Tickets", fileName: "EK002_LHR-DXB_24Nov.pdf", size: "310 KB", uploadedAt: "2026-09-02", status: "Verified" },
  { id: "DOC-4", customerId: "C-2001", category: "Invoices", fileName: `Invoice_${alexBookings[0].id}.pdf`, size: "96 KB", uploadedAt: "2026-08-30", status: "Verified" },
  { id: "DOC-5", customerId: "C-2001", category: "Invoices", fileName: `Invoice_${alexBookings[2].id}.pdf`, size: "94 KB", uploadedAt: "2026-01-15", status: "Verified" },
  { id: "DOC-6", customerId: "C-2001", category: "Travel Insurance", fileName: "AXA_Policy_TRV-Dubai.pdf", size: "780 KB", uploadedAt: "2026-08-31", status: "Verified" },
  { id: "DOC-7", customerId: "C-2001", category: "Travel Insurance", fileName: "Insurance_Thailand_Mar26.pdf", size: "640 KB", uploadedAt: "2026-01-16", status: "Expired" },
];

// ── Support tickets ────────────────────────────────────────────────
export const tickets: SupportTicket[] = [
  {
    id: "TKT-3012", customerId: "C-2001", subject: "Adding a child to my Bali booking", category: "Booking", priority: "Medium", status: "In Progress", assignedTo: "Tom Becker",
    createdAt: iso(2026, 9, 29, 10, 0), updatedAt: iso(2026, 10, 3, 15, 30), relatedId: alexBookings[1].id,
    messages: [
      { id: "m1", from: "customer", author: "Alex Morgan", text: "Hi, we'd like to bring our daughter (age 8) on the Bali trip in January. Is there space, and what's the cost?", at: iso(2026, 9, 29, 10, 0) },
      { id: "m2", from: "agent", author: "Tom Becker", text: "Hi Alex, great news — there's availability. Children under 12 are charged at 70% of the adult price. I've asked the hotel to confirm a family villa and will update you shortly.", at: iso(2026, 9, 30, 9, 12) },
      { id: "m3", from: "agent", author: "Tom Becker", text: "The family villa is confirmed. I've updated your booking to 2 adults + 1 child; you'll see the new balance in your dashboard.", at: iso(2026, 10, 3, 15, 30) },
    ],
  },
  {
    id: "TKT-2987", customerId: "C-2001", subject: "Invoice copy for my Thailand trip", category: "Payment", priority: "Low", status: "Resolved", assignedTo: "Tom Becker",
    createdAt: iso(2026, 4, 2, 9, 0), updatedAt: iso(2026, 4, 2, 13, 0),
    messages: [
      { id: "m1", from: "customer", author: "Alex Morgan", text: "Could I get a VAT invoice for my company?", at: iso(2026, 4, 2, 9, 0) },
      { id: "m2", from: "agent", author: "Tom Becker", text: "Done — it's now in Documents → Invoices.", at: iso(2026, 4, 2, 13, 0) },
    ],
  },
  { id: "TKT-3020", customerId: "C-2005", subject: "UK visa bank statement format", category: "Visa", priority: "High", status: "Open", createdAt: iso(2026, 10, 3, 16, 10), updatedAt: iso(2026, 10, 3, 16, 10), messages: [{ id: "m1", from: "customer", author: "Rahim Chowdhury", text: "Your agent asked for a stamped bank statement. Is an e-statement with QR verification acceptable?", at: iso(2026, 10, 3, 16, 10) }] },
  { id: "TKT-3018", customerId: "C-2004", subject: "Refund status for cancelled trip", category: "Payment", priority: "Urgent", status: "Waiting", assignedTo: "James Carter", createdAt: iso(2026, 10, 1, 12, 0), updatedAt: iso(2026, 10, 2, 9, 0), messages: [{ id: "m1", from: "customer", author: "Amira Haddad", text: "I cancelled 45 days before departure — when will I receive my refund?", at: iso(2026, 10, 1, 12, 0) }, { id: "m2", from: "agent", author: "James Carter", text: "Your refund was issued on 2 Oct and takes 5–7 working days to appear. Could you confirm the last 4 digits of the card used?", at: iso(2026, 10, 2, 9, 0) }] },
  { id: "TKT-3015", customerId: "C-2003", subject: "Dietary requirements on Japan tour", category: "Booking", priority: "Low", status: "Closed", assignedTo: "Tom Becker", createdAt: iso(2026, 9, 20, 8, 0), updatedAt: iso(2026, 9, 21, 8, 0), messages: [{ id: "m1", from: "customer", author: "Daniel Kim", text: "I'm vegetarian — can the ryokan accommodate?", at: iso(2026, 9, 20, 8, 0) }, { id: "m2", from: "agent", author: "Tom Becker", text: "Yes, a vegetarian kaiseki has been arranged.", at: iso(2026, 9, 21, 8, 0) }] },
  { id: "TKT-3021", customerId: "C-2008", subject: "Can't upload my admission letter", category: "Account", priority: "Medium", status: "Open", createdAt: iso(2026, 10, 4, 6, 40), updatedAt: iso(2026, 10, 4, 6, 40), messages: [{ id: "m1", from: "customer", author: "Priya Nair", text: "The upload fails for my 14 MB PDF.", at: iso(2026, 10, 4, 6, 40) }] },
];

// ── Notifications ──────────────────────────────────────────────────
export const notifications: Notification[] = [
  { id: "N-1", audience: "admin", kind: "visa", title: "Visa document uploaded", body: "Omar Farouk uploaded 3 documents for VISA-2026-00466.", at: iso(2026, 10, 4, 7, 31), read: false, href: "/admin/visa/VISA-2026-00466" },
  { id: "N-2", audience: "admin", kind: "support", title: "Customer requested support", body: "Priya Nair opened TKT-3021 — “Can't upload my admission letter”.", at: iso(2026, 10, 4, 6, 41), read: false, href: "/admin/support/TKT-3021" },
  { id: "N-3", audience: "admin", kind: "booking", title: "New booking received", body: `Alex Morgan booked Bali Culture & Rice Terraces for 12 Jan 2027.`, at: iso(2026, 9, 28, 9, 6), read: false, href: `/admin/bookings/${alexBookings[1].id}` },
  { id: "N-4", audience: "admin", kind: "payment", title: "Payment completed", body: "$2,190 received from Daniel Kim via Visa •••• 4242.", at: iso(2026, 9, 27, 18, 2), read: true, href: "/admin/payments" },
  { id: "N-5", audience: "admin", kind: "cancellation", title: "Booking cancellation requested", body: "Amira Haddad requested to cancel a Singapore booking.", at: iso(2026, 9, 26, 11, 15), read: true, href: "/admin/bookings?status=Cancelled" },
  { id: "N-6", audience: "customer", kind: "visa", title: "Your UAE visa is processing", body: "VISA-2026-00452 has been lodged with the authority.", at: iso(2026, 9, 24, 12, 0), read: false, href: "/dashboard/visa" },
  { id: "N-7", audience: "customer", kind: "support", title: "New reply on TKT-3012", body: "Tom Becker: “The family villa is confirmed…”", at: iso(2026, 10, 3, 15, 30), read: false, href: "/dashboard/messages/TKT-3012" },
  { id: "N-8", audience: "customer", kind: "booking", title: "Trip documents ready", body: "Your Dubai Luxury Escape voucher is ready to download.", at: iso(2026, 9, 2, 10, 0), read: true, href: `/dashboard/bookings/${alexBookings[0].id}` },
];
