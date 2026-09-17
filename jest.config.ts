import { readFileSync } from "node:fs";
import type { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";

const { compilerOptions } = JSON.parse(readFileSync("./tsconfig.json", "utf8"));

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  transformIgnorePatterns: ["/node_modules/(?!uuid)/"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/../",
  }),
};

export default config;
