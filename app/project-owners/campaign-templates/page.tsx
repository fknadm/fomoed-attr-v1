import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function CampaignTemplatesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <FileText className="h-8 w-8 text-[#C85627]" />
        <h1 className="text-3xl font-bold">Campaign Templates</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            We're working on bringing you campaign templates to streamline your workflow.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-[#C85627]/10 p-4 mb-4">
              <FileText className="h-8 w-8 text-[#C85627]" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Campaign Templates</h2>
            <p className="text-muted-foreground max-w-md">
              Save time and maintain consistency by creating reusable campaign templates.
              This feature will help you standardize your campaign creation process and
              ensure best practices across all your marketing efforts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 