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
  @returns Sorted packageJson object or string.
  */
  (packageJson, options?: sortPackageJson.Options): typeof packageJson

  /**
  Sort packageJson.

  @param packageJson - A packageJson object or string.
  @returns Sorted packageJson object or string.
  */
  sortPackageJson(
    packageJson,
    options?: sortPackageJson.Options,
  ): typeof packageJson

  /**
  Default sort order.
  */
  readonly sortOrder: readonly string[]
}

export default sortPackageJson
