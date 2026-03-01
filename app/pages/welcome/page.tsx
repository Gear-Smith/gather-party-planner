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

const PARTY_ROLE_LABELS = {
  planner: "Planner",
  co_planner: "Co-Planner",
  party_goer: "Party Goer",
} as const;

export function WelcomePage({
  message,
  currentUser,
}: {
  message: string;
  currentUser: {
    displayName: string;
    identityEmail: string;
    partyRole: keyof typeof PARTY_ROLE_LABELS;
  };
}) {
  return (
    <main className="flex min-h-[calc(100svh-7rem)] items-start justify-center px-4 py-8 sm:items-center sm:py-12">
      <div className="flex w-full max-w-md flex-col">
        <Card className="shadow-xl/30">
          <CardHeader>
            <CardTitle className="text-balance text-xl sm:text-2xl">
              Welcome to Gather Party Planner
            </CardTitle>
            <CardDescription>
              Signed in as {currentUser.displayName} ({PARTY_ROLE_LABELS[currentUser.partyRole]})
            </CardDescription>
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
            <div className="text-muted-foreground text-xs">
              <p>{message}</p>
              <p className="mt-1">{currentUser.identityEmail}</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
