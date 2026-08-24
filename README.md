# Nogoon Suvarga V1

Production-oriented static prototype for nogoonsuvarga.com.

## Current V1
- Mongolian-first / English toggle
- Brand story and Green Suvarga positioning
- Customer journey
- Memorial order form
- Privacy selection
- Impact/verification positioning
- Responsive mobile layout
- Local draft persistence in browser

## Before accepting real money
1. Deploy to the chosen hosting provider.
2. Connect nogoonsuvarga.com DNS.
3. Connect a Mongolian payment provider (e.g. QPay) and international card payment if required.
4. Add a secure backend/database for orders and memorial records.
5. Add admin workflow for Tree ID, planting date, GPS, photos, monitoring and replacement.
6. Add privacy/terms/consent pages.
7. Replace placeholder impact numbers with verified operational data.
8. Create the first 100-Green-Suvarga pilot.

## Suggested architecture after validation
Frontend: Next.js or equivalent
Database: PostgreSQL
Storage: object storage for memorial photos and planting evidence
Payments: QPay + international card processor
Maps: Google Maps / Mapbox
Admin: authenticated operations dashboard
Public tree page: /tree/{treeId}
Memorial page: /memorial/{slug}
