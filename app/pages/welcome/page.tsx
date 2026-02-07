import { Button } from '~/components/ui/button';
import { Gi3dGlasses } from 'react-icons/gi';
import { RiEdit2Fill } from 'react-icons/ri';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

export function WelcomePage({ message }: { message: string }) {
  return (
    <main className="flex min-h-[calc(100svh-7rem)] items-start justify-center px-4 py-8 sm:items-center sm:py-12">
      <div className="flex w-full max-w-md flex-col">
        <Card className="shadow-xl/30">
          <CardHeader>
            <CardTitle className="text-balance text-xl sm:text-2xl">
              Welcome to Gather Party Planner
            </CardTitle>
            <CardDescription>Pick an option below to begin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full shadow-xl/30">
              <span>
                <Gi3dGlasses />
              </span>
              Plan New Party
            </Button>
            <Button className="w-full shadow-xl/30">
              <span>
                <RiEdit2Fill />
              </span>
              Edit a Party
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-muted-foreground text-xs">{message}</p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
