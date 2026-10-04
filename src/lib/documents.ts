import { addOns } from "./data/tours";
import { company } from "./data/content";
import type { Booking, Tour, User, VisaApplication } from "./types";
import { formatDate, formatMoney } from "./utils";

function download(filename: string, html: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const shell = (title: string, body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<style>
body{font-family:Inter,Arial,sans-serif;color:#0F172A;max-width:760px;margin:40px auto;padding:0 24px;font-size:14px}
h1{font-size:26px;margin:0}table{width:100%;border-collapse:collapse;margin-top:24px}
td,th{padding:10px 0;border-bottom:1px solid #E2E8F0;text-align:left}th{font-size:12px;color:#64748B;text-transform:uppercase}
.r{text-align:right}.muted{color:#64748B}.brand{color:#0F4C5C;font-weight:800;font-size:22px}.tot td{font-weight:700;font-size:16px;border:0}
.box{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:16px;margin-top:24px}
</style></head><body>${body}<p class="muted" style="margin-top:40px">${company.legal} · ${company.address} · ${company.email}</p></body></html>`;

export function downloadInvoice(b: Booking, tour: Tour, c: User) {
  const rows = [
    [`${tour.title} — adults × ${b.adults}`, tour.price * b.adults],
    ...(b.children ? [[`Children × ${b.children}`, Math.round(tour.price * 0.7 * b.children)]] : []),
    ...b.addOns.map((id) => {
      const a = addOns.find((x) => x.id === id)!;
      return [a.name, a.per === "person" ? a.price * (b.adults + b.children) : a.price];
    }),
    ["Taxes & fees", b.taxes],
  ] as [string, number][];
  download(
    `Invoice_${b.id}.html`,
    shell(
      `Invoice ${b.id}`,
      `<div style="display:flex;justify-content:space-between;align-items:start"><div class="brand">voyara</div><div class="r"><h1>Invoice</h1><p class="muted">${b.id}<br>Issued ${formatDate(b.createdAt)}</p></div></div>
      <div class="box"><strong>Billed to</strong><br>${c.name}<br>${c.email}<br>${c.address}</div>
      <table><thead><tr><th>Description</th><th class="r">Amount</th></tr></thead><tbody>
      ${rows.map(([d, v]) => `<tr><td>${d}</td><td class="r">${formatMoney(v)}</td></tr>`).join("")}
      <tr class="tot"><td>Total (${b.paymentStatus})</td><td class="r">${formatMoney(b.total)}</td></tr></tbody></table>
      <p class="muted">Payment method: ${b.paymentMethod}. Travel date: ${formatDate(b.date, "long")}.</p>`,
    ),
  );
}

export function downloadVoucher(b: Booking, tour: Tour) {
  download(
    `Voucher_${b.id}.html`,
    shell(
      `Voucher ${b.id}`,
      `<div class="brand">voyara</div><h1 style="margin-top:24px">Travel Voucher</h1><p class="muted">Present this voucher to your guide on day one.</p>
      <div class="box"><strong>${tour.title}</strong><br>${tour.location}<br>Departure: ${formatDate(b.date, "long")} · ${tour.days} days<br>Meeting point: ${tour.meetingPoint}</div>
      <table><thead><tr><th>Traveller</th><th>Passport</th><th>Type</th></tr></thead><tbody>
      ${b.travelers.map((t) => `<tr><td>${t.firstName} ${t.lastName}</td><td>${t.passport}</td><td>${t.type}</td></tr>`).join("")}
      </tbody></table><p>Emergency line (24/7): ${company.phone}</p>`,
    ),
  );
}

export function downloadVisaReceipt(v: VisaApplication, country: string) {
  download(
    `Visa_${v.id}.html`,
    shell(
      `Visa application ${v.id}`,
      `<div class="brand">voyara</div><h1 style="margin-top:24px">Visa Application Receipt</h1>
      <div class="box">Application: <strong>${v.id}</strong><br>${country} — ${v.type} visa<br>Applicant: ${v.applicant.fullName} (${v.applicant.passport})<br>Submitted: ${formatDate(v.submittedAt, "long")}<br>Status: ${v.status}</div>
      <table><thead><tr><th>Document</th><th>File</th><th>Status</th></tr></thead><tbody>
      ${v.documents.map((d) => `<tr><td>${d.kind}</td><td>${d.fileName}</td><td>${d.status}</td></tr>`).join("")}
      </tbody></table><p>Service fee paid: ${formatMoney(v.fee)}</p>`,
    ),
  );
}

export function downloadPlaceholder(fileName: string) {
  download(fileName.replace(/\.\w+$/, "") + ".html", shell(fileName, `<div class="brand">voyara</div><h1 style="margin-top:24px">${fileName}</h1><p class="muted">Demo document placeholder.</p>`));
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
