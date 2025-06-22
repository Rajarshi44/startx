import { DisplaySM, BodyMedium } from "@/components/ui/typography";
import { Rocket } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-16 px-6">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-highlight rounded-xl flex items-center justify-center">
                <Rocket className="h-6 w-6 text-button" />
              </div>
              <DisplaySM className="gradient-text">StartX</DisplaySM>
            </Link>
            <BodyMedium className="text-text/70 max-w-md mb-6">
              Building the future of startup ecosystems with AI-powered tools
              and connections that matter.
            </BodyMedium>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-text">Platform</h4>
            <ul className="space-y-4">
              {["Features", "Pricing", "API", "Documentation"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-text/70 hover:text-highlight transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-6 text-text">Company</h4>
            <ul className="space-y-4">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-text/70 hover:text-highlight transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <BodyMedium className="text-text/60">
            © 2024 StartX. Building the future of startup ecosystems.
          </BodyMedium>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-text/60 hover:text-highlight transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-text/60 hover:text-highlight transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-text/60 hover:text-highlight transition-colors"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
