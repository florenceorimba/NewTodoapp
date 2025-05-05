import { SettingsManager } from "../../components/settings-manager"

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your TodoApp experience and manage your data.</p>
      </div>

      <SettingsManager />
    </div>
  )
}
