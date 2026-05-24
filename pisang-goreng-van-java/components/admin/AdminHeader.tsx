'use client'
// components/admin/AdminHeader.tsx
interface Props {
  title:    string
  subtitle?: string
  action?:  React.ReactNode
}

export default function AdminHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-brown-700">{title}</h1>
        {subtitle && <p className="text-sm text-brown-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
