import { GenericTaxonomyPage } from "../../../../../features/taxonomy/components/generic-taxonomy-page";

export const metadata = {
  title: "Rooms — JR Control",
  description: "Manage room-based taxonomy for the storefront",
};

export default function RoomsPage() {
  return <GenericTaxonomyPage kind="ROOM" />;
}
