"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type {
  Banner,
  BlogPost,
  Booking,
  BookingStatus,
  CustomerDocument,
  DocStatus,
  FAQ,
  Notification,
  Payment,
  Review,
  Role,
  SupportTicket,
  Tour,
  User,
  VisaApplication,
  VisaStatus,
} from "./types";
import { tours as seedTours } from "./data/tours";
import { destinations as seedDestinations } from "./data/destinations";
import { banners as seedBanners, blogPosts as seedBlog, faqs as seedFaqs, reviews as seedReviews } from "./data/content";
import { CURRENT_USER_ID, customers as seedCustomers, roles as seedRoles } from "./data/people";
import {
  bookings as seedBookings,
  customerDocuments as seedDocs,
  notifications as seedNotifications,
  payments as seedPayments,
  tickets as seedTickets,
  visaApplications as seedVisa,
} from "./data/records";

const STORAGE_KEY = "voyara:state:v1";

export interface AppState {
  session: { customerId: string | null; admin: boolean };
  tours: Tour[];
  destinations: typeof seedDestinations;
  bookings: Booking[];
  visaApplications: VisaApplication[];
  customers: User[];
  payments: Payment[];
  documents: CustomerDocument[];
  tickets: SupportTicket[];
  notifications: Notification[];
  reviews: Review[];
  blog: BlogPost[];
  faqs: FAQ[];
  banners: Banner[];
  roles: Role[];
}

const seed = (): AppState => ({
  session: { customerId: CURRENT_USER_ID, admin: true },
  tours: seedTours,
  destinations: seedDestinations,
  bookings: seedBookings,
  visaApplications: seedVisa,
  customers: seedCustomers,
  payments: seedPayments,
  documents: seedDocs,
  tickets: seedTickets,
  notifications: seedNotifications,
  reviews: seedReviews,
  blog: seedBlog,
  faqs: seedFaqs,
  banners: seedBanners,
  roles: seedRoles,
});

const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

function nextId(existing: string[], prefix: string, width: number, start: number) {
  const max = existing.reduce((m, id) => {
    const n = Number(id.replace(prefix, ""));
    return Number.isFinite(n) && n > m ? n : m;
  }, start);
  return `${prefix}${String(max + 1).padStart(width, "0")}`;
}

function notify(s: AppState, n: Omit<Notification, "id" | "at" | "read">): Notification[] {
  return [{ ...n, id: uid("N"), at: now(), read: false }, ...s.notifications];
}

function createActions(set: (fn: (s: AppState) => AppState) => void, get: () => AppState) {
  return {
    reset: () => set(() => seed()),

    // ── Auth ──
    login: (customerId = CURRENT_USER_ID) => set((s) => ({ ...s, session: { ...s.session, customerId } })),
    logout: () => set((s) => ({ ...s, session: { ...s.session, customerId: null } })),

    // ── Saved tours ──
    toggleSaved: (tourId: string) =>
      set((s) => {
        const id = s.session.customerId;
        if (!id) return s;
        return {
          ...s,
          customers: s.customers.map((c) =>
            c.id === id
              ? { ...c, savedTours: c.savedTours.includes(tourId) ? c.savedTours.filter((t) => t !== tourId) : [...c.savedTours, tourId] }
              : c,
          ),
        };
      }),

    // ── Bookings ──
    createBooking: (b: Omit<Booking, "id" | "createdAt" | "timeline" | "notes" | "status" | "paymentStatus">, paid: boolean) => {
      const state = get();
      const id = nextId(state.bookings.map((x) => x.id), "TRV-2026-", 6, 1283);
      const at = now();
      const tour = state.tours.find((t) => t.id === b.tourId);
      const customer = state.customers.find((c) => c.id === b.customerId);
      const booking: Booking = {
        ...b,
        id,
        createdAt: at,
        status: paid ? "Confirmed" : "Pending",
        paymentStatus: paid ? "Paid" : "Pending",
        notes: [],
        timeline: [
          { id: uid("e"), label: "Booking created", at, by: customer?.name },
          ...(paid ? [{ id: uid("e"), label: "Payment received", at, by: "System" }, { id: uid("e"), label: "Booking confirmed", at, by: "System" }] : []),
        ],
      };
      set((s) => ({
        ...s,
        bookings: [booking, ...s.bookings],
        tours: s.tours.map((t) => (t.id === b.tourId ? { ...t, bookings: t.bookings + 1 } : t)),
        payments: [
          { id: nextId(s.payments.filter((p) => p.id.startsWith("TXN-")).map((p) => p.id), "TXN-", 6, 881100), customerId: b.customerId, bookingId: id, amount: b.total, method: b.paymentMethod as Payment["method"], date: at, status: paid ? "Completed" : "Pending", kind: "Payment" },
          ...s.payments,
        ],
        documents: paid
          ? [{ id: uid("DOC"), customerId: b.customerId, category: "Invoices", fileName: `Invoice_${id}.pdf`, size: "96 KB", uploadedAt: at.slice(0, 10), status: "Verified" }, ...s.documents]
          : s.documents,
        notifications: [
          { id: uid("N"), audience: "customer", kind: "booking", title: "Booking confirmed", body: `${tour?.title} on ${b.date} — ${id}`, at, read: false, href: `/dashboard/bookings/${id}` },
          ...notify(s, { audience: "admin", kind: "booking", title: "New booking received", body: `${customer?.name} booked ${tour?.title}.`, href: `/admin/bookings/${id}` }),
        ],
      }));
      return booking;
    },

    setBookingStatus: (id: string, status: BookingStatus, by = "Admin") =>
      set((s) => {
        const b = s.bookings.find((x) => x.id === id);
        return {
          ...s,
          bookings: s.bookings.map((x) =>
            x.id === id ? { ...x, status, timeline: [...x.timeline, { id: uid("e"), label: `Booking ${status.toLowerCase()}`, at: now(), by }] } : x,
          ),
          notifications: b
            ? [{ id: uid("N"), audience: "customer", kind: status === "Cancelled" ? "cancellation" : "booking", title: `Booking ${status.toLowerCase()}`, body: `${id} is now ${status}.`, at: now(), read: false, href: `/dashboard/bookings/${id}` }, ...s.notifications]
            : s.notifications,
        };
      }),

    requestCancellation: (id: string) =>
      set((s) => {
        const b = s.bookings.find((x) => x.id === id);
        const c = s.customers.find((x) => x.id === b?.customerId);
        return {
          ...s,
          bookings: s.bookings.map((x) =>
            x.id === id ? { ...x, status: "Cancelled", timeline: [...x.timeline, { id: uid("e"), label: "Cancelled by customer", at: now(), by: c?.name }] } : x,
          ),
          notifications: notify(s, { audience: "admin", kind: "cancellation", title: "Booking cancellation requested", body: `${c?.name} cancelled ${id}. Review refund eligibility.`, href: `/admin/bookings/${id}` }),
        };
      }),

    markBookingPaid: (id: string) =>
      set((s) => ({
        ...s,
        bookings: s.bookings.map((x) => (x.id === id ? { ...x, paymentStatus: "Paid", timeline: [...x.timeline, { id: uid("e"), label: "Payment received", at: now(), by: "System" }] } : x)),
        payments: s.payments.map((p) => (p.bookingId === id && p.status === "Pending" ? { ...p, status: "Completed" } : p)),
      })),

    refundBooking: (id: string, by = "Admin") =>
      set((s) => {
        const b = s.bookings.find((x) => x.id === id)!;
        return {
          ...s,
          bookings: s.bookings.map((x) =>
            x.id === id ? { ...x, paymentStatus: "Refunded", status: "Cancelled", timeline: [...x.timeline, { id: uid("e"), label: "Refund issued", at: now(), by }] } : x,
          ),
          payments: [{ id: uid("RFD"), customerId: b.customerId, bookingId: id, amount: b.total, method: b.paymentMethod as Payment["method"], date: now(), status: "Refunded", kind: "Refund" }, ...s.payments],
          notifications: [{ id: uid("N"), audience: "customer", kind: "payment", title: "Refund issued", body: `A refund for ${id} is on its way (5–7 working days).`, at: now(), read: false, href: `/dashboard/payments` }, ...s.notifications],
        };
      }),

    addBookingNote: (id: string, text: string, author = "Nadia Rahman") =>
      set((s) => ({ ...s, bookings: s.bookings.map((x) => (x.id === id ? { ...x, notes: [...x.notes, { id: uid("n"), author, text, at: now() }] } : x)) })),

    sendBookingConfirmation: (id: string) =>
      set((s) => ({
        ...s,
        bookings: s.bookings.map((x) => (x.id === id ? { ...x, timeline: [...x.timeline, { id: uid("e"), label: "Confirmation email sent", at: now(), by: "Admin" }] } : x)),
      })),

    // ── Visa ──
    submitVisa: (app: Omit<VisaApplication, "id" | "status" | "submittedAt" | "timeline">) => {
      const state = get();
      const id = nextId(state.visaApplications.map((v) => v.id), "VISA-2026-", 5, 451);
      const at = now();
      const full: VisaApplication = { ...app, id, status: "Submitted", submittedAt: at, timeline: [{ id: uid("v"), label: "Application submitted", at, by: app.applicant.fullName }] };
      set((s) => ({
        ...s,
        visaApplications: [full, ...s.visaApplications],
        payments: [{ id: uid("TXN"), customerId: app.customerId, visaId: id, amount: app.fee, method: "Visa •••• 4242", date: at, status: "Completed", kind: "Payment" }, ...s.payments],
        notifications: notify(s, { audience: "admin", kind: "visa", title: "New visa application", body: `${app.applicant.fullName} applied (${id}). ${app.documents.length} documents uploaded.`, href: `/admin/visa/${id}` }),
      }));
      return full;
    },

    setVisaStatus: (id: string, status: VisaStatus, by = "Visa desk") =>
      set((s) => ({
        ...s,
        visaApplications: s.visaApplications.map((v) =>
          v.id === id ? { ...v, status, timeline: [...v.timeline, { id: uid("v"), label: `Status changed to ${status}`, at: now(), by }] } : v,
        ),
        notifications: [{ id: uid("N"), audience: "customer", kind: "visa", title: `Visa update: ${status}`, body: `${id} is now “${status}”.`, at: now(), read: false, href: `/visa/track?id=${id}` }, ...s.notifications],
      })),

    assignVisaAgent: (id: string, agent: string) =>
      set((s) => ({
        ...s,
        visaApplications: s.visaApplications.map((v) =>
          v.id === id ? { ...v, assignedAgent: agent, status: v.status === "Submitted" ? "Under Review" : v.status, timeline: [...v.timeline, { id: uid("v"), label: `Assigned to ${agent}`, at: now(), by: "Admin" }] } : v,
        ),
      })),

    setVisaDocStatus: (appId: string, docId: string, status: DocStatus, note?: string) =>
      set((s) => ({
        ...s,
        visaApplications: s.visaApplications.map((v) => {
          if (v.id !== appId) return v;
          const documents = v.documents.map((d) => (d.id === docId ? { ...d, status, note: note ?? d.note } : d));
          const doc = v.documents.find((d) => d.id === docId)!;
          const needsMore = documents.some((d) => d.status === "Re-upload Requested" || d.status === "Rejected");
          const nextStatus: VisaStatus = needsMore ? "Documents Required" : v.status === "Documents Required" ? "Under Review" : v.status;
          return {
            ...v,
            documents,
            status: nextStatus,
            timeline: [...v.timeline, { id: uid("v"), label: `${doc.kind} ${status === "Verified" ? "verified" : status === "Rejected" ? "rejected" : "re-upload requested"}`, at: now(), by: v.assignedAgent ?? "Visa desk", note }],
          };
        }),
        notifications:
          status === "Verified"
            ? s.notifications
            : [{ id: uid("N"), audience: "customer", kind: "visa", title: "Action needed on your visa", body: note || "A document needs to be re-uploaded.", at: now(), read: false, href: "/dashboard/visa" }, ...s.notifications],
      })),

    reuploadVisaDoc: (appId: string, docId: string, fileName: string, size: string) =>
      set((s) => ({
        ...s,
        visaApplications: s.visaApplications.map((v) => {
          if (v.id !== appId) return v;
          const documents = v.documents.map((d) => (d.id === docId ? { ...d, fileName, size, uploadedAt: now(), status: "Pending" as DocStatus, note: undefined } : d));
          const stillNeeds = documents.some((d) => d.status === "Re-upload Requested" || d.status === "Rejected");
          return { ...v, documents, status: stillNeeds ? v.status : "Under Review", timeline: [...v.timeline, { id: uid("v"), label: "Document re-uploaded", at: now(), by: v.applicant.fullName }] };
        }),
        notifications: notify(s, { audience: "admin", kind: "visa", title: "Visa document uploaded", body: `New file for ${appId}: ${fileName}`, href: `/admin/visa/${appId}` }),
      })),

    // ── Tours ──
    upsertTour: (tour: Tour) =>
      set((s) => ({ ...s, tours: s.tours.some((t) => t.id === tour.id) ? s.tours.map((t) => (t.id === tour.id ? tour : t)) : [tour, ...s.tours] })),
    deleteTour: (id: string) => set((s) => ({ ...s, tours: s.tours.filter((t) => t.id !== id) })),
    toggleTourStatus: (id: string) =>
      set((s) => ({ ...s, tours: s.tours.map((t) => (t.id === id ? { ...t, status: t.status === "published" ? "draft" : "published" } : t)) })),
    duplicateTour: (id: string) =>
      set((s) => {
        const t = s.tours.find((x) => x.id === id);
        if (!t) return s;
        const newId = nextId(s.tours.map((x) => x.id), "T-", 4, 1000);
        return { ...s, tours: [{ ...t, id: newId, slug: `${t.slug}-copy`, title: `${t.title} (Copy)`, status: "draft", bookings: 0, createdAt: now().slice(0, 10) }, ...s.tours] };
      }),
    newTourId: () => nextId(get().tours.map((x) => x.id), "T-", 4, 1000),

    // ── Customers ──
    updateCustomer: (id: string, patch: Partial<User>) =>
      set((s) => ({ ...s, customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

    // ── Documents ──
    addDocument: (doc: Omit<CustomerDocument, "id">) => set((s) => ({ ...s, documents: [{ ...doc, id: uid("DOC") }, ...s.documents] })),
    deleteDocument: (id: string) => set((s) => ({ ...s, documents: s.documents.filter((d) => d.id !== id) })),

    // ── Support ──
    createTicket: (t: Pick<SupportTicket, "customerId" | "subject" | "category" | "priority" | "relatedId"> & { message: string; attachment?: string; author: string }) => {
      const id = nextId(get().tickets.map((x) => x.id), "TKT-", 4, 3021);
      const at = now();
      set((s) => ({
        ...s,
        tickets: [
          { id, customerId: t.customerId, subject: t.subject, category: t.category, priority: t.priority, relatedId: t.relatedId, status: "Open", createdAt: at, updatedAt: at, messages: [{ id: uid("m"), from: "customer", author: t.author, text: t.message, at, attachment: t.attachment }] },
          ...s.tickets,
        ],
        notifications: notify(s, { audience: "admin", kind: "support", title: "Customer requested support", body: `${t.author} opened ${id} — “${t.subject}”.`, href: `/admin/support/${id}` }),
      }));
      return id;
    },
    replyTicket: (id: string, from: "customer" | "agent", author: string, text: string, attachment?: string) =>
      set((s) => ({
        ...s,
        tickets: s.tickets.map((t) =>
          t.id === id
            ? {
                ...t,
                updatedAt: now(),
                status: from === "agent" && t.status === "Open" ? "In Progress" : from === "customer" && t.status === "Waiting" ? "In Progress" : t.status,
                messages: [...t.messages, { id: uid("m"), from, author, text, at: now(), attachment }],
              }
            : t,
        ),
        notifications:
          from === "agent"
            ? [{ id: uid("N"), audience: "customer", kind: "support", title: `New reply on ${id}`, body: `${author}: “${text.slice(0, 60)}${text.length > 60 ? "…" : ""}”`, at: now(), read: false, href: `/dashboard/messages/${id}` }, ...s.notifications]
            : notify(s, { audience: "admin", kind: "support", title: `Customer replied on ${id}`, body: text.slice(0, 80), href: `/admin/support/${id}` }),
      })),
    updateTicket: (id: string, patch: Partial<Pick<SupportTicket, "status" | "priority" | "assignedTo">>) =>
      set((s) => ({ ...s, tickets: s.tickets.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now() } : t)) })),

    // ── Notifications ──
    markRead: (id: string) => set((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
    markAllRead: (audience: Notification["audience"]) =>
      set((s) => ({ ...s, notifications: s.notifications.map((n) => (n.audience === audience ? { ...n, read: true } : n)) })),

    // ── Content ──
    toggleReview: (id: string) => set((s) => ({ ...s, reviews: s.reviews.map((r) => (r.id === id ? { ...r, published: !r.published } : r)) })),
    toggleBlog: (id: string) => set((s) => ({ ...s, blog: s.blog.map((b) => (b.id === id ? { ...b, published: !b.published } : b)) })),
    upsertFaq: (f: FAQ) => set((s) => ({ ...s, faqs: s.faqs.some((x) => x.id === f.id) ? s.faqs.map((x) => (x.id === f.id ? f : x)) : [...s.faqs, f] })),
    deleteFaq: (id: string) => set((s) => ({ ...s, faqs: s.faqs.filter((f) => f.id !== id) })),
    toggleBanner: (id: string) => set((s) => ({ ...s, banners: s.banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b)) })),
    toggleFeaturedDestination: (id: string) =>
      set((s) => ({ ...s, destinations: s.destinations.map((d) => (d.id === id ? { ...d, featured: !d.featured } : d)) })),
    toggleFeaturedTour: (id: string) => set((s) => ({ ...s, tours: s.tours.map((t) => (t.id === id ? { ...t, featured: !t.featured } : t)) })),

    // ── Roles ──
    setRolePermissions: (roleId: string, resource: string, perms: Role["permissions"][string]) =>
      set((s) => ({ ...s, roles: s.roles.map((r) => (r.id === roleId ? { ...r, permissions: { ...r.permissions, [resource]: perms } } : r)) })),
  };
}

export type Actions = ReturnType<typeof createActions>;

const StoreContext = createContext<{ state: AppState; actions: Actions; hydrated: boolean } | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(seed);
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef(state);
  useLayoutEffect(() => {
    ref.current = state;
  }, [state]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Syncing from an external store (localStorage) after mount avoids SSR hydration mismatches.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState({ ...seed(), ...JSON.parse(raw) });
    } catch {
      /* storage unavailable — keep seed */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota or privacy mode */
    }
  }, [state, hydrated]);

  const set = useCallback((fn: (s: AppState) => AppState) => {
    setState((s) => {
      const next = fn(s);
      ref.current = next;
      return next;
    });
  }, []);
  const get = useCallback(() => ref.current, []);
  // eslint-disable-next-line react-hooks/refs -- `get` is only invoked from event handlers, never during render
  const actions = useMemo(() => createActions(set, get), [set, get]);

  const value = useMemo(() => ({ state, actions, hydrated }), [state, actions, hydrated]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export function useCurrentUser() {
  const { state } = useStore();
  return state.customers.find((c) => c.id === state.session.customerId) ?? null;
}
