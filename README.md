# Velvet Touch Spa — responsive website starter

## Pages included
- `index.html` — home
- `about.html` — about and spa philosophy
- `services.html` — treatments and privacy-aware care-team demo
- `gallery.html` — photos and sample video gallery
- `contact.html` — phone, WhatsApp, location/map, email, opening hours and enquiry form
- `booking.html` — appointment request form

Shared assets: `styles.css`, `app.js`, `privacy.js`, `contact.js`.

## Run on Raspberry Pi OS Lite
Copy/extract the folder, then from inside it run:
```bash
python3 -m http.server 8000 --bind 0.0.0.0
```
Open `http://PI-IP-ADDRESS:8000/` from a device on the same network. For camera access from another device, use HTTPS; browsers generally do not allow camera access on ordinary HTTP LAN addresses. `localhost` is normally treated as a secure context.

## Critical privacy behavior
- Staff portraits are hidden by default in CSS, before JavaScript starts.
- After the Care Team enters view, there is a 2-second delay before camera/model initialization.
- Portraits are shown only if the face detector sees a face and the object detector does not see a supported device class.
- Missing face, supported device detection, camera denial, model load failure, scan exception, page/window focus loss, or section leaving view triggers Privacy Mode.
- Detection dependencies are downloaded from public CDNs; an internet connection is needed. If model loading fails, the site fails closed and keeps portraits hidden.

### Important security limitation
This is only a best-effort browser demo. Object detection can miss phones/cameras or mistake unrelated objects for devices. It cannot guarantee screenshot or screen-recording prevention or detect every external recording device. Do not rely on it as a security boundary. For a real production site, do not send private staff photos to public browsers unless authorised; use consent and server-side access control. Consider leaving real portraits disabled entirely.

## Replace before production
- The phone, WhatsApp number, address, email, opening hours and map query on `contact.html` are examples/placeholders.
- The forms open the visitor's email app using a placeholder email and do not submit to a backend.
- Staff names and images are sample content.
- Gallery photos and videos use external sample media and require internet access; use properly licensed, approved assets for a real business.
- The logo is a CSS-rendered velvet-inspired VT monogram.

No booking backend, payment processing, database, authentication or actual screenshot prevention is included.
