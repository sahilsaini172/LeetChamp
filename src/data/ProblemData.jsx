import TwoSumVisualizer from "../Solutions/TwoSumVisualizer";
import AddTwoNumbersVisualizer from "../Solutions/AddTwoNumberVisualizer";
import LongestSubstringVisualizer from "../Solutions/LongestSubstringVisualizer";
import MedianSortedArraysVisualizer from "../Solutions/MedianSortedArraysVisualizer";
import PalindromeNumberVisualizer from "../Solutions/PalindromeNumberVisualizer";
import RomanToIntVisualizer from "../Solutions/RomanToIntVisualizer";
import LongestPalindromeVisualizer from "../Solutions/LongestPalidromeVisualizer";

export const problemData = {
  1: {
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "Easy",
    visualizer: <TwoSumVisualizer />,
  },
  2: {
    title: "Add Two Numbers",
    description:
      "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
    difficulty: "Medium",
    visualizer: <AddTwoNumbersVisualizer />,
  },
  3: {
    title: "Longest Substring Without Repeating Characters",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    difficulty: "Medium",
    visualizer: <LongestSubstringVisualizer />,
  },
  4: {
    title: "Median of Two Sorted Arrays",
    description:
      "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    difficulty: "Hard",
    visualizer: <MedianSortedArraysVisualizer />,
  },
  5: {
    title: "Longest Palindromic Substring",
    description:
      "Given a string s, return the longest palindromic substring in s.",
    difficulty: "Medium",
    visualizer: <LongestPalindromeVisualizer />,
  },
  6: {
    title: "Zigzag Conversion",
    description:
      "The string 'PAYPALISHIRING' is written in a zigzag pattern on a given number of rows. Write the code that will take a string and make this conversion given a number of rows.",
    difficulty: "Medium",
  },
  7: {
    title: "Reverse Integer",
    description:
      "Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.",
    difficulty: "Medium",
  },
  8: {
    title: "String to Integer (atoi)",
    description:
      "Implement the myAtoi(string s) function, which converts a string to a 32-bit signed integer.",
    difficulty: "Medium",
  },
  9: {
    title: "Palindrome Number",
    description:
      "Given an integer x, return true if x is a palindrome, and false otherwise.",
    difficulty: "Easy",
    visualizer: <PalindromeNumberVisualizer />,
  },
  10: {
    title: "Regular Expression Matching",
    description:
      "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*' where '.' matches any single character and '*' matches zero or more of the preceding element.",
    difficulty: "Hard",
  },
  11: {
    title: "Container With Most Water",
    description:
      "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.",
    difficulty: "Medium",
  },
  12: {
    title: "Integer to Roman",
    description:
      "Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M. Given an integer, convert it to a roman numeral.",
    difficulty: "Medium",
  },
  13: {
    title: "Roman to Integer",
    description:
      "Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M. Given a roman numeral, convert it to an integer.",
    difficulty: "Easy",
    visualizer: <RomanToIntVisualizer />,
  },
  14: {
    title: "Longest Common Prefix",
    description:
      "Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string ''.",
    difficulty: "Easy",
  },
  15: {
    title: "3Sum",
    description:
      "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
    difficulty: "Medium",
  },
  16: {
    title: "3Sum Closest",
    description:
      "Given an integer array nums of length n and an integer target, find three integers in nums such that the sum is closest to target.",
    difficulty: "Medium",
  },
  17: {
    title: "Letter Combinations of a Phone Number",
    description:
      "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent.",
    difficulty: "Medium",
  },
  18: {
    title: "4Sum",
    description:
      "Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that nums[a] + nums[b] + nums[c] + nums[d] == target.",
    difficulty: "Medium",
  },
  19: {
    title: "Remove Nth Node From End of List",
    description:
      "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
    difficulty: "Medium",
  },
  20: {
    title: "Valid Parentheses",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    difficulty: "Easy",
  },
  21: {
    title: "Merge Two Sorted Lists",
    description:
      "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list.",
    difficulty: "Easy",
  },
  22: {
    title: "Generate Parentheses",
    description:
      "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
    difficulty: "Medium",
  },
  23: {
    title: "Merge k Sorted Lists",
    description:
      "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
    difficulty: "Hard",
  },
  24: {
    title: "Swap Nodes in Pairs",
    description:
      "Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem without modifying the values in the list's nodes.",
    difficulty: "Medium",
  },
  25: {
    title: "Reverse Nodes in k-Group",
    description:
      "Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.",
    difficulty: "Hard",
  },
};
