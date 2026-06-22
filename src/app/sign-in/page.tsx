import { signInWithGoogle } from '@/app/actions'
import Link from 'next/link'

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  )
}

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center text-center px-6">
        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-4 leading-tight">
          Where makers find each other.
        </h1>
        <p
          className="mb-8 leading-relaxed"
          style={{ fontSize: '16px', color: '#4a4a4a', maxWidth: '380px' }}
        >
          Share what you&apos;re building and find someone who can&apos;t wait to work on it with you.
        </p>
        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-[#4a4a4a] hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>
        <p className="mt-4" style={{ fontSize: '13px', color: '#9a9a9a' }}>
          By continuing, you agree to our{' '}
          <Link href="/legal/terms" className="hover:underline" style={{ color: '#9a9a9a' }}>
            Terms
          </Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="hover:underline" style={{ color: '#9a9a9a' }}>
            Privacy Policy
          </Link>.
        </p>
      </div>
    </div>
  )
}
