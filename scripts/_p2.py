p='src/content/ciam-2nde-s.ts'
s=open(p,encoding='utf-8').read()
i=s.index("if (t === 1) return { statement: `Un cercle a pour équation x² + y²")
j=s.index("\n",i)
new='''if (t === 1) { const sg = (k: number, v: string) => (k === 0 ? "" : ` ${k < 0 ? "−" : "+"} ${Math.abs(k) === 1 ? "" : Math.abs(k)}${v}`); return { statement: `Un cercle a pour équation x² + y²${sg(-2 * a, "x")}${sg(-2 * b, "y")}${c === 0 ? "" : ` ${c < 0 ? "−" : "+"} ${Math.abs(c)}`} = 0. Quel est son rayon ?`, answer: num(R), hints: H("x² + y² − 2ax − 2by + c = 0 est un cercle si a² + b² − c > 0.", `a = ${n2(a)}, b = ${n2(b)}, c = ${n2(c)}.`, `R² = a² + b² − c = ${a * a + b * b} − ${par(c)}.`, "Racine carrée."), solution: `R² = ${a * a} + ${b * b} − ${par(c)} = ${R * R} : R = ${R}.` }; }'''
s=s[:i]+new+s[j:]
open(p,'w',encoding='utf-8').write(s)
