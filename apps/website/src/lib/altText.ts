export type AltContext = "product" | "room" | "team" | "atelier" | "customer";

/**
 * Generates descriptive, SEO-optimized image alt text based on context.
 */
export const getAltText = (
  context: AltContext,
  name: string,
  material?: string
): string => {
  const baseText: Record<AltContext, string> = {
    product: `${name} by JR Interiors – luxury furniture India${material ? ` – ${material}` : ""}`,
    room: `${name} styled with luxury furniture from JR Interiors – artisanal interior design Jaipur`,
    team: `${name}, designer at JR Interiors`,
    atelier: `JR Interiors atelier in Jaipur – handcrafted luxury furniture studio`,
    customer: `${name}, customer of JR Interiors`,
  };
  return baseText[context];
};
