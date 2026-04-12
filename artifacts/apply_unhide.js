const fs = require('fs');

const path = 'c:/Users/geral/Desktop/360/360/artifacts/carreira-360/src/pages/candidate/topic-view.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add handleUnhideComment
if (!content.includes('const handleUnhideComment')) {
    const handleHideCode = `  const handleHideComment = async () => {`;
    const handleUnhideCode = `  const handleUnhideComment = async (commentId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(\`/api/forum/comments/\${commentId}/unhide\`, {
        method: "POST",
        headers: { "Authorization": \`Bearer \${token}\` }
      });
      if (response.ok) {
        toast({ title: "Comentário Restaurado", description: "O comentário voltou a estar visível." });
        fetchTopicDetails();
      } else {
        toast({ title: "Erro", description: "Não tens permissão para desocultar." });
      }
    } catch (err) {
      toast({ title: "Falha ao desocultar", description: "Tente novamente." });
    }
  };

`;
    content = content.replace(handleHideCode, handleUnhideCode + handleHideCode);
}

// Ensure Eye icon is imported (we imported EyeOff, not Eye)
if (!content.includes('Eye,')) {
    content = content.replace('EyeOff,', 'Eye, EyeOff,');
}

// Add the Eye unhide button for parent comments
const parentHiddenBlockStart = '{(user?.role === \'admin\' || comment.authorId === user?.id) && (';
const parentUnhideButton = `
                      {user?.role === 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleUnhideComment(comment.id)}
                          className="text-green-600 hover:bg-green-50 rounded-full h-10 w-10 shrink-0"
                          title="Desocultar"
                        >
                          <Eye size={16} />
                        </Button>
                      )}
`;

// Insert before the Trash button in parent
const parentTrashIndex = content.indexOf('{(user?.role === \'admin\' || comment.authorId === user?.id) && (', content.indexOf('{comment.isHidden ? ('));
if (parentTrashIndex !== -1 && !content.substring(parentTrashIndex - 500, parentTrashIndex).includes('handleUnhideComment(comment.id)')) {
    content = content.slice(0, parentTrashIndex) + parentUnhideButton + content.slice(parentTrashIndex);
}

// Add the Eye unhide button for child comments
const childTrashIndex = content.indexOf('{(user?.role === \'admin\' || child.authorId === user?.id) && (', content.indexOf('{child.isHidden ? ('));
const childUnhideButton = `
                            {user?.role === 'admin' && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleUnhideComment(child.id)}
                                className="text-green-600 hover:bg-green-50 rounded-full h-8 w-8 shrink-0"
                                title="Desocultar"
                              >
                                <Eye size={14} />
                              </Button>
                            )}
`;
if (childTrashIndex !== -1 && !content.substring(childTrashIndex - 500, childTrashIndex).includes('handleUnhideComment(child.id)')) {
    content = content.slice(0, childTrashIndex) + childUnhideButton + content.slice(childTrashIndex);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Unhide buttons applied to topic-view.tsx');
