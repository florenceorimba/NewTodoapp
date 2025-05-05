import { CategoryManager } from "../../components/category-manager"

export default function CategoriesPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Manage categories to organize your tasks.</p>
      </div>

      <CategoryManager />
    </div>
  )
}
