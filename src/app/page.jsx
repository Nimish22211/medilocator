import { Search, Stethoscope, Pill, Plus, ClipboardList } from "lucide-react"

const actions = [
  {
    title: "Search Medicine",
    description: "Find medicine by name",
    icon: Search,
    href: "/search",
  },
  {
    title: "Search by Symptoms",
    description: "Find medicines for your symptoms",
    icon: Stethoscope,
    href: "/symptoms",
  },
  {
    title: "Treatment Plans",
    description: "View predefined treatment plans",
    icon: ClipboardList,
    href: "/plans",
  },
  {
    title: "Add Medicine",
    description: "Add new medicine to inventory",
    icon: Plus,
    href: "/add-medicine",
  },
  {
    title: "Add Treatment Plan",
    description: "Create new treatment plan",
    icon: Pill,
    href: "/add-plan",
  },
]

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Medi Locator</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <a
            key={action.title}
            href={action.href}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <action.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{action.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
} 