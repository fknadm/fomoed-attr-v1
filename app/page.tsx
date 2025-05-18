import { GradientButton } from "@/components/ui/gradient-button"
import { ArrowRight, Users2, Crown } from "@/components/ui/icons"
import { MotionDiv, MotionH1, MotionH2, MotionP } from "@/components/ui/motion"
import { Navbar } from "@/components/ui/navbar"
import Link from "next/link"

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#0A0A0A]">
      <div className="animated-gradient-bg" />
      <Navbar />
      <main className="relative flex-1">
        <section className="relative space-y-8 py-12 md:py-16 lg:py-20">
          <div className="container relative flex max-w-[1200px] mx-auto flex-col items-center">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 text-center"
            >
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                <span className="text-gradient-primary">Everything</span>
                <br />
                <span className="text-white">You Need</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground sm:text-lg">
                Our platform is designed for everyone in the Web3 ecosystem. Select your role to
                discover how Fomoed can help you succeed.
              </p>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-[1000px] mt-12"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <Link 
                  href="/project-owners"
                  className="group rounded-xl bg-[#0A0A0A]/40 border-[#2A2625] border p-6 transition-all hover:border-[#C85627]/50 backdrop-blur-sm"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-4">
                      <Users2 className="h-8 w-8 text-[#C85627]" />
                      <h3 className="font-semibold text-xl text-white">Project Owners & Community Managers</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Track, analyze, and optimize your community growth with powerful attribution tools.
                    </p>
                    <div className="pt-4">
                      <GradientButton size="lg" className="w-full">
                        Launch Campaign
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </GradientButton>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/creators"
                  className="group rounded-xl bg-[#0A0A0A]/40 border-[#2A2625] border p-6 transition-all hover:border-[#C85627]/50 backdrop-blur-sm"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center space-x-4">
                      <Crown className="h-8 w-8 text-[#C85627]" />
                      <h3 className="font-semibold text-xl text-white">KOLs & Creators</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Monetize your influence and track your impact across Web3 projects.
                    </p>
                    <div className="pt-4">
                      <GradientButton size="lg" className="w-full">
                        Creator Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </GradientButton>
                    </div>
                  </div>
                </Link>
              </div>
            </MotionDiv>
          </div>
        </section>

        <section className="relative border-t border-[#2A2625] bg-gradient-card">
          <div className="container py-12 md:py-16 lg:py-20">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mx-auto max-w-[800px] text-center space-y-4"
            >
              <h2 className="text-2xl font-bold leading-tight tracking-tighter md:text-4xl text-white">
                Who is{" "}
                <span className="text-gradient-primary">Fomoed For?</span>
              </h2>
              <p className="text-muted-foreground">
                Join the ecosystem of innovative projects leveraging Fomoed for precise attribution and community growth.
              </p>
            </MotionDiv>
          </div>
        </section>
      </main>
    </div>
  )
}
