Below is the answer from [Consequences resulting from Yitang Zhang's latest claimed results on Landau-Siegel zeros](https://mathoverflow.net/questions/433949/consequences-resulting-from-yitang-zhangs-latest-claimed-results-on-landau-sieg).

*******************

It has significant implications on the error term of the PNT for arithmetic progressions.

## PNT and Siegel-Walfisz theorem

Let $\psi(x;q,a)$ be the sum of $\Lambda(n)$ over $n\le x$ and $n\equiv a\pmod q$. Then the PNT states that for fixed $q$ there is

$$
\psi(x;q,a)\sim{x\over\varphi(q)}.\tag1
$$

When $q$ is not fixed, Page (1935) proved the following general result:

**Theorem 1 (Page):** *There exists some absolute and effective $c_0>0$ such that for all $(a,q)=1$:*

$$
\psi(x;q,a)={x\over\varphi(q)}-{\color{blue}{{\chi(a)x^\beta}\over\varphi(q)\beta}}+O\\{xe^{-c_0\sqrt{\log x}}\\},\tag2
$$

*where $\chi$ denotes the exceptional character and $\beta$ denotes the Siegel zero. The blue term would be dropped if there are no exceptional characters modulo $q$.*

To unify the error terms, we require a result due to Siegel (1935):

**Theorem 2 (Siegel):** *For all $\varepsilon>0$ there exists some $A_\varepsilon>0$ such that $1-\beta>A_\varepsilon q^{-\varepsilon}$.*

Plugging this result into the blue term of (2), we have

$$
x^\beta\ll x e^{-A_\varepsilon q^{-\varepsilon}\log x}.
$$

If $q\le(\log x)^{2/\varepsilon}$, then the right hand side becomes $\ll xe^{-A_\varepsilon\sqrt{\log x}}$. Combining this with (2) gives us the result of Walfisz (1936):

**Theorem 3 (Siegel-Walfisz):** *For any $M>0$ there exists some $C_M$ such that for all $q\le(\log x)^M$ and $(a,q)=1$ there is*

$$
\psi(x;q,a)={x\over\varphi(q)}+O\\{e^{-C_M\sqrt{\log x}}\\},\tag3
$$

*where the O-constant is absolute.*

Due to the drawback in the proof of Siegel's theorem, $A_\varepsilon$ and $C_M$ are not effectively computable.

## Improvements due to Zhang

However, we can significantly obtain a stronger and effective improvement of Siegel-Walfisz theorem if Zhang's result is used. That is

**Theorem 4 (Zhang):** *There exists $A>0$ and effective $C_1>0$ such that $L(1,\chi)>C_1(\log q)^{-A}$.*

> Zhang proved this result for $A=2022$, but I choose not to plug it in for generality.

Let $\beta$ be the rightmost real zero of $L(s,\chi)$ for some real $\chi$ modulo $q$ such that $1-\beta\gg(\log q)^{-1}$. Then it follows from the mean value theorem that there exists some $1-\beta<\sigma<1$ such that $1-\beta=L(1,\chi)/L'(\sigma,\chi)$. Applying the classical bound $L'(\sigma,\chi)=O(\log^2q)$ and Zhang's result gives us the zero-free region that

$$
1-\beta>C_2(\log q)^{-A-2},
$$

where $C_2>0$ is effectively computable, which indicates that the blue term in (2) is dominated by

$$
x^\beta\ll xe^{-C_2(\log x)(\log q)^{-A-2}}.
$$

If $(\log q)^{A+2}\le\sqrt{\log x}$, then the right hand side becomes $\ll xe^{-C_2\sqrt{\log x}}$, which allows Theorem 1 to be improved significantly:

**Theorem 5:** *Let $A$ be as in Theorem 4. There exists some absolute $c_0>0$ such that for all $q\le e^{(\log x)^{1/(2A+4)}}$ and $(a,q)=1$, we have*

$$
\psi(x;q,a)={x\over\varphi(q)}+O\\{e^{-c_0\sqrt{\log x}}\\}.\tag4
$$

## Asymptotic formulas valid for all $q\ge1$.

Although Theorem 5 is much stronger than Theorem 3, it is difficult to compare them to Theorem 1 without the blue term, so this section is dedicated to deduce asymptotic formula valid for all $q\ge1$ and $(a,q)=1$ so that a better comparison can be made.

Since $\Lambda(n)\le\log n$, we know trivially that

$$
\psi(x;q,a)\le\sum_{\substack{n\le x\newline n\equiv a(q)}}\log x\ll{x\log x\over q}.
$$

Combining this with (3), we see that Theorem 3 indicates that

$$
\psi(x;q,a)={x\over\varphi(q)}+O_N\\{x(\log x)^{-N}\\}\quad(N>0).\tag5
$$

If the trivial upper bound is juxtaposed with (4), then we see that there exists some absolute and effective $c_0>0$ such that

$$
\psi(x;q,a)={x\over\varphi(q)}+O\\{xe^{-c_0(\log x)^{1/(2A+4)}}\\},
$$

which has a substantially better error term than (5).