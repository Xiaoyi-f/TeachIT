"""数论"""
# 核心本质：在整数域（特别是取模意义下）寻找特定规律，利用数学定理将大计算量转化为小计算量
# --> 能算大指数但无法直接算的时候，找同余规律（快速幂）
# 注意：绝对不要用浮点数去处理大整数和取模！(例如 10^18 级别的运算)，精度丢失会导致全盘皆输
# 注意：取模运算中，减法一定要 (a - b + mod) % mod 防止出现负数；除法一定要求逆元，绝不能直接除！

# --> 题1: 逆元 - 在模 p 意义下, 如果 (a times x equiv 1 pmod p), 那么 x 就叫做 a 的乘法逆元, 记作 (inv(a))
class Solution:
    def mod_inverse(self, a: int, p: int) -> int:
        """
        求 a 在模 p 下的乘法逆元（扩展欧几里得算法）
        :param a: 原数字
        :param p: 模数
        :return: inv(a)，不存在返回 -1
        """
        def exgcd(x, y):
            # 递归：找到一组 x0,y0 满足 a*x0 + p*y0 = gcd(a,p)
            if y == 0:
                return x, 1, 0
            g, x1, y1 = exgcd(y, x % y)
            x0 = y1
            y0 = x1 - (x // y) * y1
            return g, x0, y0

        g, x, y = exgcd(a, p)
        if g != 1:
            # gcd≠1，没有逆元
            return -1
        # 把解调整为正数
        return x % p

if __name__ == "__main__":
    sol = Solution()
    print(sol.mod_inverse(2, 5))   # 输出3，2*3 mod5 = 1
    print(sol.mod_inverse(3, 7))   # 输出5，3*5 mod7 = 1


# --> 题2: 费马小定理 - 当 p 是质数时，a 的逆元 = (a^(p-2) mod p) 
class Solution:
    def fermat_inv(self, a: int, p: int) -> int:
        """
        费马小定理求逆元
        前提：p 是质数，a 与 p 互质
        :param a: 原数
        :param p: 模数（质数！）
        :return: a模p的逆元
        """
        # pow(a, p-2, p) 内置快速幂，计算 a^(p-2) mod p
        return pow(a, p - 2, p)


if __name__ == "__main__":
    sol = Solution()
    print(sol.fermat_inv(2, 5))   # 3
    print(sol.fermat_inv(4, 7))   # 2，4*2 mod 7 = 1


# --> 题3: 最大公约数和最小公倍数 
def gcd(a, b):
    """辗转相除法求最大公约数"""
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    """求最小公倍数，先除后乘避免溢出"""
    return a // gcd(a, b) * b


# --> 题4: 埃氏筛 - 快速找出 2 ~ n 之间所有质数 (合数一定有一个比它小的质因子, 所以会提前被标记掉)
def sieve(n):
    """
    埃氏筛，找出 2~n 所有质数
    :param n: 上界
    :return: list，里面是全部质数
    """
    if n < 2:
        return []
    # is_prime[i] = True 代表 i 是质数，初始全部设为True
    is_prime = [True] * (n + 1)
    # 0 和 1 不是质数
    is_prime[0] = is_prime[1] = False

    # 只需要循环到 sqrt(n) 就够了
    for i in range(2, int(n ** 0.5) + 1):
        # 如果i还没被标记，说明i是质数
        if is_prime[i]:
            # 从 i*i 开始标记（i*2、i*3…已经被更小质数标记过，优化点），步长i
            is_prime[i*i : n+1 : i] = [False] * len(is_prime[i*i : n+1 : i])
    
    # 收集所有标记为True的下标，就是质数
    primes = [num for num, flag in enumerate(is_prime) if flag]
    return primes


if __name__ == "__main__":
    print(sieve(20))


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

# --> 题1: 可逆性 - 一个操作做完之后，存在另外一个操作，可以把它抵消掉，恢复成原来的数据
def xor_prefix(arr):
    """
    异或前缀和（可逆性典型例题）
    异或性质：x ^ y ^ y = x，能够抵消、还原，这就是可逆
    :param arr: 原始数组
    :return: 前缀异或数组 pre
    """
    n = len(arr)
    pre = [0] * (n + 1)
    for i in range(n):
        pre[i+1] = pre[i] ^ arr[i]
    return pre

def query_xor(pre, l, r):
    """
    查询 [l, r] 区间异或（下标从1开始）
    pre[r] ^ pre[l-1] 等价于把前面0~l-1的部分抵消掉
    抵消 = 可逆的核心体现
    """
    return pre[r] ^ pre[l - 1]


if __name__ == "__main__":
    nums = [1, 2, 3, 4]
    pre_arr = xor_prefix(nums)
    print("前缀异或数组：", pre_arr)
    # 查询下标1~3：[1,2,3] 的异或 1^2^3 = 0
    print(query_xor(pre_arr, 1, 3))


# --> 题2: 幂等性 - 同一个操作，重复做很多次，结果和只做一次一模一样，做第二次、第三次不会变结果
import math

class SparseTable:
    def __init__(self, arr):
        """ST表 区间最大值查询（幂等性典型例题）
        max满足幂等：max(a,a)=a，多次取max结果不变
        所以两个重叠区间取max合并，不会出错
        """
        self.n = len(arr)
        self.log_table = [0] * (self.n + 1)
        # 预处理log，快速查区间长度对应的k
        for i in range(2, self.n + 1):
            self.log_table[i] = self.log_table[i // 2] + 1

        self.k_max = self.log_table[self.n] + 1
        # st[j][i]：从i开始，长度为2^j区间的最大值
        self.st = [[0]*self.n for _ in range(self.k_max)]
        self.st[0] = arr.copy()

        # 倍增构建
        for j in range(1, self.k_max):
            for i in range(self.n - (1 << j) + 1):
                self.st[j][i] = max(
                    self.st[j-1][i],
                    self.st[j-1][i + (1 << (j-1))]
                )

    def query_max(self, l, r):
        """查询[l, r]最大值，下标从0开始
        两段区间会重叠！重叠部分重复max，因为max幂等，结果不变
        """
        length = r - l + 1
        k = self.log_table[length]
        return max(
            self.st[k][l],
            self.st[k][r - (1 << k) + 1]
        )


if __name__ == "__main__":
    nums = [5, 3, 7, 2, 9, 1]
    st = SparseTable(nums)
    # 查询 [0,4] 即 [5,3,7,2,9] 最大值9
    print(st.query_max(0, 4))


"""lowbit"""
# 核心本质：x & (-x)，利用补码特性，提取出数字 x 二进制中最低位的 1 及其后面的 0
# --> 树状数组的底层灵魂，也可以用于快速枚举集合的子集
# 注意：在 Python 中负数没有位数限制，可以直接 x & -x，无需像 C++ 那样写补码，但这底层逻辑要懂

# --> lowbit(x) = (x 二进制最靠右边那个 1 单独拿出来 后位补 0 结果值)
def lowbit(x: int) -> int:
    """
    lowbit：取出x二进制最靠右的1对应的十进制数值
    x必须是正整数
    """
    return x & -x



