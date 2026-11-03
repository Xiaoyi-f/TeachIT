"""动态规划 DP"""
# 把大问题拆成重叠的子问题，保存子问题答案避免重复计算，由子问题最优解推出大问题最优解
# 两大核心：状态定义、状态转移方程
# --> 分类：背包、线性DP、区间DP、树形DP等
# 注意：无后效性、最优子结构是DP成立的两个前提 (状态只由它前面的状态推出，不会被它后面的状态反向影响)

# --> 题1: 最长递增子序列 
# 状态定义：dp[i] 以第i个元素结尾的最长上升子序列长度
# 状态转移：nums[j] < nums[i] 时 dp[i] = max(dp[i], dp[j]+1)，j在i前面
# --> 子问题重叠，满足最优子结构、无后效性
# 注意：子序列不要求连续；子数组是连续的，不要搞混
# 优化：O(n²)朴素版好理解，还有二分优化O(nlogn)版本
from typing import List

class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        n = len(nums)
        dp = [1] * n  # 每个元素自身长度至少为1
        for i in range(n):
            for j in range(i):
                if nums[j] < nums[i]:
                    if dp[j] + 1 > dp[i]:
                        dp[i] = dp[j] + 1
        return max(dp)

if __name__ == "__main__":
    sol = Solution()
    print(sol.lengthOfLIS([10,9,2,5,3,7,101,18]))


# --> 题2: 爬楼梯 
# 状态定义：dp[i] 爬到第i阶台阶的方案总数
# 状态转移：dp[i] = dp[i-1] + dp[i-2]
# --> 到i阶，只能从i-1走1步 或者 i-2走2步过来
# 注意：斐波那契模型；满足最优子结构、无后效性；可以空间优化只用两个变量
def climbStairs(n: int) -> int:
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

if __name__ == "__main__":
    print(climbStairs(5)) # 输出8


# --> 题3: 最长回文子序列 
# 状态定义：dp[l][r] 字符串s[l...r]区间内最长回文子序列长度
# 状态转移：s[l]==s[r] → dp[l][r] = dp[l+1][r-1]+2
#           s[l]!=s[r] → dp[l][r] = max(dp[l+1][r], dp[l][r-1])
# --> 区间DP套路：先枚举区间长度，从小到大，小区间推大区间
# 注意：子序列不连续；和最长回文子串（连续）不要混淆
def longestPalindromeSubseq(s: str) -> int:
    n = len(s)
    dp = [[0]*n for _ in range(n)]
    # 单个字符回文长度为1
    for i in range(n):
        dp[i][i] = 1

    # length：区间长度
    for length in range(2, n+1):
        for l in range(n - length + 1):
            r = l + length - 1
            if s[l] == s[r]:
                dp[l][r] = dp[l+1][r-1] + 2
            else:
                dp[l][r] = max(dp[l+1][r], dp[l][r-1])
    return dp[0][n-1]

if __name__ == "__main__":
    print(longestPalindromeSubseq("bbbab")) # 输出4


# --> 题4: 树形 DP 
# 状态定义：
# dp[u][0]：以u为根的子树，u不参加宴会的最大快乐值
# dp[u][1]：以u为根的子树，u参加宴会的最大快乐值
# 状态转移：
# u选 → 所有子节点都不能选：dp[u][1] += dp[v][0]
# u不选 → 子节点可选可不选，取max：dp[u][0] += max(dp[v][0], dp[v][1])
# --> 树形DP套路：DFS后序遍历，先算所有儿子，再更新父节点
# 注意：父子不能同时到场；二叉树只是特例，这里是普通多叉树
import sys
sys.setrecursionlimit(1000000)

def dance():
    n = int(input())
    happy = [0]*(n+1)
    for i in range(1, n+1):
        happy[i] = int(input())
    # 建图，邻接表
    g = [[] for _ in range(n+1)]
    has_father = [False]*(n+1)
    for _ in range(n-1):
        son, fa = map(int, input().split())
        g[fa].append(son)
        has_father[son] = True
    # 找根（没有上司的总老板）
    root = 1
    for i in range(1, n+1):
        if not has_father[i]:
            root = i
            break

    dp = [[0]*2 for _ in range(n+1)]

    def dfs(u):
        dp[u][1] = happy[u]
        for v in g[u]:
            dfs(v)
            dp[u][1] += dp[v][0]
            dp[u][0] += max(dp[v][0], dp[v][1])
    dfs(root)
    return max(dp[root][0], dp[root][1])

