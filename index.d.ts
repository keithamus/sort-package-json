/* eslint-disable @typescript-eslint/no-explicit-any */

/**
   Sort packageJson.

   @param packageJson - A packageJson object or string.
   @param options
   @returns Sorted packageJson object or string.
 */
declare function sortPackageJsonCore<T extends Record<any, any>>(packageJson: T, options?: sortPackageJsonCore.Options): T;
declare namespace sortPackageJsonCore {
  var sortPackageJson: typeof sortPackageJsonCore;
  // @ts-ignore
  var default: typeof sortPackageJsonCore;
}
declare namespace sortPackageJsonCore {
  type ComparatorFunction = (left: string, right: string) => number;
  interface Options {
    readonly sortOrder?: readonly string[] | ComparatorFunction;
  }
  /**
   Default sort order.
   */
  const sortOrder: readonly string[];
}
export = sortPackageJsonCore;
