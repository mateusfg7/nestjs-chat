import { readFileSync } from "node:fs";
import type { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";

const { compilerOptions } = JSON.parse(readFileSync("./tsconfig.json", "utf8"));

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testEnvironment: "node",
  testRegex: ".e2e-spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/../",
  }),
  transformIgnorePatterns: ["/node_modules/(?!uuid)/"],
};

export default config;
