import { LandingPage } from "./components/landing-page"

export default function Home() {
  // Test Tailwind classes
  return (
    <div className="p-8 min-h-screen  bg-background dark:bg-black">
      <LandingPage />
    </div>
  )
}
