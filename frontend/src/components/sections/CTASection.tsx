import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap } from "lucide-react"
import { Link } from "react-router-dom"

export function CTASection() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white border-0">
        <CardContent className="text-center py-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Ready to Start Trading Smarter?</h2>
            <p className="text-xl text-blue-100 dark:text-blue-200 max-w-2xl mx-auto">
              Join thousands of traders using AI to make better investment decisions.
            </p>
            <Button size="lg" variant="secondary" className="dark:bg-white dark:text-blue-600 dark:hover:bg-slate-100" asChild>
              <Link to="/chat">
                <Zap className="mr-2 h-4 w-4" />
                Start Free Analysis
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
