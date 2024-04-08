/* eslint-disable @typescript-eslint/no-explicit-any */

type ComparatorFunction = (left: string, right: string) => number

interface Options {
  readonly sortOrder?: readonly string[] | ComparatorFunction

  /**
   * When `true`, sort using `localCompare` using the region `"en"`.
   * When `false`, sort using normal `<`, `===`, and `>` operators.
   * 
   * This is useful when using `npm` with version `>=7.0.0` since that is how it sorts:
   *  - `dependencies`
   *  - `devDependencies`
   *  - `peerDependencies`
   *  - `optionalDependencies`
   * @default false
   */
  readonly sortUsingNpmV7Ording?: boolean;
}

interface SortPackageJson {
  /**
   * Sort packageJson object.
   *
   * @param packageJson - A packageJson
   * @param options - An options object
   * @returns Sorted packageJson object
   */
  <T extends Record<any, any>>(packageJson: T, options?: Options): T

  /**
   * Sort packageJson string.
   *
   * @param packageJson - A packageJson string.
   * @param options - An options object
   * @returns Sorted packageJson string.
   */
  (packageJson: string, options?: Options): string
}

declare const sortPackageJsonDefault: SortPackageJson
export default sortPackageJsonDefault

export const sortPackageJson: SortPackageJson
export const sortOrder: string[]
