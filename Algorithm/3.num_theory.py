"""数论"""
# 核心本质：在整数域（特别是取模意义下）寻找特定规律，利用数学定理将大计算量转化为小计算量
# --> 能算大指数但无法直接算的时候，找同余规律（快速幂）
# 注意：绝对不要用浮点数去处理大整数和取模！(例如 10^18 级别的运算)，精度丢失会导致全盘皆输
# 注意：取模运算中，减法一定要 (a - b + mod) % mod 防止出现负数；除法一定要求逆元，绝不能直接除！

# --> 题1: 逆元
class Solution:
    pass 


# --> 题2: 费马小定理 
class Solution:
    pass 


"""线性筛"""
# 核心本质：保证每个合数只被它最小的质因子筛掉一次，将时间复杂度从 O(N log log N) 压到严格的 O(N)
# --> 选一个数, 每次乘以质数列表中元素, 得到倍数肯定为合数 
# 注意：不要用传统的双层循环埃氏筛去硬卡时间，某些毒瘤题目 O(N log log N) 会 TLE
# 注意：Python 中大量循环容易超时，务必使用 sys.stdin 快读，且内层循环尽量使用列表索引而非迭代器

# --> 题1: 质数问题 
def linear_sieve(n: int):
    # 标记数组，初始全为 True（假设都是质数）
    is_prime = [True] * (n + 1)
    primes = []
    
    for y in range(2, n + 1):
        # 如果 y 没有被标记为合数，则 y 是质数
        if is_prime[y]:
            primes.append(y)
            
        # 用当前的 y 与质数列表中的每个质数 x 相乘
        for x in primes:
            composite = y * x
            # 优化一：如果乘积超过最大范围，则跳出循环
            if composite > n:
                break
                
            # 将 x * y 标记为合数
            is_prime[composite] = False
            
            # 优化二（核心）：如果 y 能被 x 整除，说明 x 是 y 的最小质因子
            # 此时必须退出循环，保证每个合数只被它的最小质因子筛掉一次
            if y % x == 0:
                break
                
    return primes


"""快速幂 & 矩阵快速幂"""
# 核心本质：利用二进制拆分指数，把 O(N) 的连乘降维打击到 O(log N)
# --> 当递推式是线性的且 N 极大（如 10^18），用矩阵快速幂代替普通 DP
# 注意：快速幂的底数 base 每次平方后一定要取模，指数 n 要记得 n >>= 1
# 注意：矩阵乘法不满足交换律，A*B != B*A；且矩阵快速幂的初始矩阵（单位阵）构造绝对不能错

# --> 题1: 快速幂 
def fast_pow(base: int, exp: int, mod: int) -> int:
    """
    计算 (base ^ exp) % mod
    注意：如果题目不要求取模，可以去掉 mod 相关逻辑
    """
    res = 1
    base = base % mod  # 防止 base 比 mod 大
    
    while exp > 0:
        if exp & 1:  # 如果当前二进制最低位是 1
            res = (res * base) % mod
        
        base = (base * base) % mod  # 底数平方
        exp >>= 1  # 指数右移一位 (相当于 exp //= 2)
        
    return res


# --> 题2: 矩阵快速幂 
MOD = 10**9 + 7

def mat_mul(A, B):
    """矩阵乘法 A * B，这里固定为 2x2 矩阵"""
    n = len(A)
    C = [[0] * n for _ in range(n)]
    for i in range(n):
        for k in range(n):
            if A[i][k] == 0: continue  # 优化：跳过 0，加速 Python 运行
            for j in range(n):
                C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % MOD
    return C

def mat_pow(matrix, exp):
    """矩阵快速幂，求 matrix 的 exp 次方"""
    n = len(matrix)
    # 初始化单位矩阵 I (相当于数字里的 1，任何矩阵乘以它等于自身)
    res = [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    
    while exp > 0:
        if exp & 1:
            res = mat_mul(res, matrix)
        matrix = mat_mul(matrix, matrix)
        exp >>= 1
        
    return res

def fib(n: int) -> int:
    """求第 n 项斐波那契数 (项从 0 开始)"""
    if n < 2:
        return n
    # 构造转移矩阵
    base_matrix = [
        [1, 1],
        [1, 0]
    ]
    # 计算 base_matrix 的 n-1 次方
    res_matrix = mat_pow(base_matrix, n - 1)
    
    # 乘上初始向量 [F(1), F(0)]^T = [1, 0]^T
    # 最终 F(n) 就是 res_matrix 第一行第一列的值
    return res_matrix[0][0] % MOD


"""可逆性和幂等性 (逆元)"""
# 核心本质：在模 p 意义下，a * x ≡ 1 (mod p) 时，x 就是 a 的逆元。
# --> 把“除法”转化为“乘以逆元”，这是组合数取模、概率 DP 的核心基石
# 注意：只有当 gcd(a, p) == 1 时，逆元才存在！如果 p 不是质数，需要用到扩展欧几里得求逆元
# 注意：不要在任何除法的场景下使用“向下取整”的常规除法，在取模世界里那等同于错误答案



"""lowbit"""
# 核心本质：x & (-x)，利用补码特性，提取出数字 x 二进制中最低位的 1 及其后面的 0
# --> 树状数组的底层灵魂，也可以用于快速枚举集合的子集
# 注意：在 Python 中负数没有位数限制，可以直接 x & -x，无需像 C++ 那样写补码，但这底层逻辑要懂


