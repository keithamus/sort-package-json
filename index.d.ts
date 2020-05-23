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
    <T extends Record<any, any>>(packageJson: T, options?: Options): T,

    /**
      * Sort packageJson string.
      *
      * @param packageJson - A packageJson string.
      * @param options
      * @returns Sorted packageJson string.
      */
    (packageJson: string, options?: Options): string,
  }

  type ComparatorFunction = (left: string, right: string) => number;

  interface Options {
    readonly sortOrder?: readonly string[] | ComparatorFunction;
  }
}

interface sortPackageJsonExports extends sortPackageJsonExports.SortPackageJsonFn {
  readonly default: sortPackageJsonExports.SortPackageJsonFn;
  readonly sortPackageJson: sortPackageJsonExports.SortPackageJsonFn;
}

declare const sortPackageJsonExports: sortPackageJsonExports;

export = sortPackageJsonExports;
