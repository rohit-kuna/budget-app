import { SignIn } from "@clerk/nextjs";
import { POST_AUTH_REDIRECT, ROUTES } from "@/app/lib/constants";
import { Card, CardContent } from "@/components/ui/card";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const redirectUrl = resolvedSearchParams.redirect_url;
  const forceRedirectUrl =
    typeof redirectUrl === "string" && redirectUrl.length ? redirectUrl : POST_AUTH_REDIRECT;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="py-4">
        <CardContent>
          <SignIn
            path={ROUTES.SIGN_IN}
            routing="path"
            signUpUrl={`${ROUTES.SIGN_UP}?redirect_url=${encodeURIComponent(forceRedirectUrl)}`}
            forceRedirectUrl={forceRedirectUrl}
            fallbackRedirectUrl={forceRedirectUrl}
          />
        </CardContent>
      </Card>
    </div>
  );
}
