export default function CVEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen overflow-hidden bg-[#fefae0]">
      {children}
    </div>
  )
}
