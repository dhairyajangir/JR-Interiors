export type LegalSection = {
  heading: string;
  content: string;
};

export type LegalDoc = {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export const LEGAL_DATA: Record<string, LegalDoc> = {
  privacy: {
    title: "Privacy Policy",
    description: "Privacy Policy for JR Interiors, complying with the Digital Personal Data Protection Act 2023 (DPDPA).",
    lastUpdated: "June 30, 2026",
    sections: [
      {
        heading: "1. Overview & Statutory Authority",
        content: "JR Interiors ('Atelier', 'we', 'us', or 'our') is an interior design studio based in Jaipur, Rajasthan, India. We are committed to protecting your personal data. This Privacy Policy details how we collect, store, process, and protect your personal information in strict compliance with the Digital Personal Data Protection Act 2023 (DPDPA), Information Technology Act 2000, and other applicable Indian regulations."
      },
      {
        heading: "2. Personal Data We Collect",
        content: "We collect only the personal information required to serve you and manage your spatial design selections. This includes:\n• Identity & Contact Details: Name, email address, mobile number, shipping address, and billing address.\n• Project Preferences: Selection logs of furniture pieces, room preferences, custom finishes, layout specifications, and messages submitted via our consultation forms.\n• Technical Metadata: Client IP addresses, cookie consent logs, browser types, and usage data via Vercel Speed Insights (subject to your consent)."
      },
      {
        heading: "3. Grounds for Processing Data",
        content: "We process your personal data on the following legal grounds under DPDPA:\n• Consent: Explicit consent provided by you when submitting contact, consultation, or newsletter forms, or choosing cookie preferences.\n• Contractual Obligations: Processing necessary to coordinate custom furniture fabrication, transport, and white-glove setup at your address.\n• Legal Compliance: Compliance with Indian tax laws (GST invoicing) and reporting requirements."
      },
      {
        heading: "4. Data Sharing & Third-Party Processors",
        content: "We do not sell or lease your personal information. We share data only with authorized service providers who facilitate our services (e.g. database hosting via Supabase, transaction logging, and logistics partners). All third-party processors are bound by strict data protection agreements to maintain data security and confidentiality."
      },
      {
        heading: "5. Data Security",
        content: "We implement robust technical and organizational security measures, including SSL/TLS encryption for data transmission, cookie security flags, strict Content Security Policy (CSP) headers, and role-based database access controls. We maintain audit logs of user modifications to prevent unauthorized access."
      },
      {
        heading: "6. Your Rights under DPDPA 2023",
        content: "Under Indian law, you have the following rights regarding your personal data:\n• Right to Access: Request a summary of personal data processed by us and the processing activities.\n• Right to Correction & Erasure: Request corrections to inaccurate details or request deletion of data that is no longer necessary for the purpose it was collected.\n• Right to Withdraw Consent: Withdraw your consent to data processing at any time by contacting our Grievance Officer.\n• Right to Grievance Redressal: Register a complaint regarding our processing activities."
      },
      {
        heading: "7. Contact & Grievance Officer",
        content: "For inquiries, corrections, or grievances regarding your data privacy, please contact our designated Grievance Officer:\nName: Grievance Officer\nEmail: concierge@jrinteriors.in\nAddress: PLOT NO 251, NIRMAL VIHAR, Benar Road, Dadi Ka Phatak, Jhotwara, Jaipur, Rajasthan 302012\nPhone: +91 94603 00750"
      }
    ]
  },
  terms: {
    title: "Terms & Conditions",
    description: "Terms and Conditions of service for JR Interiors.",
    lastUpdated: "June 30, 2026",
    sections: [
      {
        heading: "1. Acceptance of Terms",
        content: "By accessing or using the website https://jrinteriors.in ('Website') and our interior design services, you agree to comply with and be bound by these Terms and Conditions. These terms are governed by the laws of India, including the Information Technology Act 2000 and the Consumer Protection Act 2019. If you do not agree to these terms, please do not use the website or request services."
      },
      {
        heading: "2. Scope of Services & Website Nature",
        content: "JR Interiors is a premium architectural interior design studio and custom furniture atelier. The website displays portfolio galleries, catalog items, and design capabilities. The website is not a standard transaction-oriented e-commerce store. The storefront, selections, and checkout processes represent a lead-generation and quote-enquiry pipeline. No transaction or agreement is finalized until a signed project quote is issued by JR Interiors and a formal deposit is paid."
      },
      {
        heading: "3. User Accounts",
        content: "You may create an account on our website to save custom furniture selections, record addresses, and view your design request logs. You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate, current, and complete details."
      },
      {
        heading: "4. Intellectual Property",
        content: "All content on this website, including designs, illustrations, photographs, 3D renderings, texts, logos, icons, and software, is the exclusive intellectual property of JR Interiors and is protected by Indian Copyright and Trademark laws. Unauthorized reproduction, modification, or distribution of our designs and assets is strictly prohibited."
      },
      {
        heading: "5. Pricing & Estimates",
        content: "Pricing figures shown on the website represent standard configurations and starting estimates. Because each project is tailored, actual prices will vary based on customization (timber selection, dimensions, hardware, upholstery grade). JR Interiors reserves the right to modify pricing estimates at any time without prior notice."
      },
      {
        heading: "6. Disputes & Jurisdiction",
        content: "Any dispute, claim, or controversy arising out of your use of this website or our services shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act 1996. The place of arbitration shall be Jaipur, Rajasthan. The courts of Jaipur shall have exclusive jurisdiction over any legal matters."
      }
    ]
  },
  cookies: {
    title: "Cookie Policy",
    description: "Cookie Policy explaining how JR Interiors manages browser cookies.",
    lastUpdated: "June 30, 2026",
    sections: [
      {
        heading: "1. Use of Cookies",
        content: "We use browser cookies, local storage, and session storage to provide a secure and reliable experience, remember your preferences, and understand website traffic. Cookies help us keep you logged into your account, save items to your selections list, and protect forms against spam."
      },
      {
        heading: "2. Types of Cookies We Use",
        content: "We categorize cookies as follows:\n• Essential Cookies: Required for core website functions, security checks, and user sessions (e.g. 'jr_session' for authentication, and Turnstile tokens). These cannot be disabled.\n• Functional Cookies: Retain selections, user layouts, and theme preferences (e.g., saving address defaults).\n• Analytics Cookies: Used to gather aggregate statistics on traffic and performance (e.g., Vercel Analytics). These are loaded only after your explicit consent."
      },
      {
        heading: "3. Cookie Consent Management",
        content: "When you first visit our website, you are presented with a cookie consent banner. You can choose to 'Accept All', 'Reject Non-Essential', or customize your settings. You can edit your settings at any time by clicking the 'Cookie Preferences' link in our footer."
      }
    ]
  },
  refund: {
    title: "Refund Policy",
    description: "Refund and Return Policy for JR Interiors furniture and design services.",
    lastUpdated: "June 30, 2026",
    sections: [
      {
        heading: "1. Policy on Custom & Commissioned Furniture",
        content: "Every piece of furniture designed and fabricated by JR Interiors is custom-made to order in our Jaipur workshop. Because items are constructed based on client-specific dimensions, wood selection, and upholstery, we do not accept returns or offer refunds for custom furniture commissions once fabrication has commenced."
      },
      {
        heading: "2. Damage & Transit Coverage",
        content: "We provide white-glove shipping and installation to ensure that furniture is delivered in pristine condition. In the rare event that an item is damaged during transit:\n• The damage must be reported immediately to our delivery team at the time of delivery and installation.\n• Alternatively, please email concierge@jrinteriors.in with detailed photographs within 24 hours of delivery.\n• JR Interiors will evaluate the damage and arrange for repair, refinishing, or complete replacement of the damaged parts at no additional cost."
      },
      {
        heading: "3. Defective Craftsmanship",
        content: "We back our artisanal woodwork with a 10-year structural guarantee. If a structural defect in timber joinery or construction manifests under standard residential usage, we will inspect the item and perform necessary repairs or provide a replacement."
      }
    ]
  },
  cancellation: {
    title: "Cancellation Policy",
    description: "Cancellation policy for enquiries, consultation bookings, and orders.",
    lastUpdated: "June 30, 2026",
    sections: [
      {
        heading: "1. Enquiries and Design Selections",
        content: "Submitting an enquiry via the Selections pipeline or Contact form is non-binding and carries no financial obligation. You may cancel your enquiry or modify your selections at any time prior to signing the formal project proposal."
      },
      {
        heading: "2. Consultation Bookings",
        content: "Design consultations can be rescheduled or cancelled free of charge up to 24 hours before the scheduled time. Please notify us via email (concierge@jrinteriors.in) or phone (+91 94603 00750) if you need to adjust your consultation window."
      },
      {
        heading: "3. Commissioned Orders",
        content: "Once a project quote is signed and the deposit is paid, materials are procured and workshop scheduling begins. Cancellations are permitted within 24 hours of deposit payment. After 24 hours, cancellations will incur a fee equal to the cost of raw materials procured up to that point."
      }
    ]
  },
  disclaimer: {
    title: "Disclaimer Notice",
    description: "General disclaimers regarding website content, materials, pricing, and visual representations.",
    lastUpdated: "June 30, 2026",
    sections: [
      {
        heading: "1. Illustrative Representations",
        content: "All photographs, renders, 3D visualizations, and material swatches displayed on this website are for illustrative purposes. Wood is a natural product and exhibits variations in grain, texture, and color. Actual finishes, wood grain configurations, and textile colors will exhibit natural differences."
      },
      {
        heading: "2. Pricing and Estimations Disclaimer",
        content: "Pricing figures, cost ranges, and starting rates listed on this website are estimates. Final costs will vary based on customized specifications, regional tax configurations (GST), site difficulty, and shipping logistics. Official binding pricing will only be provided in a signed quotation."
      },
      {
        heading: "3. Information Accuracy",
        content: "While we make every effort to ensure the accuracy of content on this website, JR Interiors does not guarantee that the information is free from typographical errors, omissions, or delays. We reserve the right to correct any errors and update details without liability."
      }
    ]
  },
  copyright: {
    title: "Copyright Notice",
    description: "Official copyright protection statement for JR Interiors.",
    lastUpdated: "June 30, 2026",
    sections: [
      {
        heading: "1. Copyright Ownership",
        content: "© 2026 JR Interiors. All rights reserved. The website https://jrinteriors.in, including its structure, design layout, database models, source code, 3D design files, photographs, descriptions, and written content, is protected under the Copyright Act 1957 of India and international copyright treaties."
      },
      {
        heading: "2. Trade Information",
        content: "Trade Name: JR Interiors\nRegistered Address: PLOT NO 251, NIRMAL VIHAR, Benar Road, Dadi Ka Phatak, Jhotwara, Jaipur, Rajasthan 302012\nNo portion of our proprietary assets or designs may be extracted, copied, or utilized commercially without explicit written consent."
      }
    ]
  },
  accessibility: {
    title: "Accessibility Statement",
    description: "Accessibility Statement for JR Interiors, targeting WCAG 2.2 Level AA compliance.",
    lastUpdated: "June 30, 2026",
    sections: [
      {
        heading: "1. Commitment to Accessibility",
        content: "JR Interiors believes that the web should be accessible to everyone. We are committed to designing our digital atelier to be usable by individuals of all abilities, targeting Web Content Accessibility Guidelines (WCAG) 2.2 Level AA compliance."
      },
      {
        heading: "2. Implemented Features",
        content: "To ensure a premium accessible experience, we have implemented:\n• Semantic HTML structure for screen readers.\n• High color contrast ratios to meet readability thresholds.\n• Visible focus indicators and a Visible skip-to-content link.\n• Alt-text annotations on all design visualizations and structural images.\n• Support for reduced motion configuration flags to prevent animation-induced discomfort."
      },
      {
        heading: "3. Feedback & Contact",
        content: "If you encounter accessibility barriers or have suggestions for improving our digital experience, please contact us:\nEmail: concierge@jrinteriors.in\nPhone: +91 94603 00750"
      }
    ]
  }
};
