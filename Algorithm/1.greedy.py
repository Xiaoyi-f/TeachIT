"""贪心算法"""
# 通过找出 局部最优解 从而 解决核心问题, 每次选择最好结果 
# --> 反悔贪心 
# 注意: 有些情况下 贪心无效 --> 以找反例方式去尝试证明贪心可行性
# 注意: 过度工程化会体现出代码冗余和复杂的问题, 类似这种思路/设计一般都是难以真正实现并解决问题的, 所以注意这种思路很可能就是解题方向想错了, 另外本身要养成避免过度工程化的习惯
# 逐步实现且无确保性的过度工程化本身很危险, 很容易忽略很多细节, 只会导致代码越来越复杂, 越来越走 "歪" 

# --> 题1: 容器接雨水 
class Solution:
    def maxArea(self, height: list[int]) -> int:
        """解法一: 暴力解法"""
        # n = len(height)
        # cur_max = 0      
        # for r in range(n - 1, -1, -1):
        #     right_height = height[r]
        #     for l in range(r):
        #         width = r - l 
        #         left_height = height[l] 

        #         s = width * min(left_height, right_height) 

        #         if s > cur_max:
        #             cur_max = s 

        # return cur_max 


        """解法二: 双指针"""
        n = len(height)
        left_x = 0
        right_x = n - 1 
        cur_max = 0
        while left_x < right_x:
            s = (right_x - left_x) * min(height[left_x], height[right_x])

            if s > cur_max:
                cur_max = s

            if height[left_x] < height[right_x]:
                left_x += 1
            else:
                right_x -= 1

        return cur_max                  


# --> 题2: 通配符匹配
class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        i = j = 0
        star_idx = -1
        s_tmp = 0
        while i < len(s):
            if j < len(p) and (p[j] == '?' or p[j] == s[i]):
                i += 1
                j += 1
            elif j < len(p) and p[j] == '*':
                star_idx = j
                s_tmp = i
                j += 1
            elif star_idx != -1:
                """
                因为有*记录
                当匹配失败可以回退到*的位置
                然后继续匹配
                有*匹配失败就多吞一个字符 -> 一个一个吞, 避免中间有忽略解
                """
                j = star_idx + 1
                s_tmp += 1
                i = s_tmp
            else:
                return False
        while j < len(p) and p[j] == '*':
            j += 1
        return j == len(p)


# --> 题3: 无重叠区间 
from math import inf 

class Solution:
    def eraseOverlapIntervals(self, intervals: list[list[int]]) -> int:
        """写法一"""
        # if not intervals:
        #     return 0

        # # 按照区间的右边界升序排序
        # intervals.sort(key=lambda x: x[1])

        # count = 1  # 记录不重叠区间的数量
        # end = intervals[0][1]  # 初始化第一个区间的右边界

        # for i in range(1, len(intervals)):
        #     if intervals[i][0] >= end:  # 如果当前区间的左边界大于等于上一个区间的右边界
        #         count += 1
        #         end = intervals[i][1]  # 更新右边界

        # return len(intervals) - count  # 返回需要移除的区间数量


        """写法二"""
        intervals.sort(key=lambda x: x[1])
        ans = 0
        pre_r = -inf
        for l, r in intervals:
            if l >= pre_r:
                ans += 1
                pre_r = r
        return len(intervals) - ans



