import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle role="heading">Prototype access</CardTitle>
          <CardDescription>
            This prototype is limited to approved testers and does not use
            passwords or self-service signup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <p>
              On staging, approved users authenticate through the prototype
              access gateway before entering the app.
            </p>
            <p>
              In local development, access can be simulated with a configured
              development identity.
            </p>
            <Button asChild>
              <a href="/">Return to home</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
