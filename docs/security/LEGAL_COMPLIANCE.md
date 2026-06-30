# Indian Legal Compliance & Governance - JR Interiors

This document outlines the legal compliance architecture implemented on `jrinteriors.in` to satisfy requirements under the laws of the Republic of India.

---

## 1. Compliance Frameworks Satified

### A. Digital Personal Data Protection Act 2023 (DPDPA)
- **Law**: Indian parliament's landmark data protection regulation.
- **Implementation**:
  - **Explicit Consent**: Integrated a required privacy policy acceptance checkbox in the consultation request form (`ConsultationForm.tsx`).
  - **Grievance Redressal**: Appointed Grievance Officer contact details displayed on the Privacy Policy page.
  - **Cookie Consent**: Custom consent manager (`CookieConsent.tsx`) restricts non-essential analytics tracking (Vercel Analytics wrapper) until consent is logged.

### B. Information Technology Act 2000 (Section 43A)
- **Law**: Regulates security practices and procedures for sensitive personal data.
- **Implementation**:
  - Encrypted communications (HTTPS enforced).
  - Secure session management using HMAC-signed cookies (`jr_session`).
  - Input validation and normalization schemas using Zod to prevent script injection vector bypasses.

### C. Consumer Protection (E-Commerce) Rules 2020 & CPA 2019
- **Law**: E-commerce and commercial transparency regulations.
- **Implementation**:
  - Prominent display of trade details on legal pages and in the footer.
  - Clear policies for Cancelation and Refund policies, specifically detailing constraints on bespoke, customized wooden furniture.
  - Estimated pricing disclaimer added to storefront summaries to prevent misleading price representations.

---

## 2. Active Compliance Pages
We have deployed the dynamic endpoint `/legal/[slug]` serving these structured compliance documents:
1. **Privacy Policy (`/legal/privacy`)**: Governs data collection, DPDPA rights, and contact details for the data grievance officer.
2. **Terms & Conditions (`/legal/terms`)**: Regulates disputes, website usage, and proprietary intellectual property.
3. **Cookie Policy (`/legal/cookies`)**: Describes functional and essential cookie usage.
4. **Refund Policy (`/legal/refund`)**: Details policies on bespoke, custom-made furniture.
5. **Cancellation Policy (`/legal/cancellation`)**: Governing consultation scheduling and commissioned production cancel windows.
6. **Disclaimer (`/legal/disclaimer`)**: Outlines natural timber variation illustrative disclaimers.
7. **Copyright Notice (`/legal/copyright`)**: Statement protecting proprietary spatial design assets.
8. **Accessibility Statement (`/legal/accessibility`)**: Public commitment to WCAG 2.2 AA standards.
