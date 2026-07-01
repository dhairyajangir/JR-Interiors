import { GenericTaxonomyPage } from "../../../../../features/taxonomy/components/generic-taxonomy-page";

export const metadata = {
  title: "Finishes — JR Control",
  description: "Manage surface finish taxonomy for the storefront",
};

export default function FinishesPage() {
  return <GenericTaxonomyPage kind="FINISH" />;
}
