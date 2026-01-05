import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Shield, Zap, Box, Scissors, Layers } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b backdrop-blur-sm fixed w-full z-50 bg-background/80">
        <Link className="flex items-center justify-center" href="#">
          <Box className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">SprueCrafter</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
            Pricing
          </Link>
          <Link href="/dashboard">
              <Button variant="ghost" size="sm">Log In</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 pt-12">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    Professional 3D Model <br />to Sprue Conversion
                  </h1>
                  <p className="max-w-[600px] text-zinc-200 md:text-xl dark:text-zinc-400">
                    Convert 3D object data into 1/35th scale model sprues optimized for resin printing. 
                    Rivals industry-standard quality from Meng and Takom.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Start Converting Free</Button>
                  </Link>
                  <Button variant="outline" size="lg">View Demo</Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 {/* Hero Visual Placeholder */}
                 <div className="relative w-full h-[350px] bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    <Box className="w-32 h-32 text-blue-500/50 animate-pulse" />
                     <div className="absolute bottom-4 left-4 bg-black/60 p-2 rounded text-xs text-mono text-green-400 border border-green-900/50">
                        &gt; Generating sprue... OK
                     </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-zinc-900/50 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-zinc-800 px-3 py-1 text-sm text-zinc-100">
                  Core Capabilities
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything you need for Sprue Generation</h2>
                <p className="max-w-[900px] text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  SprueCrafter handles the entire workflow from raw 3D file to print-ready resin plate.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              {[
                  { title: "Universal Conversion", desc: "Supports STL, OBJ, FBX, 3DS, PLY, GLTF, GLB.", icon: Box },
                  { title: "Smart Scaling", desc: "Auto-scale to 1/35th, 1/48th, or custom units.", icon: Layers },
                  { title: "Part Separation", desc: "AI-powered component splitting and categorization.", icon: Scissors },
                  { title: "Pro Sprue Gen", desc: "Industry-quality runners and gates.", icon: Zap },
                  { title: "Resin Optimized", desc: "Supports for Mars, Saturn, Jupiter, and more.", icon: Shield },
                  { title: "Photo to 3D", desc: "Create 3D models from photographs.", icon: Box },
              ].map((feature, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2 border-zinc-800 p-6 rounded-xl bg-zinc-900 border hover:border-blue-500/50 transition-colors">
                    <div className="p-2 bg-blue-900/20 rounded-full">
                        <feature.icon className="h-6 w-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-zinc-400 text-center text-sm">{feature.desc}</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple Pricing</h2>
              <p className="max-w-[600px] text-zinc-400 md:text-xl">
                Start for free, upgrade for professional power.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
                <div className="flex flex-col p-6 bg-zinc-900/20 border border-zinc-800 rounded-xl space-y-4">
                    <h3 className="text-2xl font-bold">Free Tier</h3>
                    <div className="text-4xl font-bold">$0<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                    <ul className="flex-1 space-y-2 text-sm text-zinc-400">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 10 conversions / month</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Basic formats (STL, OBJ)</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 1 GB Storage</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Community Support</li>
                    </ul>
                    <Button variant="outline" className="w-full">Get Started</Button>
                </div>
                
                <div className="flex flex-col p-6 bg-blue-950/10 border border-blue-500/50 rounded-xl space-y-4 relative">
                    <div className="absolute top-0 right-0 p-2 bg-blue-600 text-xs font-bold rounded-bl-xl rounded-tr-xl">POPULAR</div>
                    <h3 className="text-2xl font-bold text-blue-400">Pro Tier</h3>
                    <div className="text-4xl font-bold">$10<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                    <ul className="flex-1 space-y-2 text-sm text-zinc-300">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Unlimited conversions</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> All formats (FBX, STEP...)</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> 50 GB Storage</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Advanced Sprue Gen</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Priority Support</li>
                    </ul>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Subscribe Pro</Button>
                </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-black/20">
        <p className="text-xs text-zinc-500">© 2026 SprueCrafter. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-zinc-500" href="#">Terms of Service</Link>
          <Link className="text-xs hover:underline underline-offset-4 text-zinc-500" href="#">Privacy</Link>
        </nav>
      </footer>
    </div>
  )
}
