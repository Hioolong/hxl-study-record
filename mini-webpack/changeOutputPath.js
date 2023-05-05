export class ChangeOutputPath {
  apply(hooks) {
    hooks.emitFile.tap("changeOutputPath", (context) => {
      console.log("-----------999");
      context.changeOutputPath("./dist/hxl.js")
    });
  }
}
