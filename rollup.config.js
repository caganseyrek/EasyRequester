import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default [
  {
    input: ["src/index.ts"],
    output: {
      file: "dist/easy-requester.js",
      format: "es",
    },
    plugins: [
      typescript({
        declaration: false,
        declarationMap: false,
        emitDeclarationOnly: false,
      }),
      commonjs(),
    ],
  },
  {
    input: ["src/index.ts"],
    output: {
      file: "dist/easy-requester.min.js",
      format: "es",
    },
    plugins: [
      typescript({
        declaration: false,
        declarationMap: false,
        emitDeclarationOnly: false,
      }),
      commonjs(),
      terser(),
    ],
  },
];
