-- Booking call becomes a 20-minute AI workflow call (2026-09-28). The row had been edited by hand to
-- '15-minute demo call with Jack' / 15 while db/schema.sql and the site said 30; this makes all three agree.
-- The id stays 'demo-call': /book/, booking-smoke.mjs and existing bookings reference it.
update booking.services
   set name = '20-Minute AI Workflow Call', duration_min = 20
 where business_id = 'aimanjack' and id = 'demo-call';
