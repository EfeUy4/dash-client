
// components/ui/Modal.tsx
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  footer?: React.ReactNode // pinned below the scrollable body
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  footer
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Portalled to <body>: rendered inline, a parent's `space-y-*` gave the fixed overlay a top margin
  // (the 24px gap above staff modals). Full-screen sheet on mobile, centred dialog from sm up.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 m-0 bg-black/50 z-50"
          />
          <div className="fixed inset-0 m-0 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className={clsx(
                'bg-white shadow-xl w-full flex flex-col min-w-0 max-h-[100dvh] rounded-t-xl sm:max-h-[calc(100dvh-2rem)] sm:rounded-lg',
                sizes[size]
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 sm:p-6 border-b border-neutral-200 shrink-0">
                  {title && (
                    <h2 className="text-lg sm:text-xl font-serif font-semibold text-neutral-900 truncate min-w-0">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      aria-label="Close"
                      className="p-2 hover:bg-neutral-100 rounded-md transition-colors shrink-0 ml-auto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
              <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1 min-h-0">{children}</div>
              {footer && (
                <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-neutral-200 shrink-0 bg-white sm:rounded-b-lg">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Modal
