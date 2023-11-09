# Calculator for First and Follow sets + LL(1) analyzer

<p>This is a simple web-based tool that helps you calculate the First and Follow sets of a context-free grammar and check whether the grammar is LL(1).</p>

## Demo
https://blackydrum.github.io/first-follow-ll1-calculator/

## Usage
Input your grammar in the provided field. Please note that ``eps`` is a reserved keyword representing epsilon. Each rule should be on a separate line, following the format: ``V -> β``, where ``V`` is a variable and ``β`` is a sequence of variables and terminals including epsilon.

## Example
To demonstrate the functionality of this tool, we'll use the following example grammar:
```
S -> a A B
S -> C D E
A -> B C D
A -> x
A -> eps
B -> a b c
C -> d x y
D -> x z
D -> eps
E -> b y z
E -> eps
```
The output should look like this:
```
Variables: { S, A, B, C, D, E }
Terminals: { a, x, b, c, d, y, z }

FI(S) = { a, d }
FI(A) = { a, x }
FI(B) = { a }
FI(C) = { d }
FI(D) = { x }
FI(E) = { b }

FO(S) = { }
FO(A) = { a }
FO(B) = { d }
FO(C) = { x, b, a }
FO(D) = { b, a }
FO(E) = { }

LA(1) = { a }
LA(2) = { d }
LA(3) = { a }
LA(4) = { x }
LA(5) = { a }
LA(6) = { a }
LA(7) = { d }
LA(8) = { x }
LA(9) = { b, a }
LA(10) = { b }
LA(11) = { }

LA(3) ∩ LA(5) ≠ ∅
=> Grammar is NOT LL(1)!
```

The tool will calculate ``FI(V)`` to represent the first set of variable ``V`` and ``FO(V)`` to represent the follow set. Additionally, it will calculate ``LA(n)``, the lookeahead set for a given rule ``n``.

## How does it work
To calculate the first and follow sets, we follow a simple ruleset based on <em>Waite/Goose - Compiler Construction 1985:</em> <br>
```
fi(α) with α ∈ (V ∪ Σ)*:
- fi(ε) = {ε}
- fi(a) = {a}                    with a ∈ Σ
- fi(A) = ⋃ (A -> β) fi(β)       with A ∈ V

- fi(αβ) = { fi(β), if ε ∉ fi(α) else fi(α) \{ε} ∪ fi(β), if ε ∈ fi(α) }

fo(Var) with Var ∈ V, β ≠ ε: (Calculating fo(B))
- ε ∈ fo(S)
- A -> αBβ, a ∈ fi(β) : a ∈ fo(B)
- A -> αB, x ∈ fo(A) : x ∈ fo(B) with x ∈ (Σ ∪ {ε})
- A -> αBβ, ε ∈ fi(β), x ∈ fo(A) : x ∈ fo(B)
```

To check if the grammar is LL(1), we check for intersections between the lookahead sets of rules: <br>
```
G ∈ LL(1) if for all rule pairs
A -> β and A -> γ with β ≠ γ:
fi(βfo(A)) ∩ fi(γfo(A)) = ∅

The tool simplifies this by denoting the lookahead set of a rule with LA(n), where n is the rule number in the grammar:
la(A) = fi(βfo(A)) ⊆ (Σ ∪ {ε})
```
