# 快速排序 nlogn 
def quick_sort(arr, low, high):
    def partition(arr, low, high):
        pivot = arr[high]
        i = low - 1

        for j in range(low, high):
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]

        arr[i + 1], arr[high] = arr[high], arr[i + 1]

        return i + 1

    if low < high:
        p = partition(arr, low, high)
        quick_sort(arr, low, p - 1)
        quick_sort(arr, p + 1, high)

if __name__ == "__main__":
    nums = [5, 2, 9, 3, 7, 6, 1, 8]
    quick_sort(nums, 0, len(nums) - 1)
    print(nums)


# 归并排序 稳定 nlogn
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    # 合并两个有序数组
    res = []
    i = j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            res.append(left[i])
            i += 1
        else:
            res.append(right[j])
            j += 1

    res.extend(left[i:])
    res.extend(right[j:])

    return res

if __name__ == "__main__":
    nums = [5, 2, 9, 3, 7, 6, 1, 8]
    print(merge_sort(nums))


# 堆排序 大根堆 nlogn 
def heap_sort(arr):
    def heapify(arr, n, i):
        largest = i
        l = 2 * i + 1
        r = 2 * i + 2

        if l < n and arr[l] > arr[largest]:
            largest = l

        if r < n and arr[r] > arr[largest]:
            largest = r

        if largest != i:
            arr[i], arr[largest] = arr[largest], arr[i]
            heapify(arr, n, largest)

    n = len(arr)
    # 建大顶堆
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)

    # 依次把堆顶最大值放到末尾
    for i in range(n - 1, 0, -1):
        arr[i], arr[0] = arr[0], arr[i]
        heapify(arr, i, 0)

if __name__ == "__main__":
    nums = [5, 2, 9, 3, 7, 6, 1, 8]
    heap_sort(nums)
    print(nums)

# Tip:
"""
n = len(arr)
下标从零开始, 左孩子 l = 2 * i + 1, 右孩子 r = 2 * i + 2 
父节点: p = (i - 1) // 2 
最后一个非叶子结点: n // 2 - 1 
"""

"""
###  冒泡排序
- 思想：相邻元素比较交换，每一轮把最大值 “冒泡” 到末尾
- 时间：最好 (O(n))（优化版），最坏 / 平均 (O(n^2))
- 空间：(O(1))
- 稳定性：稳定
- 评价：简单，数据量大完全不适合

###  直接插入排序
- 思想：把数组分成有序区、无序区；依次拿无序区元素插入有序区合适位置
- 时间：最好 (O(n))（已有序），最坏 / 平均 (O(n^2))
- 空间：(O(1))
- 稳定性：稳定
- 评价：小规模、接近有序的数据很好用

###  简单选择排序
- 思想：每一轮在无序区找到最小值，和无序区首位置交换
- 时间：始终 (O(n^2))
- 空间：(O(1))
- 稳定性：不稳定（交换会打乱相等元素相对位置）

###  希尔排序（缩小增量排序）
- 思想：插入排序的优化；按增量分组做插入排序，增量逐步缩小到 1
- 时间：介于 (O(n^2)) ~ (O(nlog n))，和增量序列有关
- 空间：(O(1))
- 稳定性：不稳定
- 评价：只问思路，几乎不手写

###  计数排序（非比较排序）
- 思想：统计每个元素出现次数，按次数输出；**要求数据范围不大、整数**
- 时间：(O(n+k))，k 是数值范围
- 空间：(O(k))
- 稳定性：稳定
- 限制：不能是负数、数值跨度很大时浪费空间

###  基数排序（非比较排序）
- 思想：按低位到高位（或高位到低位），多轮稳定排序（一般依托计数排序）
- 时间：(O(d(n+k)))，d 是最大位数
- 稳定性：稳定
- 适合：整数、字符串，不适合浮点数

###  桶排序（非比较排序）
- 思想：划分多个区间桶，元素放入对应桶，桶内各自排序，最后合并
- 理想时间 (O(n))；分布不均匀会退化
- 稳定性：取决于桶内排序算法
"""


