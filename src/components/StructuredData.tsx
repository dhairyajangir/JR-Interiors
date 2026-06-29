// components/StructuredData.tsx
export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "JR Interiors",
    "url": "https://jrinteriors.in",
    "logo": "https://jrinteriors.in/logo.png",
    "description": "Premium luxury furniture India handcrafted for calm, elegant living. Artisanal pieces with white-glove delivery and custom design services.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "telephone": "+91-96678-64262",
      "areaServed": "IN",
      "availableLanguage": ["English", "Hindi"]
    },
    "sameAs": [
      "https://instagram.com/jr_interiors_2024",
      "https://www.linkedin.com/company/jr-interiors"
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "JR Interiors",
    "image": "https://jrinteriors.in/atelier-hero.jpg",
    "description": "Luxury furniture and interior design showroom in Jaipur, Rajasthan. Handcrafted artisanal pieces with custom design services.",
    "url": "https://jrinteriors.in",
    "telephone": "+91-96678-64262",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Pno. 251 Nirmal Vihar, Dadi Ka Phatak, Jhotwara",
      "addressLocality": "Jaipur",
      "addressRegion": "Rajasthan",
      "postalCode": "302012",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "26.9124",
      "longitude": "75.7873"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "10:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "12:00",
        "closes": "18:00"
      }
    ],
    "priceRange": "₹₹₹",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "47",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What materials does JR Interiors use for luxury furniture?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We use FSC-certified timber, solid walnut, premium teak, high-resiliency soy-based foam, 100% cotton velvet, bouclé, and natural linen fabrics. All materials are sustainably sourced and built to last generations."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer custom furniture design services in Jaipur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. JR Interiors offers fully custom furniture design with complimentary in-home or virtual consultations. Our Jaipur-based design team works with clients across India to create bespoke pieces."
        }
      },
      {
        "@type": "Question",
        "name": "How long does delivery take for luxury furniture orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standard delivery is 7–14 business days. Custom or bespoke pieces take 4–6 weeks. All deliveries include white-glove in-home service, placement, and setup."
        }
      },
      {
        "@type": "Question",
        "name": "What is the price range for JR Interiors furniture?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our luxury furniture India collection starts at ₹42,000 for accent pieces and goes up to ₹1,95,000+ for signature modular sofas. Custom pieces are priced individually based on design and materials."
        }
      },
      {
        "@type": "Question",
        "name": "Can I visit the JR Interiors showroom in Jaipur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Our Jaipur Atelier is located at Pno. 251 Nirmal Vihar, Dadi Ka Phatak, Jhotwara, Jaipur, Rajasthan 302012. Call +91 96678 64262 or visit our website to book a consultation."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer interior design services beyond furniture?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. We offer full interior design services including space planning, colour consultation, material selection, and end-to-end project management. We serve homes and commercial spaces across Rajasthan and India."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
