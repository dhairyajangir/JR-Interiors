import { PrismaClient, Prisma } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

// Original Stitch design assets, kept for visual fidelity.
const G = (id: string) => `https://lh3.googleusercontent.com/aida-public/${id}`;

const IMG = {
  heroLiving:
    "AB6AXuBciBzPaTq6kbG9gSV_q5irWYt3iDOu7ESbw38f8KsrmxZ0jPB33hBDty-7Bf7fpJOT6TcmSV42LksFZUlhyusS2Kg1GF24SXGC9lsOXKN-NDB2tbkVjf7mCpPP67YVQURg8XxqMK92GzU-Z-WOo9W3yAj_V4p94rIw-hHRiGqsfWMdpVnpVbZQ-HqM_zgyVCOCjqvPqcn2aqOcJm9KlqB0on6YbO9o6OcupxZlkl3aqrlontZzaP6ucT7ypQ-3ITsiiNf31pbbvLqB",
  livingFeature:
    "AB6AXuCyxLvTQvmjPXj9rQZvoRWXIm7dZyPid1NhbYi8PDyngyxaCtQw1PPqsosFIvLb28r1KsDaFQKMMi1KBaqKkiVR4pO6p1HAPHw6tSj_u4txvQQotXcl09WN62v_u7G_u1kfxXsnmjvi53Tqh21wmOnLMXcGtUYZQtHd54nwn4PFBGJckTgvmyStGNTBUNE197kJYQw7TT1_XK_fo3BDgHxKgUd7vtjkU95U7Hn8B-Qt6tnhVEOsC6jO0ae44j4jeDka63VryrYb2Uaz",
  bedroom:
    "AB6AXuA2nDZB2_BCMPXIh9QJzBo7fAcb_VHOaMyxcIAxkR58W1R6DhfsnB8t4rXo5wxQVbm-_OanDy9CJdeAHFBwMRrIP1dHthvYH3Kp3iyK2o3hPKHs--DTfcNNuMPvD6SaV5TAjhuBZlus8zFlSH7uV_iE_LbFcNreG9Iu9mKMVTCf91Xcf16KqgdMp2fUX9c4vrzM1FWiIMwfx9CC2HteTrnVxbubGZ-tIyMAxqvkzH0f0IfpdZjR7QTuAskIZ-yplcZ5vcyCbvHdJ_GW",
  dining:
    "AB6AXuADLt2hvce0Vz-NfKvUDviWZihp-t1ngXgAkWvNlzyWNzqRhFvFH8F4HxtpMxXbWnf_TNHhNSoTTgh1aTMCVg9dVPY8okbEJsAOjk5BXqi1b_cNQl7ba_qqENT097thHFQyx_sR3aVAd3VfER7pPbHjOUrH02AEzpFidWMtDct0_Uc7cUJKnL73SUkh762jKehjef-paEJmH-I5BukNDJb-qnrj72FcVp9YA_PfMhcqgsLEbFzULa0vNt3mDyG1ukUquiAKI3i7unT6",
  sloane:
    "AB6AXuAkc22okdWwtgXbTYT7yW45om7rQaKM5J89lbJlc-XykaUPneXUn4OdNX-BTHYlmn_ki3tlvBMTcJkT_GVJEpuVY2T2LTpGgQQrIQ-x_J8ywh_7pBfkboPZfInXkicJh7rHasJXRE4gI5Aea9RwW_gDLDrB5U6TiULgwavBEnf-7rgW6nlbqORjorwPp3ZcJ2G88EZqQz3JSU53mO8N7uVp0Gj1EBYG1k1xRqQ9IsC0MfDmGIBVgsdeMhojqCLhJ3hHc0OrprxP-A4f",
  petra:
    "AB6AXuA39dlQJoDTa_DsTFc5nSCwqt-Jvo4j9mhf8TEaBaTgTY-F7B3HGqsfalOIfCzHTgOl56VADL2vTDxrZG23wjn-RqPcC69Uyt6UBLfO7cTGNhDSxMMX4j-DMaqA9CxvgskMmKd0lpcS6bLiU_Qf3U_znY2J5BPCJBNKTYliNH47iuLqcW7Gc7ftFQhVc_cP0AAH597dXj8Qr88XWWP4GjNUDXWUnr1oA1b7lMOCiCoKETqQiNJ4FD71TY6zjFGlBopdqJz-At7R9ciJ",
  velvetModular:
    "AB6AXuBtDIvoO6kKianm8ZdBsYgulORFpg3q3z0uDMl79bDmNjewNl47QwVH9HkvZixW43_JKYI_pfUXiXLGuFSC-shL2_BUHVE_Ya2n71DEIenyHZRwVZEua72aH3m5tGIVECb-BIu6DZ4mNEMl_A0np2RXbZZkG2E4VJ_75piBAPRpRl1hwYwqXWV1HUAayJpK-Hnvd5JbDwT89Y0V-whQogGyi_5NGV6xLt3bFBOLrC0aGZFTqvglMQimGR_a7bF94oT_eBuXHAETv8e3",
  horizonLamp:
    "AB6AXuC6UYqnMiT4LrzUEd3kOKjh_O1il9-lS9ipeUuTE1ZJ1iBckXEO4LoG0OhM8az2W2FhjubONpJeyK_p6ulcaOiDvYuNXLI5FNREpm7p14w9wbPPrC9MeX-7Bg1IFVaoyhXycxse0yhSk7DvasC1OgLel-d0mwtYZgFRze4B4QygqmfWFYntKkjrfBsdi4umFQeCYwVNN9T-DVZBBbFgatw34sAWEQUtl1qQR3eoPJPC0lAecNijPc1ETH8szykAEfGWlEuOVLQWWsxz",
  consultation:
    "AB6AXuBDZI4IUtfnvmNOBcHcK-yrjKXGbSpESO4hEb_YsslCx4VW2se4BWJNmumZutJ9nsTEaiGfzn2ge3voj9ytDzBanxV_EkfNptXBT5lwlfltKkli5LPi8xrHRKRAngbhblJ5-cnBHPkDvQ9MrmlLZgdw7Z4gEBypg8BlM-98VrxMFvTEeeENs-cArFQiGIv7BMfL_AmmOmeUq-QvwEeFeR-YUFJIuP9GTTBNCEne5d-VFlQyByltJjAD4lisMCCC4pQ_y_rvHiof_Jt-",
  // Furniture grid
  aurelius:
    "AB6AXuCkgwXlh6WOlPbx3cGRtDayK35YySCQU53Kt3Yk74vKZ_L7KleSJJR03CaJE6iZ03tvpYvPkr8jLbkvK6O6SGciM-nEDTcU7wLNHFQKlKKil9gdQudcQW0mubdN0E5ZpReguhDeR1oUGH3dOSNYD0lKKMkcFeEYPM-oO_MMqtTrAx5M8aStP1fHxEskfMbl20AaFFwAHOTm4d15mY43foRHAwncJgFLBn_Rx6lInUQ9kBNNkLHqn3mDo3YkP24OecsnaXjZZfMRAgXX",
  luna:
    "AB6AXuDnIzjkbBdxR_vcjR--xu8AzqIRzSHs-0UNBPHOUvMMXRXm1O_N1h_4rFvl0NEVCmsmBtXjaZcKl2ARZ1V036lX648FuMWPiybBKb4Ae11TCigb5-CEtUD1IZ_Crlm80SStSslic2ion3P2e7Xptev1PRF6z-qJVTBrxR1YHsu9BEQw002dEY9hBVdR3p3jsTRFw5oVahrxeCNe5PH2DRM9xDy0HDf0UaE4BMiW66uH9tw4Rx2SwIR0NmLam1jbR2-WLvm4kY1sszY-",
  sculpt:
    "AB6AXuAiZ5_BLGi7DLI-AqjgiQAeyGf-k54swbisACgo3OO-62407IpXPi5wWQBtDqODtl0_tbJVyJmamASu5OpS0O95QW_d_zzqCfGahHKLv08GWYvv4SF79HkoOTb9H4HUm7vqmUCB6YLcYHvGWxJW_PfW5mtoa2CsFhTCvZs6JM3YzCZCDstkSbLLXaF7bnvMN-52rO4yXiyi9hSJPj50Td4LWvl2FStkTrhKtvqL2gRNIFszD4F-U1iM5S7PmIoNfpzysqd70uKd8bgV",
  velvetDusk:
    "AB6AXuDOIVXe7IJXw6sNKue_tAKBEL79u_zxvp5YeOvyDOXCnHA7aJaQuHsbfOG07Xci1TRinmZ_pjwvWhOl9NS2Vp3wYMaACgksqFeo3YutSVbhCFqW4OaGyi4TTB_Qxa1W2jQbDFWhHKqdXk2lEZgCad1OctUpkVJI2pT6USpTSjUeDNIkegjCBPSSS2mHwNb-Nzy62gD8NAlbKnz6YVYM0dGtQmtyIMcefVOu3kwEHW_-kYVdkHnirj-9bIWcq9PSPnWf5FqXGBCNGJme",
  drift:
    "AB6AXuCfLr7BcmQ12Hiiu9UJyuDKP6C_0UxZdbvYhTs91l7NNXu4UOTJQWC0NAivWy-z1QbHy6jYCeV43dmiBF4sVXBTm_vZYdvj4wLCEC_ib2ZEYq3kbOnm7EG-5RJ3EuUhBInOogQtl95C_pCo_aWuhFG2ZOLEy2LrQGC_j5jkVjybd5jy8enSlfbFcAKwm31YPq2V7hlhs5Iqv2iG-b1vSTc3vFDXkWhCZwM5cOyQTJkdu2xTkpWq7cYxoJVvRZ7a2ykthgfrmtViz6D2",
  officer:
    "AB6AXuD58B0h06J5p-MJkoN1FWhDBU9bEWSrW1cZqJPETbUG23gAQhJGDjOp_OchqmAha26mQXzpGNHW2-gseYtu0ON31hOc8xER1Rb0IEMxmBWtoVBKlWGEkic5bcXNKFxpL2R0cM8cun_odrD8nxOx2M1Tty_UHAHkXI8kJnETfQJHZV3IBYSisZDW0JbOGbTNIrWZiJV1jhdjNjjzBsReobyWOCDMm-jiCoNx_T_m6TA9yNO3VG3sZCWDqEuR95RPvQueqldyl1Cvq_-S",
  haven:
    "AB6AXuCjV9_5Siumy2h5lIL_Zdo-9jPyRpEPWTZoEtzJnKM1We563YHmFFCuunimX0FgoTOggvAqjIs_SkBl415OvzqDw1Sjn2Yg0g_R68xaWXg9D9w3Mr-ODD8Mz_3pXkTFVQoEHiPb-ZH6G3w2hRDqqDYRKZeyx1WbV0f-zGOvd1dYAAu-2LA1Dtrouyi_CFHBsL2i_QElWl-cFD-jFP-Wyxs-1vy1A7VZe3V3NvV8OHUBCsxAwcgNajykoR0HrtqDwE6Gvw4GYLPHVRVB",
  linear:
    "AB6AXuAgZfuvG3Angcq_3_akyND2DYLO8sNFURrPCURQym3uiJEZAos9V36w-yQilbqdVBF1TWcFkuUsczD_A1XHEcjxgPpkamRGB4Gt6OtrKa8QK7JJk34RfmTR0tjv8TX6jP9wD_EB5nSuW_fwEs7XDxP0dUJ4je86ZVEKrMnsX_TD7pJreGUfKzy4Lt1e_nJzVZsswYECMywXIawZl5oNDIhUW5gK0Ss381MmEXPQMZ8vZwHu-1sUJorZp14I39CBWrD-MgHAdAZFvgPV",
  // Solstice gallery
  solstice:
    "AB6AXuBuSi7X9L19YKJa6u8N-jJOJbP79DIJhf8XO9lnqV_4UziheylOdkPNZNeOck5Dkd7BpPSo2h60SPFSUY7VA6fk8ukjAqvc3vzGCY1D3JfX4F7bGLa2BKEYcRDiiiGg8cGhrlp6aEXCaS_7_Lr3H4tlbQKUXpjax-2gEF46WC-CoJAZXn70GFnL-652GaMYa6CAFJxZd4qri2EzB68kSrfWmesJLgeD9siFWev_u5NHHKVlU9_O_--HoBThncJjTIrQJiBwClPen0AX",
  solstice2:
    "AB6AXuA8zdHl-uMxGcSk7pCTjf0w4HkK-52KAiHkicnCRo5KelVrPcyiDmQKsUC4_nIMcTudlA0y7dGNOmpD0_CqH5t2QBYTAgNPt5IR7cxrTWdhBzcV9y8BW8uY_KEierpelznIG-bN8OlL957Hy993ZMO33hHOWJXpH7PoZDvlnAkpGlc2TpFiVE00bPRuoEtKE8tVAaGoY76_h-om9_8_rdTz4OZmBGA590oOhxFYKoOt9_0wsEGYfDFOvwITYI-Td3ywmii5QDSWBJjY",
  solstice3:
    "AB6AXuBUjG3wIkSl5WM3ba1s6KTYFR_aMz9XDYI-WO4i8HLm92KRuxkS0FIRrrM3h75ItWlusExYYs_yyI6GaKXZfPJ7DWTH6zxnEkUqhEtpIT911-b3N7WvDJLLK64wb72y2-KFdr65AID8VRWgkYqLQkZqTP2qffgFGNcfP1NRbhZ5PGxQ2-41dvXhRY_Eu8A2ypGW0hKBab_XxqO-dnNTdD3pK2raA8DnuehNVvfzvhdEH-LfJZBlZ7l5l84dmVD8_mA1R2h6OL5ynEoC",
  solstice4:
    "AB6AXuCtWVRWuXbOei8WK_cjFnBx-qtg-LdSmYUOseEVLicKRtjR1Pdxj688iqbwZBNSQs2QiDgLY4pWKOfD8KedzcLRXQlmNcrng3zNi3yv6ONEJchWi7R-YjFZu5c-GY0TmvfGNZY6ZQK0-ek7h-UJB299t_TorP_OEfPc1wZrIoR8_qc6luqSQ7xj35ZHEaS6Iy45n1EcVYshiiXIApPiNfgNPFeUyq1O8xX-vRR_jFYwdf4RcEMEb-ZxF11xPSYl2WUxyqmywgR2_ov-",
  // Related / accessories
  stark:
    "AB6AXuCKl4K_XGmCBibcY_k7d4wLVkMJyz1ldN92yTTe1ywLLiJqSjvMQOuCjMHhvDowxz0G9pOtuE8Sb6z9PSN_tOdmnAS2Va4kc8pXY_sZPefIe-MIjFB41d1Sh9ljj29alnqcSZKDfslRfzXzgYUYJvZ0PQM9p6qfq_peFmA9auqbHpuzyrfIRyTnm6SiaE6X3VxpckeCEIo-eVWw0aqqww8b8ZIiUfd_QuFJgeyVHpN5YX0kZ5gBoisSKSyMxysnNIGBOG174TTshC4s",
  aurora:
    "AB6AXuB0IzTNugijKQjJFpiC1nUqynCRE-erT1EBclZbgeeyZTL8NJangxH10Oz_hRpstgexstZPMtN6gt63i0XDXe6moL0wNdm0DasZDKu5CpJlJrlFP61oiMeAm1uKYmjyGEM7tDs77VPwoZM00Bd2h5ZUtxvTvXJNixff1f6yeo6ubomkAorpbwYWUfKxEOvxc_yKkaXNPmmuQY7SaX9Hq9IlYhUxKJ90bgOkGLM38-jMZBfC3yV1hBQ6AdfKnSUJWckKECN-gAtG6SDx",
  rug:
    "AB6AXuBUW_FjS93KT5ZoLaUlmmgif7KXHNlJZoaenJWqEqJf1qjZUCl8SCCTYDpywxi4_LxswGMfiIBWl1luryj8TwL7GZb-4Sz6-PR9vna_8bUZcCWyt5-VFLFKeCK8ymGnHqoU4XMKqqNrmcDpBUtQ-yEZKlLv8VqOfOKk0zXv4dooY0nl2mNfWhJulnEsYUFTZ3LPc3v_F3z0t8uU5iRiJOIr8_5rFNsTuBAljxHlwFsOolULht3blVs5Y2myliHx_t2T6OX4Q8W2mSVC",
  vase:
    "AB6AXuAC97d0Mi_vjc8NjGskCkOiox4xnQdP8WHlK8rFzWOciWHW6OPx6nRidW9BHGZkkCU2K3AOpcotfp1hn1pqZUJUSnO7cMs30CoH4LPVxSdJHnUtmG1hn8KsheyPZ5xnC4cixxZRsewW0xg4n8ezxJkUI2RFjTshUGELvTF3k2BVxQMA_CXJDL-jTBqr_Tz4dwx2WdjOweyFdRpVKxxgdaNlJ3TR-sGdehGfYH_mVk4m93Vv5YTRlaSIkbxspxIVnaUNHPOyJsIFNENJ",
};

type Seed = {
  slug: string;
  name: string;
  tagline: string;
  series?: string;
  description: string;
  priceCents: number;
  material: string;
  room: string;
  type: string;
  image: string;
  gallery?: string[];
  finishes?: { name: string; hex: string }[];
  upholstery?: string[];
  colorHexes?: string[];
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  signature?: boolean;
};

const WALNUT = "#513726";
const CHARCOAL = "#303030";
const COGNAC = "#8B5E3C";
const CREAM = "#F8F6F2";
const TAUPE = "#81756d";

const PRODUCTS: Seed[] = [
  {
    slug: "solstice-lounge-chair",
    name: "Solstice Lounge Chair",
    tagline: "Walnut / Linen",
    series: "Artisanal Living Series",
    description:
      "Handcrafted from sustainably sourced American Walnut and upholstered in Belgian linen. The Solstice Lounge Chair is a sanctuary of comfort, blending mid-century silhouettes with contemporary ergonomics. Each joint is traditionally mortise-and-tenon connected by master carpenters.",
    priceCents: 8500000,
    material: "Solid Walnut",
    room: "Living",
    type: "Seating",
    image: G(IMG.solstice),
    gallery: [G(IMG.solstice), G(IMG.solstice2), G(IMG.solstice3), G(IMG.solstice4)],
    finishes: [
      { name: "Natural Walnut", hex: WALNUT },
      { name: "Charcoal", hex: CHARCOAL },
      { name: "Cognac", hex: COGNAC },
    ],
    upholstery: ["Oatmeal", "Charcoal", "Olive"],
    colorHexes: [WALNUT, CHARCOAL, COGNAC],
    rating: 4.9,
    reviewCount: 124,
    featured: true,
    signature: true,
  },
  {
    slug: "aurelius-lounge-chair",
    name: "Aurelius Lounge Chair",
    tagline: "Walnut / Linen",
    description:
      "A minimalist solid walnut lounge chair with soft cream linen cushions. Clean, luxurious lines that emphasize rich wood grain and a sanctuary-like calm.",
    priceCents: 9800000,
    material: "Solid Walnut",
    room: "Living",
    type: "Seating",
    image: G(IMG.aurelius),
    colorHexes: [WALNUT, CREAM],
    rating: 4.8,
    reviewCount: 86,
    featured: true,
  },
  {
    slug: "luna-dining-table",
    name: "Luna Dining Table",
    tagline: "Solid Oak",
    description:
      "An elegant minimalist dining table in light oak with soft rounded corners and tapered legs. Sophisticated, calm, and grounded in natural materials.",
    priceCents: 14500000,
    material: "Oak Veneer",
    room: "Dining",
    type: "Tables",
    image: G(IMG.luna),
    colorHexes: [CREAM, TAUPE],
    rating: 4.7,
    reviewCount: 52,
  },
  {
    slug: "sculpt-credenza",
    name: "Sculpt Credenza",
    tagline: "Walnut / Brass",
    description:
      "A sculptural walnut sideboard with intricate textured front panels and slim brushed-brass handles. A statement of tactile modernist craftsmanship.",
    priceCents: 16500000,
    material: "Brushed Brass",
    room: "Living",
    type: "Storage",
    image: G(IMG.sculpt),
    colorHexes: [WALNUT, "#b08d57"],
    rating: 4.9,
    reviewCount: 41,
  },
  {
    slug: "velvet-dusk-sofa",
    name: "Velvet Dusk Sofa",
    tagline: "Velvet / Charcoal",
    description:
      "A deep charcoal velvet sofa with clean lines and walnut legs. Soft shadows dance across the velvet, turning any living space into a quiet sanctuary of calm luxury.",
    priceCents: 22500000,
    material: "Italian Leather",
    room: "Living",
    type: "Seating",
    image: G(IMG.velvetDusk),
    colorHexes: [CHARCOAL, WALNUT],
    rating: 4.9,
    reviewCount: 73,
    featured: true,
  },
  {
    slug: "drift-coffee-tables",
    name: "Drift Coffee Tables",
    tagline: "Stone / Steel",
    description:
      "A set of minimalist nesting coffee tables with light stone tops and slim metal frames. Airy, clean, and tactile — high-end artisanal quality.",
    priceCents: 6200000,
    material: "Stone",
    room: "Living",
    type: "Tables",
    image: G(IMG.drift),
    colorHexes: [CREAM, "#9a9a9a"],
    rating: 4.6,
    reviewCount: 29,
  },
  {
    slug: "officer-task-chair",
    name: "Officer Task Chair",
    tagline: "Cognac Leather",
    description:
      "A contemporary task chair in cognac leather with a polished walnut frame. A fusion of ergonomic comfort and timeless craftsmanship for the home office.",
    priceCents: 4800000,
    material: "Italian Leather",
    room: "Office",
    type: "Seating",
    image: G(IMG.officer),
    colorHexes: [COGNAC, WALNUT],
    rating: 4.7,
    reviewCount: 64,
  },
  {
    slug: "haven-platform-bed",
    name: "Haven Platform Bed",
    tagline: "Walnut / Taupe",
    description:
      "A modern platform bed with a tall upholstered headboard in soft taupe fabric and a visible walnut frame. Serene and grounded, built for restful nights.",
    priceCents: 18500000,
    material: "Solid Walnut",
    room: "Bedroom",
    type: "Bedroom",
    image: G(IMG.haven),
    colorHexes: [WALNUT, TAUPE],
    rating: 4.8,
    reviewCount: 38,
  },
  {
    slug: "linear-bookshelf",
    name: "Linear Bookshelf",
    tagline: "Natural Ash",
    description:
      "A tall minimalist bookshelf with asymmetrical shelves in solid ash. Clean joinery and a geometric silhouette for the modern study.",
    priceCents: 7200000,
    material: "Oak Veneer",
    room: "Studio",
    type: "Storage",
    image: G(IMG.linear),
    colorHexes: [CREAM, TAUPE],
    rating: 4.6,
    reviewCount: 22,
  },
  {
    slug: "sloane-boucle-lounge",
    name: "Sloane Bouclé Lounge",
    tagline: "Bouclé / Cream",
    description:
      "Enveloping bouclé upholstery over a sculpted frame. The Sloane invites you to slow down — a serene centrepiece for the calm living room.",
    priceCents: 7800000,
    material: "Italian Leather",
    room: "Living",
    type: "Seating",
    image: G(IMG.sloane),
    colorHexes: [CREAM, WALNUT],
    rating: 4.9,
    reviewCount: 58,
    signature: true,
  },
  {
    slug: "petra-stone-table",
    name: "Petra Stone Table",
    tagline: "Travertine",
    description:
      "A solid travertine occasional table with a honed finish. Quiet mass and natural veining make it a tactile anchor for any room.",
    priceCents: 4200000,
    material: "Stone",
    room: "Living",
    type: "Tables",
    image: G(IMG.petra),
    colorHexes: [CREAM, TAUPE],
    rating: 4.7,
    reviewCount: 31,
    signature: true,
  },
  {
    slug: "velvet-modular-sofa",
    name: "Velvet Modular Sofa",
    tagline: "Velvet / Sage",
    description:
      "A generous modular sofa in soft sage velvet. Reconfigure to suit the room; sink in for the evening. Comfort engineered for a life in balance.",
    priceCents: 19500000,
    material: "Italian Leather",
    room: "Living",
    type: "Seating",
    image: G(IMG.velvetModular),
    colorHexes: ["#58624d", WALNUT],
    rating: 4.8,
    reviewCount: 47,
    signature: true,
  },
  {
    slug: "horizon-brass-lamp",
    name: "Horizon Brass Lamp",
    tagline: "Brushed Brass",
    description:
      "A slender brushed-brass desk lamp with a warm directional glow. Understated metalwork for the considered workspace.",
    priceCents: 1450000,
    material: "Brushed Brass",
    room: "Studio",
    type: "Lighting",
    image: G(IMG.horizonLamp),
    colorHexes: ["#b08d57", CHARCOAL],
    rating: 4.5,
    reviewCount: 19,
    signature: true,
  },
  {
    slug: "stark-side-ottoman",
    name: "Stark Side Ottoman",
    tagline: "Oak",
    description:
      "A compact oak-framed ottoman that doubles as a side perch. Pairs effortlessly with the Solstice Lounge Chair.",
    priceCents: 2200000,
    material: "Oak Veneer",
    room: "Living",
    type: "Seating",
    image: G(IMG.stark),
    colorHexes: [CREAM, WALNUT],
    rating: 4.6,
    reviewCount: 27,
  },
  {
    slug: "aurora-floor-lamp",
    name: "Aurora Floor Lamp",
    tagline: "Matte Black",
    description:
      "A sleek arched floor lamp with a wide metallic dome shade. Warm, inviting light for the refined reading nook.",
    priceCents: 1850000,
    material: "Brushed Brass",
    room: "Living",
    type: "Lighting",
    image: G(IMG.aurora),
    colorHexes: [CHARCOAL, "#b08d57"],
    rating: 4.7,
    reviewCount: 44,
  },
  {
    slug: "horizon-wool-rug",
    name: "Horizon Wool Rug",
    tagline: "Hand-knotted Wool",
    description:
      "A hand-knotted wool rug with a subtle geometric pattern in cream and muted sage. A soft, tactile foundation for the minimalist room.",
    priceCents: 5500000,
    material: "Wool",
    room: "Living",
    type: "Decor",
    image: G(IMG.rug),
    colorHexes: [CREAM, "#58624d"],
    rating: 4.8,
    reviewCount: 35,
  },
  {
    slug: "terraform-vase-trio",
    name: "Terraform Vase Trio",
    tagline: "Ceramic",
    description:
      "Three minimalist ceramic vases of varying heights in soft earth tones — terracotta, sand and charcoal. Quiet luxury, artistically curated.",
    priceCents: 980000,
    material: "Ceramic",
    room: "Studio",
    type: "Decor",
    image: G(IMG.vase),
    colorHexes: ["#c08457", CREAM, CHARCOAL],
    rating: 4.5,
    reviewCount: 16,
  },
];

const CATEGORIES = [
  {
    slug: "living-room",
    name: "Living Room",
    kind: "room",
    room: "Living",
    description: "Functional art for the heart of the home.",
    image: G(IMG.livingFeature),
    sortOrder: 1,
  },
  {
    slug: "bedroom",
    name: "Bedroom",
    kind: "room",
    room: "Bedroom",
    description: "Sanctuaries built for restful nights.",
    image: G(IMG.bedroom),
    sortOrder: 2,
  },
  {
    slug: "dining-room",
    name: "Dining Room",
    kind: "room",
    room: "Dining",
    description: "Gather around pieces made to last generations.",
    image: G(IMG.dining),
    sortOrder: 3,
  },
  {
    slug: "studio-office",
    name: "Studio & Office",
    kind: "room",
    room: "Studio",
    description: "Considered tools for focused work.",
    image: G(IMG.linear),
    sortOrder: 4,
  },
];

const SOLSTICE_REVIEWS = [
  {
    author: "Eleanor L.",
    initials: "EL",
    rating: 5,
    body:
      "The comfort level is unmatched. It fits perfectly into our reading corner. The walnut is stunning.",
  },
  {
    author: "Marcus T.",
    initials: "MT",
    rating: 5,
    body:
      "Exceptional craftsmanship. You can feel the quality the moment you sit down. Worth every penny.",
  },
  {
    author: "Priya N.",
    initials: "PN",
    rating: 4,
    body:
      "Beautiful piece and the linen is gorgeous. Delivery was white-glove and on time.",
  },
];

async function main() {
  console.log("Clearing existing data…");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.address.deleteMany();
  await prisma.seller.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  console.log("Seeding demo user…");
  await prisma.user.create({
    data: {
      email: "demo@jrinteriors.in",
      passwordHash: hashPassword("password123"),
      fullName: "Aarav Sharma",
      phone: "9876543210",
      role: "ADMIN",
      addresses: {
        create: [
          {
            label: "Home",
            fullName: "Aarav Sharma",
            line1: "12 Bandra Heights, Linking Road",
            line2: "Bandra West",
            city: "Mumbai",
            region: "Maharashtra",
            postalCode: "400050",
            country: "India",
            phone: "9876543210",
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log("Seeding categories…");
  const catByRoom = new Map<string, string>();
  for (const c of CATEGORIES) {
    const created = await prisma.category.create({
      data: {
        slug: c.slug,
        name: c.name,
        kind: c.kind,
        description: c.description,
        imageUrl: c.image,
        sortOrder: c.sortOrder,
      },
    });
    catByRoom.set(c.room, created.id);
  }

  console.log("Seeding products…");
  for (const p of PRODUCTS) {
    const product = await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        series: p.series ?? null,
        description: p.description,
        priceCents: p.priceCents,
        material: p.material,
        room: p.room,
        type: p.type,
        imageUrl: p.image,
        images: p.gallery ?? [p.image],
        finishes: (p.finishes ?? []) as unknown as Prisma.InputJsonValue,
        upholstery: p.upholstery ?? [],
        colorHexes: p.colorHexes ?? [],
        rating: p.rating ?? 0,
        reviewCount: p.reviewCount ?? 0,
        featured: p.featured ?? false,
        signature: p.signature ?? false,
        categoryId: catByRoom.get(p.room) ?? null,
      },
    });

    if (p.slug === "solstice-lounge-chair") {
      await prisma.review.createMany({
        data: SOLSTICE_REVIEWS.map((r) => ({ ...r, productId: product.id })),
      });
    }
  }

  console.log("Seeding demo seller + listings…");
  const sellerUser = await prisma.user.create({
    data: {
      email: "seller@studiooak.in",
      passwordHash: hashPassword("password123"),
      fullName: "Riya Mehta",
      role: "SELLER",
      seller: {
        create: {
          brandName: "Studio Oak",
          slug: "studio-oak",
          bio: "Small-batch lighting & soft furnishings, handmade in Jaipur.",
        },
      },
    },
    include: { seller: true },
  });
  const sellerId = sellerUser.seller!.id;

  await prisma.product.create({
    data: {
      slug: "oslo-reading-lamp",
      name: "Oslo Reading Lamp",
      tagline: "Brushed Brass",
      description:
        "A slim brushed-brass reading lamp with a pivoting head and warm dimmable glow. Hand-assembled by Studio Oak.",
      priceCents: 1650000,
      material: "Brushed Brass",
      room: "Studio",
      type: "Lighting",
      imageUrl: G(IMG.aurora),
      images: [G(IMG.aurora)],
      colorHexes: ["#b08d57", CHARCOAL],
      stock: 12,
      inStock: true,
      status: "PUBLISHED",
      sellerId,
      categoryId: catByRoom.get("Studio") ?? null,
    },
  });

  await prisma.product.create({
    data: {
      slug: "nordic-linen-pouffe",
      name: "Nordic Linen Pouffe",
      tagline: "Wool / Oatmeal",
      description:
        "A hand-stitched wool pouffe in oatmeal — doubles as a footrest or extra seat. Awaiting approval.",
      priceCents: 1200000,
      material: "Wool",
      room: "Living",
      type: "Seating",
      imageUrl: G(IMG.stark),
      images: [G(IMG.stark)],
      colorHexes: [CREAM, TAUPE],
      stock: 20,
      inStock: true,
      status: "PENDING",
      sellerId,
      categoryId: catByRoom.get("Living") ?? null,
    },
  });

  console.log("Seeding sample orders and consultations...");
  const sampleUser = await prisma.user.findUnique({
    where: { email: "demo@jrinteriors.in" },
  });
  const publishedProducts = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    take: 2,
    orderBy: { createdAt: "asc" },
  });

  if (sampleUser && publishedProducts.length >= 2) {
    await prisma.order.create({
      data: {
        number: `JR-${new Date().getFullYear()}-110001`,
        userId: sampleUser.id,
        email: sampleUser.email,
        fullName: sampleUser.fullName,
        phone: sampleUser.phone,
        address1: "12 Bandra Heights, Linking Road",
        address2: "Bandra West",
        city: "Mumbai",
        region: "Maharashtra",
        postalCode: "400050",
        country: "India",
        shippingType: "standard",
        subtotalCents: publishedProducts[0].priceCents + publishedProducts[1].priceCents,
        shippingCents: 0,
        taxCents: 0,
        totalCents: publishedProducts[0].priceCents + publishedProducts[1].priceCents,
        status: "processing",
        paymentMethod: "razorpay",
        paymentStatus: "paid",
        items: {
          create: publishedProducts.map((product, index) => ({
            productId: product.id,
            name: product.name,
            priceCents: product.priceCents,
            quantity: 1,
            imageUrl: product.imageUrl,
            sellerId: product.sellerId,
            itemStatus: index === 0 ? "fulfilled" : "pending",
          })),
        },
      },
    });

    await prisma.consultation.createMany({
      data: [
        {
          userId: sampleUser.id,
          name: sampleUser.fullName,
          email: sampleUser.email,
          phone: sampleUser.phone,
          projectType: "Whole home",
          message: "Need help planning living and dining spaces before festive season.",
          status: "NEW",
        },
        {
          userId: sampleUser.id,
          name: "Naina Kapoor",
          email: "naina@example.com",
          phone: "9810012345",
          projectType: "Single room",
          message: "Looking for bedroom refresh with custom storage and warm lighting.",
          status: "CONTACTED",
        },
      ],
    });
  }

  console.log("Updating category counts…");
  for (const [room, id] of catByRoom) {
    const count = await prisma.product.count({ where: { room, status: "PUBLISHED" } });
    await prisma.category.update({ where: { id }, data: { itemCount: count } });
  }

  const total = await prisma.product.count();
  console.log(`Done. ${total} products, ${CATEGORIES.length} categories, 1 demo seller.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
