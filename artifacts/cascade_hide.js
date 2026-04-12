const fs = require('fs');

const path = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate/topic-view.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Hide the "Reply" button if the parent comment is hidden
const replyButtonStart = '<Button \n                        variant="ghost" \n                        size="sm"\n                        onClick={() => {\n                          setReplyingTo({ id: comment.id, name: comment.authorName });';
const replyButtonEnd = '</Button>';

// We find the block and wrap it in {!comment.isHidden && (...)}
// Note: The file might have been cleaned/formatted, so I'll search for the specific onClick pattern
const replyPattern = /<Button\s+variant="ghost"\s+size="sm"\s+onClick=\{[^}]*setReplyingTo\({ id: comment\.id, name: comment\.authorName \}\)[^}]*}\s+className="[^"]*"\s+>\s+<Reply[^>]*\/>\s+<span[^>]*>Responder<\/span>\s+<\/Button>/g;

content = content.replace(replyPattern, '{!comment.isHidden && ( $& )}');

// 2. Stop rendering children if the parent is hidden
// Locate the nested replies block
content = content.replace(
    /const children = comments\.filter\(\(child: any\) => child\.parentId === comment\.id\);\s+if \(children\.length === 0\) return null;/,
    'const children = comments.filter((child: any) => child.parentId === comment.id);\n                  if (children.length === 0 || comment.isHidden) return null;'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Cascading hide logic applied to UI.');
