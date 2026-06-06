export {}

declare global {
  interface Window {
    kmgccc?: {
      minimize: () => void
      toggleMaximize: () => void
      close: () => void
    }
  }
}
