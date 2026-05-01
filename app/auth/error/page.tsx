export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Authentication Error</h1>
        <p className="text-muted-foreground">Something went wrong during sign in. Please try again.</p>
        <a href="/auth/login" className="text-primary underline underline-offset-4">
          Back to login
        </a>
      </div>
    </div>
  )
}
