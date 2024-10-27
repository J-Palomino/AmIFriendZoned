import './globals.css'

export const metadata = {
  title: 'Are you Friendzoned?',
  description: 'Find out if you are in the friendzone',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}