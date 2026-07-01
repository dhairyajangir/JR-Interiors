import { GenericTaxonomyPage } from "../../../../../features/taxonomy/components/generic-taxonomy-page";

export const metadata = {
  title: "Styles — JR Control",
  description: "Manage design style taxonomy for the storefront",
};

export default function StylesPage() {
  return <GenericTaxonomyPage kind="STYLE" />;
}
