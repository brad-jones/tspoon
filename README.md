# Tspoon
AST visitors for [Typescript](https://github.com/Microsoft/TypeScript).
### What Tspoon does

Typescript transpilation is useally ```source -> AST -> target```. Tspoon uses [Typescript's compiler API](https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API) to allow pluggable pieces of logic (called ```visitor```) to modify the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) before invoking the Typescript transpiler. The process will look like this ```source -> AST -visitors-> AST -> target```. This technique enables early optimizations and error detection for custom language features.

In addition, Tspoon's validation api supports pre-validation code changes, allowing the developer to bypass otherwise unavoidable TypeScript diagnostics.


## Users Documentation
Simple examples can be found [here](http://gituhb.com/wix/tspoon/examples/poc) and [here](http://gituhb.com/wix/tspoon/examples/readme).

##Getting started
Install tspoon using npm.

```npm install tspoon```

Currently, Tspoon exposes only a programmatic API. Meaning, it is used by other javacript code invoking it's ```transpile``` and ```validate``` methods.
#### tspon.transpile(content, config)
content is a string containing the code to transpile, and config defines the visitors and transpilation parameters.
The result is an instance of the TranspilerOutput interface, containing the transpiled code, a source map describing all changes done to the code, the diagnostics generated by the visitors and Typescript, and whether the operation failed or not.
```typescript
// from src/transpile.ts
interface TranspilerOutput {
	code: string,
	sourceMap: RawSourceMap,
	diags: ts.Diagnostic[],
	halted: boolean
}
```

```javascript
var tspoon = require('tspoon');
// from example-poc/build.js
var config = {
    sourceFileName: 'src.ts',
    visitors: ... // insert visitors here
};
var sourceCode = fs.readFileSync(...);
var transpilerOut = tspoon.transpile(sourceCode, config);
...
fs.writeFileSync(path.join(__dirname, 'src.js'), transpilerOut.code, {encoding:'utf8'});
```
#### tspon.validate()
Documentation pending writing

### How to write a visitor
A visitor is an instance of the visitor interface:
```typescript
// from src/visitor.ts
interface Visitor {
	filter(node: ts.Node) : boolean;
	visit(node: ts.Node, context: VisitorContext): void;
}
```
Consider for example the following visitor:
```javascript
// from examples/poc/deletePrivate.js
{
	filter : function filter(node){
		return node.kind === ts.SyntaxKind.PropertyDeclaration
			&& node.modifiers
			&& node.modifiers.some(function(m){
				return m.kind === ts.SyntaxKind.PrivateKeyword;
			});
	},
	visit: function visit(node, context) {
		context.replace(node.getStart(), node.getEnd(), '');
		context.reportDiag(node, ts.DiagnosticCategory.Message, 'deleted field "' + node.getText()+'"', false);
	}
}
```
This visitor only operates on nodes representing property declarations which have the ```private``` modifier. When such a node is encountered, it is deleted from the source code, and a diagnostic message notifying the delete action is emitted.

## Developer Documentation

### how to build and test locally from source
Clone this project localy.
Then, at the root folder of the project, run:
```shell
npm install
npm run build
npm test
```
### how to run local continous test feedback
At the root folder of the project, run:
```shell
npm start
```
Then, open your browser at http://localhost:8080/webtest.bundle
and see any changes you make in tests or code reflected in the browser

### Versioning
Currently Tspoon is in alpha mode. As such, it does not respect semver.

# License
We use a custom license, see ```LICENSE.md```
