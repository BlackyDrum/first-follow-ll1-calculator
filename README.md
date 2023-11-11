# Calculator for First and Follow sets + LL(1) analyzer

<p>This is a simple web-based tool that helps you calculate the First and Follow sets of a context-free grammar and check whether the grammar is LL(1).</p>

## Demo
https://blackydrum.github.io/first-follow-ll1-calculator/

## Usage
Input your grammar in the provided field. Please note that ``eps`` is a reserved keyword representing epsilon. Each rule should be on a separate line, following the format: ``V -> β``, where ``V`` is a variable and ``β`` is a sequence of variables and terminals including epsilon.

## Example
To demonstrate the functionality of this tool, we'll use the following example grammar:
```
E -> T E'
E' -> + T E'
E' -> eps
T -> F T'
T' -> * F T'
T' -> eps
F -> ( E )
F -> id
```
The output should look like this:
```
Variables: E E' T T' F 
Terminals: + * ( ) id 

FI(E) = ( id
FI(E') = + eps
FI(T) = ( id
FI(T') = * eps
FI(F) = ( id

FO(E) = )
FO(E') = )
FO(T) = + )
FO(T') = + )
FO(F) = * + )

LA(1) = ( id
LA(2) = +
LA(3) = )
LA(4) = ( id
LA(5) = *
LA(6) = + )
LA(7) = (
LA(8) = id

Grammar is LL(1)!
```

The tool will calculate ``FI(V)`` to represent the first set of variable ``V`` and ``FO(V)`` to represent the follow set. Additionally, it will calculate ``LA(n)``, the lookeahead set for a given rule ``n`` and check if the grammar is LL(1).<br>

If the grammar is LL(1), an analysis table will be created, that looks like this for our grammar:
<table>
  <tr>
    <td></td>
    <td>+</td>
    <td>*</td>
    <td>(</td>
    <td>)</td>
    <td>id</td>
    <td>eps</td>
  </tr>
  <tr>
    <td>E</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>T E' , 1</td>
    <td>ERROR</td>
    <td>T E' , 1</td>
    <td>ERROR</td>
  </tr>
  <tr>
    <td>E'</td>
    <td>+ T E' , 2</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>eps , 3</td>
    <td>ERROR</td>
    <td>eps, 3</td>
  </tr>
  <tr>
    <td>T</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>F T' , 4</td>
    <td>ERROR</td>
    <td>F T' , 4</td>
    <td>ERROR</td>
  </tr>
  <tr>
    <td>T'</td>
    <td>eps , 6</td>
    <td>* F T' , 5</td>
    <td>ERROR</td>
    <td>eps , 6</td>
    <td>ERROR</td>
    <td>eps, 6</td>
  </tr>
  <tr>
    <td>F</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>( E ) , 7</td>
    <td>ERROR</td>
    <td>id , 8</td>
    <td>ERROR</td>
  </tr>
  <tr>
    <td>+</td>
    <td>POP</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ERROR</td>
  </tr>
  <tr>
    <td>*</td>
    <td>ERROR</td>
    <td>POP</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ERROR</td>
  </tr>
  <tr>
    <td>(</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>POP</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ERROR</td>
  </tr>
  <tr>
    <td>)</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>POP</td>
    <td>ERROR</td>
    <td>ERROR</td>
  </tr>
  <tr>
    <td>id</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>POP</td>
    <td>ERROR</td>
  </tr>
  <tr>
    <td>eps</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ERROR</td>
    <td>ACCEPT</td>
  </tr>
</table>


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
la(A, β) = fi(βfo(A)) ⊆ (Σ ∪ {ε}) = la(n)
```

The analysis table is a formalization of the top-down analysis automaton, as the function <em>act</em>.
```
act: (V ∪ Σ ∪ {ε}) x (Σ ∪ {ε}) -> {α | A -> α ∈ R} x {1, ..., p} ∪ {POP, ERROR, ACCEPT}

- act(A, x) = (α, i), if rule i = A -> α and x ∈ la(A, α)
- act(a, a) = POP
- act(ε, ε) = ACCEPT
- act(X, x) = ERROR, else
```
