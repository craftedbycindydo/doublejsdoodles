import * as React from "react"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-center gap-4 py-10">
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-sm leading-loose text-muted-foreground">
            Built with love for amazing doodle puppies. © 2024 Double Js Doodles. All rights reserved.
          </p>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <a
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  )
}