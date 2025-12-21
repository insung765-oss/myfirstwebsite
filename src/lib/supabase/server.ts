'''
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// This function creates a Supabase client that can be used in Server Components,
// Server Actions, and Route Handlers.
export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // In a Server Action, calling `cookieStore.set` will set a response header.
          // This will be sent back to the browser on form submission or redirect.
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // In a Server Action, calling `cookieStore.set` with an empty value
          // and an expired date will delete the cookie.
          cookieStore.set({ name, value: '', ...options })
        },
      },
    },
  )
}

'''