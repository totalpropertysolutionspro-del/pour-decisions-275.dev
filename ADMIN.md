# Pour Decisions — Owner Dashboard & Data

The app has a built-in **Owner Dashboard** (no separate website to log into — it's
the same app, on phone or desktop) and a small backend that **keeps all your data**
and syncs it to every customer's device.

## Getting into the dashboard

1. Open the app → bottom nav **Me** (Account).
2. Tap **Owner Tools** → enter the **staff PIN**.
3. Default PIN is **`7687`** ("POUR"). Change it by setting the `ADMIN_PIN`
   environment variable (see below).

Inside you get two tabs:

- **📅 Events** — publish, list, and delete events. Published events appear
  instantly on the public **calendar** and **home feed**.
- **📩 Bookings** — every "Book the Space" request lands here with the guest's
  name, contact, date/time, party size, and notes. Tap **Call/Email back** or
  **Archive**.

A status chip shows where data lives: **☁️ Cloud sync on** or **📱 On-device**.

## How data is kept

The app is **cloud-first with an on-device fallback**:

| State | What happens |
| --- | --- |
| **No cloud attached (default)** | Events & bookings save in the browser (localStorage). Works fully on one device. Good for testing. |
| **Cloud attached** | Events & bookings save to a shared store via `/api/events` and `/api/bookings`. Owner posts show up on **every** customer's phone; bookings collect in one inbox. |

It auto-detects which mode it's in — no code change needed when you attach the cloud.

## Turn on cloud sync (one-time, ~3 minutes)

The backend talks to a **Vercel KV** (Redis) store using the REST API. No extra
npm packages required.

1. In **Vercel → your project → Storage → Create Database → KV**.
2. **Connect** it to this project. Vercel automatically adds the
   `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables.
3. (Recommended) Add an env var **`ADMIN_PIN`** with your private staff PIN.
4. **Redeploy.** The dashboard chip will flip to **☁️ Cloud sync on**.

That's it — events and bookings are now persistent and shared across all devices.

> Prefer a different store (Supabase, Upstash direct, Postgres)? Only
> `api/_store.js` needs to change — `readList(key)` / `writeList(key, list)` are
> the only two functions the rest of the code depends on.

## API surface

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/events` | public | List events (also reports `configured`) |
| POST | `/api/events` | `x-admin-pin` | Publish an event |
| DELETE | `/api/events?id=…` | `x-admin-pin` | Remove an event |
| POST | `/api/bookings` | public | Submit a space-booking request |
| GET | `/api/bookings` | `x-admin-pin` | List booking requests (inbox) |
| DELETE | `/api/bookings?id=…` | `x-admin-pin` | Archive a request |

## Custom domain

Point your own `.com` at the Vercel project (**Settings → Domains**). The app —
and the install-to-home-screen flow — then run on your branded URL. HTTPS is
automatic, which is what lets phones install it as an app.
