import { CreditCard, Lock, MapPinOff, RefreshCw, ServerCrash, ShieldAlert, Timer, WifiOff } from "lucide-react";

export const ERRORS = {
  "404": { icon: <MapPinOff />, code: "404", title: "This page took a wrong turn", description: "The page you're looking for doesn't exist or has moved. Let's get you back on route." },
  "500": { icon: <ServerCrash />, code: "500", title: "Something went wrong on our side", description: "Our team has been notified automatically. Please try again in a moment — your bookings and data are safe." },
  network: { icon: <WifiOff />, code: "OFFLINE", title: "You appear to be offline", description: "Check your internet connection. Anything you were typing has been kept, and we'll reconnect automatically." },
  "booking-failed": { icon: <RefreshCw />, code: "BOOKING ERROR", title: "We couldn't complete your booking", description: "The selected departure sold out while you were checking out. You haven't been charged — choose another date to continue." },
  "payment-failed": { icon: <CreditCard />, code: "PAYMENT DECLINED", title: "Your payment didn't go through", description: "Your bank declined the transaction and no money was taken. Try another card, or use PayPal or bank transfer." },
  unauthorized: { icon: <ShieldAlert />, code: "403", title: "You don't have access to this page", description: "Your role doesn't include permission for this area. Ask a Super Admin to update your role if you need access." },
  "session-expired": { icon: <Timer />, code: "SESSION EXPIRED", title: "Your session has expired", description: "For your security we sign you out after 30 minutes of inactivity. Log in again to pick up where you left off." },
  locked: { icon: <Lock />, code: "ACCOUNT LOCKED", title: "Too many sign-in attempts", description: "We've temporarily locked your account to protect it. Reset your password or try again in 15 minutes." },
} as const;

export type ErrorKind = keyof typeof ERRORS;
