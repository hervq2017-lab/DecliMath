p = r'C:\Users\LENOVO\DeclickMath\src\content\ciam-kit.ts'
s = open(p, encoding='utf-8').read()
old = '''    difficulty, contexts, gen,
    skill: meta.skill, ref: meta.ref, keywords: meta.kw,
  });'''
new = '''    difficulty, contexts, gen: (ctx, r) => tidy(gen(ctx, r)),
    skill: meta.skill, ref: meta.ref, keywords: meta.kw,
  });

/** Typographie : vrai signe moins devant un nombre (−3 et non -3), dans tous les textes affichés. */
const fixMinus = (t: string) => t.replace(/(^|[\\s(=;:×÷+−/\\[])-(?=\\d)/g, "$1−");
const tidy = (i: Instance): Instance => ({
  ...i,
  statement: fixMinus(i.statement),
  solution: fixMinus(i.solution),
  hints: i.hints.map(fixMinus) as Instance["hints"],
  answer: i.answer.kind === "choice" ? { ...i.answer, options: i.answer.options.map(fixMinus) } : i.answer,
});'''
assert old in s
s = s.replace(old, new)
open(p, 'w', encoding='utf-8').write(s)
print('kit ok')
