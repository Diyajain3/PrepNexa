import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
          difficulty: "EASY",
          source: "COMPANY_SET",
        },
      ],
    },
    {
      role: "Backend Engineer",
      category: "SYSTEM_DESIGN",
      questions: [
        {
          text: "Design a URL shortening service like Bitly with high read traffic and custom short links.",
          difficulty: "MEDIUM",
          source: "COMPANY_SET",
        },
        {
          text: "Design a distributed rate limiter that can handle 100,000 requests per second across multiple regions.",
          difficulty: "HARD",
          source: "COMPANY_SET",
        },
        {
          text: "Explain how you would design a cache eviction policy and handle cache stampede.",
          difficulty: "MEDIUM",
          source: "COMPANY_SET",
        },
      ],
    },
    {
      role: "Behavioral",
      category: "HR",
      questions: [
        {
          text: "Tell me about a time you had a significant disagreement with a teammate or lead. How did you resolve it?",
          difficulty: "MEDIUM",
          source: "COMPANY_SET",
        },
        {
          text: "Describe a project that failed or missed a critical deadline. What did you learn and how did you adapt?",
          difficulty: "MEDIUM",
          source: "COMPANY_SET",
        },
      ],
    },
  ];

  for (const set of practiceSets) {
    let practiceSet = await prisma.practiceSet.findFirst({
      where: {
        companyId: company.id,
        role: set.role,
        category: set.category,
      },
    });

    if (!practiceSet) {
      practiceSet = await prisma.practiceSet.create({
        data: {
          companyId: company.id,
          role: set.role,
          category: set.category,
        },
      });
    }

    for (const q of set.questions) {
      const exists = await prisma.question.findFirst({
        where: {
          practiceSetId: practiceSet.id,
          text: q.text,
        },
      });

      if (!exists) {
        await prisma.question.create({
          data: {
            text: q.text,
            difficulty: q.difficulty,
            source: q.source,
            practiceSetId: practiceSet.id,
          },
        });
      }
    }
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
