"""背包问题"""
# 在容量有限的容器里面，挑选物品，在约束条件下拿到最优价值的一类动态规划模型
# 物品有两个核心属性：占用体积、价值；核心约束：总体积不能超过背包容量
# 注意：背包本质是DP，依靠状态转移枚举选或者不选；不是贪心！贪心只在物品满足特定条件才生效，绝大多数背包贪心得不到正确答案
# 注意：DP数组有两种写法：二维dp[i][j]考虑前i件物品，容量j的最大价值；一维滚动数组优化空间，一维要留意遍历顺序

# --> 题1: 01背包 
def zero_one_knapsack(n, m, goods):
    # dp[j]：容量j是否可达（能不能凑出这个体积）
    dp = [False] * (m + 1)
    # value[j]：凑出体积j时，可以获得的最大价值
    value = [0] * (m + 1)
    dp[0] = True  # 体积0，价值0，初始可达

    for v, w in goods:
        # 01背包：容量从大往小倒着遍历，避免同一个物品重复被选取
        for j in range(m, v - 1, -1):
            if dp[j - v]:
                dp[j] = True
                if value[j - v] + w > value[j]:
                    value[j] = value[j - v] + w
    return dp, value

if __name__ == "__main__":
    # n个物品，背包容量m
    n = 3
    m = 8
    # (体积v,价值w)
    goods = [
        (3, 5),
        (4, 6),
        (5, 7)
    ]
    dp_arr, val_arr = zero_one_knapsack(n, m, goods)
    print("可达数组dp：", dp_arr)
    print("对应最大价值value：", val_arr)


# --> 题2: 完全背包 - 物体可以无限次数选取, 没有数量限制 
def complete_knapsack(n, m, goods):
    # dp[j]：容量j是否可以凑出来
    dp = [False] * (m + 1)
    # value[j]：凑出体积j时，可以获得的最大价值
    value = [0] * (m + 1)
    dp[0] = True  # 体积0可达，价值0

    for v, w in goods:
        # 完全背包：容量从小到大正序遍历
        for j in range(v, m + 1):
            if dp[j - v]:
                dp[j] = True
                if value[j - v] + w > value[j]:
                    value[j] = value[j - v] + w
    return dp, value

if __name__ == "__main__":
    n = 3
    m = 8
    # (体积v,价值w)
    goods = [
        (3, 5),
        (4, 6),
        (5, 7)
    ]
    dp_arr, val_arr = complete_knapsack(n, m, goods)
    print("可达数组dp：", dp_arr)
    print("对应最大价值value：", val_arr)


# --> 题3: 多重背包 - 二进制包组装, 将 c 个物品拆分为 logc 组 / 每组当成一个独立01背包 降低复杂度 
def multiple_knapsack(n, m, goods):
    # dp[j]：背包容量j可以获得的最大价值
    dp = [0] * (m + 1)

    for v, w, c in goods:
        k = 1
        while k <= c:
            # 拆出一组：k个打包在一起，体积v*k，价值w*k
            pack_v = v * k
            pack_w = w * k
            # 01背包倒序
            for j in range(m, pack_v - 1, -1):
                dp[j] = max(dp[j], dp[j - pack_v] + pack_w)
            c -= k
            k <<= 1  # k *= 2
        # 剩下不足2的幂的余数部分，单独一组
        if c > 0:
            pack_v = v * c
            pack_w = w * c
            for j in range(m, pack_v - 1, -1):
                dp[j] = max(dp[j], dp[j - pack_v] + pack_w)
    return dp

if __name__ == "__main__":
    n = 2
    m = 10
    # (体积v,价值w,数量c)
    goods = [
        (2, 3, 4),
        (3, 5, 2)
    ]
    dp_res = multiple_knapsack(n, m, goods)
    print(dp_res)



