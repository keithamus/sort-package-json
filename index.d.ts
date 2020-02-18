/* eslint-disable @typescript-eslint/no-explicit-any */

type ComparatorFunction = (left: string, right: string) => number

declare namespace sortPackageJson {
  interface Options {
    readonly sortOrder?: readonly string[] | ComparatorFunction
  }
}

declare const sortPackageJson: {
  /**
   Sort packageJson.

   @param packageJson - A packageJson object or string.
   @param options
   @returns Sorted packageJson object or string.
   */

  <T extends any>(packageJson: T, options?: sortPackageJson.Options): T

  /**
   Sort packageJson.

   @param packageJson - A packageJson object or string.
   @param options
   @returns Sorted packageJson object or string.
   */

  sortPackageJson<T extends any>(
    packageJson: T,
    options?: sortPackageJson.Options,
  ): T

  /**
   Default sort order.
   */
  readonly sortOrder: readonly string[]
}

export default sortPackageJson
