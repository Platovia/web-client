import { redirect } from "next/navigation"

export default async function RestaurantContextPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/dashboard/restaurants/${id}?tab=context`)
}
