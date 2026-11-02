"""二分查找"""
# 能判断目标在中间点的哪一侧前提下每次排除一半的搜索策略
# 整体符合单调性 寻找值在某范围中 --> 当存在一个临界值, 小于它满足或大于它不满足时候, 使用二分定位到分界的临界数字 

# --> 题1: 查首尾位置 
from typing import List 

class Solution:
    def searchRange(self, nums: List[int], target: int) -> List[int]:
        def lower_bound(x: int) -> int:
            left, right = 0, len(nums)

            while left < right:
                mid = (left + right) // 2

                if nums[mid] < x:
                    left = mid + 1
                else:
                    right = mid

            return left

        left = lower_bound(target)
        right = lower_bound(target + 1) - 1

        if left <= right:
            return [left, right]
        
        return [-1, -1]


# --> 题2: 搜索旋转排序数组 
class Solution:
    def search(self, nums: List[int], target: int) -> int:
        left, right = 0, len(nums) - 1

        while left <= right:
            mid = left + (right - left) // 2
            if nums[mid] == target:
                return mid

            if nums[left] <= nums[mid]:
                if nums[left] <= target < nums[mid]:
                    right = mid - 1
                else:
                    left = mid + 1
            else:
                if nums[mid] < target <= nums[right]:
                    left = mid + 1
                else:
                    right = mid - 1

        return -1


