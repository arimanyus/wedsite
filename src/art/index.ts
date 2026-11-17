// The files in ./build are produced from the hand-drawn SVGs in this folder by `npm run art`
// (it also runs automatically before `npm run dev` and `npm run build`).
const files = import.meta.glob<string>('./build/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})

/** URL of a prepared artwork file such as `pichwai.front` or `orn-lotus`, if it exists. */
export function art(name: string): string | undefined {
  return files[`./build/${name}.svg`]
}
