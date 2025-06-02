🧾 Product Requirements Document (MVP v5)
Product Name: Medi Locator
Platform: Mobile-first Web App (PWA-friendly)
Tech Stack: React / Next.js (Frontend), Firebase Firestore (Database), shadcn for ui components, tailwindcss for styling

🎯 Objective
To create a super-simple, fast, mobile-first app to help any staff member:

Instantly locate where a medicine is stored

Find medicines based on symptoms

Access predefined medicine plans for common problems

Easily add new medicines or treatment plans if needed

🧩 Features (MVP)
🏠 1. Mobile-First Home Screen (Main Hub)
Accessible without login

Shows tappable icons/cards for all key actions on a single screen

Minimalist UI, readable fonts, big touch areas

Actions on Home Screen:

🔍 Search Medicine by Name

🤒 Search by Symptoms

💊 View Treatment Plans

➕ Add Medicine

📝 Add Treatment Plan

✅ 2. Search Medicine by Name
Functionality:

Input: Search bar

Output:

Name

Location: Almirah A → Row 2 → Box B

Type (tablet/syrup/capsule)

✅ 3. Search Medicines by Symptoms (Tag-Based)
Functionality:

Input: One or more symptom tags (e.g., ["fever", "cold"])

Output: All medicines that treat one or more of the selected symptoms

Each medicine shows:

Name

Location

Type

✅ 4. View Treatment Plans
Functionality:

Input: Select from list or search for a problem (e.g., "Acidity", "Cold + Cough")

Output:

Plan name

Associated symptoms

Recommended medicines:

Name

Notes (e.g., dosage or usage)

Type

Location

✅ 5. Add Medicine (No login required)
Form Inputs:

Name

Symptoms (tags)

Location: Almirah, Row, Box (dropdowns or text inputs)

Type (select: tablet, syrup, etc.)

✅ 6. Add Treatment Plan (No login required)
Form Inputs:

Plan name

Symptoms

Medicines (multi-add with each having: name, notes, type)

📦 Data Structure
🔹 Medicines
{
  "medicine_name": "Paracetamol",
  "symptoms": ["fever", "headache", "body pain"],
  "notes":"1 tablet after every 4 hours"
  "location": {
    "almirah": "A",
    "row": "2",
    "box": "B"
  },
  "type": "tablet"
}
🔹 Treatment Plans
{
  "plan_name": "Cold & Cough",
  "symptoms": ["cold", "cough"],
  "recommended_medicines": [
    {
      "medicine_name": "Cetrizine",
      "notes": "Take 1 at night",
      "type": "tablet"
    },
    {
      "medicine_name": "Benadryl",
      "notes": "10 ml syrup twice daily",
      "type": "syrup"
    }
  ]
}
🛠️ Mobile UI Design Notes
All screens are mobile-optimized

Large touch targets (buttons, inputs)

Minimal text input where possible (e.g., dropdowns for location/type)

Home screen functions as main navigation — no need for separate menu

Use modals where possible to keep users on the same page

🔄 Data Entry Plan
Option A: Bulk Import (initial setup)
Use Google Sheet → CSV → Script to upload to Firestore

Option B: Manual Entry (ongoing)
Use the in-app “Add Medicine” and “Add Treatment Plan” forms

❌ What’s NOT Included
No login/authentication

No role-based access

No batch, expiry, manufacturer, or stock tracking

No AI integrations