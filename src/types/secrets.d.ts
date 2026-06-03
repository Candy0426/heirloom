declare module 'secrets.js' {
  export function share(secret: string, numShares: number, threshold: number): string[]
  export function combine(shares: string[]): string
}
