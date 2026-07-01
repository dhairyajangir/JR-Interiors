import { GenericTaxonomyPage } from "../../../../../features/taxonomy/components/generic-taxonomy-page";

export const metadata = {
  title: "Materials — JR Control",
  description: "Manage material classification taxonomy",
};

export default function MaterialsPage() {
  return <GenericTaxonomyPage kind="MATERIAL" />;
}
