import * as tslint from 'tslint';
import * as ts from 'typescript';

export class Rule extends tslint.Rules.AbstractRule {
  public apply(source_file: ts.SourceFile): tslint.RuleFailure[] {
    return this.applyWithWalker(
      new Walker(source_file, this.getOptions()),
    );
  }
}

function visitNode(walker: tslint.RuleWalker, sourceFile: ts.SourceFile, prev: ts.Node, node: ts.Node) {
  function getLine (pos) {
    return sourceFile.getLineAndCharacterOfPosition(pos).line;
  }

  const source = sourceFile.text.substr(node.getStart(), node.getEnd() - node.getStart());

  if (node.kind !== ts.SyntaxKind.EndOfFileToken && prev) {
    if (walker.hasOption("ignore-imports") && node.kind === ts.SyntaxKind.ImportDeclaration && prev.kind === ts.SyntaxKind.ImportDeclaration) {
      return;
    }
    let nodeBeginPosIncludeComment = node.getStart();
    const comments = ts.getLeadingCommentRanges(sourceFile.text, node.pos) || [];
    if (comments.length > 0) {
      nodeBeginPosIncludeComment = comments[0].pos;
    }
    if (nodeBeginPosIncludeComment > 0) {
      let breakCount = 0;
      for (
        let i = nodeBeginPosIncludeComment - 1;
        i >= 0 && i >= node.pos;
        i--
      ) {
        if (sourceFile.text[i] === '\n') {
          breakCount++;
          nodeBeginPosIncludeComment = i;
        }
      }
      if (breakCount < 2 && nodeBeginPosIncludeComment > 0 &&
        (
          prev.kind !== node.kind ||
          getLine(prev.getEnd()) - getLine(prev.getStart()) > 0 ||
          getLine(node.getEnd()) - getLine(node.getStart()) > 0
        )
      ) {
        let fix = [tslint.Replacement.appendText(nodeBeginPosIncludeComment, '\n')];
        if (breakCount === 0) {
          fix.push(tslint.Replacement.appendText(nodeBeginPosIncludeComment, '\n'));
        }
        walker.addFailure(
          walker.createFailure(
            nodeBeginPosIncludeComment,
            node.getWidth(),
            'there must be at least one blank line before code blocks.',
            fix
          )
        );
      }
    }
  }
}

function visitSourceFile(walker: tslint.RuleWalker, sourceFile: ts.SourceFile) {
  const rootNode = sourceFile;
  let prev: ts.Node = null;
  ts.forEachChild(rootNode, node => {
    visitNode(walker, sourceFile, prev, node);
    prev = node;
  });
}

function visitClassDeclaration(walker: tslint.RuleWalker, rootNode: ts.ClassDeclaration) {
  const sourceFile = rootNode.getSourceFile();
  let prev = null;
  rootNode.members.forEach(node => {
    visitNode(walker, sourceFile, prev, node);
    prev = node;
  });
}

class Walker extends tslint.RuleWalker {
  public visitSourceFile(sourceFile: ts.SourceFile) {
    visitSourceFile(this, sourceFile);
    super.visitSourceFile(sourceFile);
  }

  public visitClassDeclaration(node: ts.ClassDeclaration) {
    visitClassDeclaration(this, node);
    super.visitClassDeclaration(node);
  }
}
