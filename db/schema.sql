-- Booking system schema (BOOKING-PLAN.md §1–2). Apply with:
--   npx wrangler d1 execute aimanjack-booking --remote --file db/schema.sql   (prod)
--   npx wrangler d1 execute aimanjack-booking --local  --file db/schema.sql   (wrangler pages dev)
-- Instants (start_at / end_at) are stored as UTC ISO strings; the API renders them in the business tz.

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,                 -- slug, e.g. 'aimanjack'
  name TEXT NOT NULL,
  tz TEXT NOT NULL DEFAULT 'America/Chicago',
  min_lead_min INTEGER NOT NULL DEFAULT 60,
  max_days_ahead INTEGER NOT NULL DEFAULT 30,
  cancel_window_hours INTEGER NOT NULL DEFAULT 2,
  owner_phone TEXT,                    -- gets the summary SMS (W3)
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT NOT NULL,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  duration_min INTEGER NOT NULL,
  buffer_min INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 1, -- bookings allowed in the same slot per staff (time-window services)
  active INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (business_id, id)
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT NOT NULL,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (business_id, id)
);

-- Weekly opening hours. staff_id NULL = applies to every staff member. Lunch = two rows per day.
CREATE TABLE IF NOT EXISTS availability_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  staff_id TEXT,
  weekday INTEGER NOT NULL,            -- 0 = Sunday … 6 = Saturday (business tz)
  start_hm TEXT NOT NULL,              -- 'HH:MM' local
  end_hm TEXT NOT NULL
);

-- Holidays, PTO, one-off closures. staff_id NULL = whole business.
CREATE TABLE IF NOT EXISTS blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id TEXT NOT NULL REFERENCES businesses(id),
  staff_id TEXT,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  reason TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,                 -- random; also the customer's manage token (/book/?id=…)
  business_id TEXT NOT NULL REFERENCES businesses(id),
  service_id TEXT NOT NULL,
  staff_id TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,        -- E.164
  customer_email TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',  -- confirmed | cancelled
  source TEXT NOT NULL DEFAULT 'web',        -- web | voice | sms | admin
  idempotency_key TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS bookings_slot ON bookings (business_id, staff_id, status, start_at);
CREATE UNIQUE INDEX IF NOT EXISTS bookings_idem ON bookings (business_id, idempotency_key);

-- One row per write. Case-study numbers come from here.
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id TEXT NOT NULL,
  booking_id TEXT NOT NULL,
  type TEXT NOT NULL,                  -- created | rescheduled | cancelled
  source TEXT NOT NULL,                -- web | voice | sms | admin
  payload TEXT,                        -- JSON
  at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS events_biz ON events (business_id, at);

-- Seed: AI Man Jack itself (W1). Hours mirror the SMS agent: Mon–Fri 7–9 PM, Sat 10 AM–6 PM, Sunday off.
INSERT OR IGNORE INTO businesses (id, name, tz, min_lead_min, max_days_ahead, cancel_window_hours, owner_phone)
  VALUES ('aimanjack', 'AI Man Jack', 'America/Chicago', 60, 30, 2, '+18328886016');
INSERT OR IGNORE INTO services (id, business_id, name, duration_min, buffer_min, capacity)
  VALUES ('demo-call', 'aimanjack', '15-minute demo call with Jack', 15, 0, 1);
INSERT OR IGNORE INTO staff (id, business_id, name) VALUES ('jack', 'aimanjack', 'Jack Qian');
INSERT INTO availability_rules (business_id, staff_id, weekday, start_hm, end_hm)
  SELECT 'aimanjack', NULL, w, '19:00', '21:00' FROM (SELECT 1 w UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5)
  WHERE NOT EXISTS (SELECT 1 FROM availability_rules WHERE business_id = 'aimanjack');
INSERT INTO availability_rules (business_id, staff_id, weekday, start_hm, end_hm)
  SELECT 'aimanjack', NULL, 6, '10:00', '18:00'
  WHERE NOT EXISTS (SELECT 1 FROM availability_rules WHERE business_id = 'aimanjack' AND weekday = 6);
