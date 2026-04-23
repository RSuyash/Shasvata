import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function ProductsPage() {
  redirect(ROUTES.dashboard.root);
}
