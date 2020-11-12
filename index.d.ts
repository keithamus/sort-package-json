/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace sortPackageJsonExports {
  interface SortPackageJsonFn {
    /**
     * Sort packageJson object.
     *
     * @param packageJson - A packageJson
     * @param options
     * @returns Sorted packageJson object
     */
    <T extends Record<any, any>>(packageJson: T, options?: Options): T

    /**
     * Sort packageJson string.
     *
     * @param packageJson - A packageJson string.
     * @param options
     * @returns Sorted packageJson string.
     */
    (packageJson: string, options?: Options): string
  }

  type ComparatorFunction = (left: string, right: string) => number
  function sortObjectBy<T extends Record<any, any>>(
    comparator: string[],
    deep: boolean,
  ): (x: T) => T

  interface Field {
    readonly key: string
    readonly over: sortObjectBy
  }

  interface Options {
    readonly sortOrder?: readonly string[] | ComparatorFunction
    readonly fields?: Field[]
  }
}

interface sortPackageJsonExports
  extends sortPackageJsonExports.SortPackageJsonFn {
  readonly default: sortPackageJsonExports.SortPackageJsonFn
  readonly sortPackageJson: sortPackageJsonExports.SortPackageJsonFn
  readonly sortOrder: string[]
  readonly sortObjectBy: sortPackageJsonExports.sortObjectBy
}

declare const sortPackageJsonExports: sortPackageJsonExports

export = sortPackageJsonExports
