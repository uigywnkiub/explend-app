import WithSidebar from '@/app/ui/sidebar/with-sidebar'

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <WithSidebar contentNearby={children} />
}
