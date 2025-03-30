'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:shadow-lg border-2 px-4 py-2 rounded-lg text-lg ' +
            'group-[.toaster]:bg-white group-[.toaster]:text-black dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:text-white',
          description: 'group-[.toast]:text-gray-700 dark:group-[.toast]:text-gray-300',
          actionButton:
            'group-[.toast]:bg-blue-500 group-[.toast]:text-white dark:group-[.toast]:bg-yellow-500 dark:group-[.toast]:text-black',
          cancelButton:
            'group-[.toast]:bg-gray-200 group-[.toast]:text-gray-900 dark:group-[.toast]:bg-gray-700 dark:group-[.toast]:text-white',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
