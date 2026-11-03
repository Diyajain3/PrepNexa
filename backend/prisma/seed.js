
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting interview question seeding...");

  // 1. Create interview topics
  const topics = [
    { name: "Arrays & Strings", category: "DSA" },
    { name: "Linked Lists", category: "DSA" },
    { name: "Trees & Graphs", category: "DSA" },
    { name: "Dynamic Programming", category: "DSA" },
    { name: "Sorting & Searching", category: "DSA" },
    { name: "Caching", category: "SYSTEM_DESIGN" },
    { name: "API Design", category: "SYSTEM_DESIGN" },
    { name: "Scalability", category: "SYSTEM_DESIGN" },
    { name: "Conflict & Teamwork", category: "HR" },
    { name: "Leadership", category: "HR" },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { name: topic.name },
      update: { category: topic.category },
      create: topic,
    });
  }

  // 2. Create a general company entry for practice
  const company = await prisma.company.upsert({
    where: { name: "General Interview Practice" },
    update: {},
    create: { name: "General Interview Practice" },
  });

  // 3. Prepare practice sets and questions
  const practiceSets = [
    {
      role: "SDE-1",
      category: "DSA",
      questions: [
        {
          text: "Given an array of integers, find two elements whose sum equals a target. Return their indices.",
          difficulty: "EASY",
          source: "COMPANY_SET",
        },
        {
          text: "Find the longest substring without repeating characters.",
          difficulty: "MEDIUM",
          source: "COMPANY_SET",
        },
        {
          text: "Find the maximum sum of a contiguous subarray.",
          difficulty: "MEDIUM",
          source: "COMPANY_SET",
        },
        {
          text: "Reverse a singly linked list iteratively and recursively.",
          difficulty: "EASY",
          source: "COMPANY_SET",
        },
        {
          text: "Detect a cycle in a linked list using constant extra space.",
          difficulty: "MEDIUM",
          source: "COMPANY_SET",
        },
        {
          text: "Find the lowest common ancestor of two nodes in a binary tree.",
          difficulty: "MEDIUM",
          source: "COMPANY_SET",
        },
        {
          text: "Perform level-order traversal of a binary tree.",
          difficulty: "MEDIUM",
          source: "COMPANY_SET",
        },
        {
          text: "Find the shortest path in an unweighted graph.",
          difficulty: "MEDIUM",
          source: "COMPANY_SET",
        },
        {
          text: "Find the number of ways to climb n stairs when you can take one or two steps.",
          difficulty: "EASY",
          source: "COMPANY_SET",
        },
        {
          text: "Find the length of the longest increasing subsequence in an array.",
          difficulty: "MEDIUM",
          source: "COMPANY_SET",
        },
        {
          text: "Search for a target in a sorted rotated array.",
          difficulty: "MEDIUM",
          source: "COMPANY_SET",
        },
        {
          text: "Merge two sorted arrays into one sorted array.",