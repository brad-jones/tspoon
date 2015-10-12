/// <reference path="../typings/source-map/source-map.d.ts"/>
/// <reference path="../node_modules/typescript/lib/typescript.d.ts"/>

import { FileTranspilationHost } from './file-transpilation-host';
import { traverseAst } from './traverse-ast';
import { MutableSourceCode, Insertion } from './mutable-source-code';
import { RawSourceMap, SourceMapConsumer } from 'source-map';
import { Visitor, VisitorContext } from './visitor';
import { Node, DiagnosticCategory, Diagnostic, CompilerOptions, createSourceFile, createProgram } from 'typescript';
import { TranspilerContext } from "./transpiler-context";
import { defaultCompilerOptions } from "./configuration";

export interface TranspilerOutput {
	code: string,
	sourceMap: SourceMap.RawSourceMap,
	diags: Diagnostic[],
	halted: boolean
}

export interface TranspilerConfig {
	sourceFileName: string;
	compilerOptions?: CompilerOptions;
	visitors: Visitor[];
}

export function transpile(content: string, config: TranspilerConfig): TranspilerOutput {

	// The context may contain compiler options and a list of visitors.
	// If it doesn't, we use the default as defined in ./configuration.ts

	const compilerOptions = config.compilerOptions || defaultCompilerOptions;

	// First we initialize a SourceFile object with the given source code

	const fileName: string = config.sourceFileName + '.tsx';

	// Then we let TypeScript parse it into an AST

	const ast = createSourceFile(fileName, content, compilerOptions.target, true);

	// The context contains code modifications and diagnostics

	let context: TranspilerContext = new TranspilerContext();

	// We execute the various visitors, each traversing the AST and generating
	// lines to be pushed into the code and diagbostic messages.
	// If one of the visitors halts the transilation process we return the halted object.

	config.visitors.some((visitor) => {
		traverseAst(ast, visitor, context);
		return context.halted;
	});

	if(context.halted) {
		return {
			code: null,
			sourceMap: null,
			diags: context.diags,
			halted: true
		};
	}

	// Now, we mutate the code with the resulting list of strings to be pushed

	const mutable = new MutableSourceCode(ast);
	mutable.execute(context.insertions);

	// This intermediate code has to be transpiled by TypeScript

	const compilerHost = new FileTranspilationHost(mutable.ast);
	const program = createProgram([fileName], compilerOptions, compilerHost);
	const emitResult = program.emit();

	// Diagnostics generated by TypeScript need to be translated to original code
	// and added to the context

	emitResult.diagnostics.forEach((d: Diagnostic) => {
		context.pushDiag(mutable.translateDiagnostic(d));
	});

	// If TypeScript did not complete the transpilation, we return the halted object

	if(emitResult.emitSkipped) {
		return {
			code: null,
			sourceMap: null,
			diags: context.diags,
			halted: true
		};
	}

	// If we got here, it means we have final source code to return

	const finalCode = compilerHost.output;
	const intermediateSourceMap = compilerHost.sourceMap;

	// The resulting sourcemap maps the final code to the intermediate code,
	// but we want a sourcemap that maps the final code to the original code,
	// so...

	const finalSourceMap = mutable.translateMap(intermediateSourceMap);

	// Now we return the final code and the final sourcemap

	return {
		code: finalCode,
		sourceMap: finalSourceMap,
		diags: context.diags,
		halted: false
	};
}
