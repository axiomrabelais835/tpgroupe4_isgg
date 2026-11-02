import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { queryClient } from '@/app/queryClient'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AuthProvider } from '@/app/providers/AuthProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { router } from '@/app/router'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <RouterProvider router={router} />
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                classNames: {
                  toast: 'rounded-xl border border-border',
                },
              }}
            />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
