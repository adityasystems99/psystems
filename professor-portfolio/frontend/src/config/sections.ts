export interface StoryCard {
  id: number;
  eyebrow: string;
  title: string;
  body: string;
  link?: string;
  tag?: string;
}

export const storyCards: StoryCard[] = [
  {
    id: 1,
    eyebrow: "FOUNDATION // 01",
    title: "{{ARCH_TITLE_1}} Distributed Consensus & Micro-kernels",
    body: "Resilient state machine replication and zero-allocation network primitives designed for high-concurrency systems.",
    link: "#projects",
    tag: "Core Systems"
  },
  {
    id: 2,
    eyebrow: "ARCHITECTURE // 02",
    title: "{{ARCH_TITLE_2}} Asynchronous Queue Engine",
    body: "Fault-tolerant pipeline streaming over 2.4 million events per second with sub-millisecond p99 backpressure guarantees.",
    link: "#projects",
    tag: "Pipelines"
  },
  {
    id: 3,
    eyebrow: "INNOVATION // 03",
    title: "{{ARCH_TITLE_3}} Real-Time CRDT Synchronization",
    body: "Decentralized conflict-free replicated data structures synchronizing browser runtimes with zero merge conflicts.",
    link: "#projects",
    tag: "Web Systems"
  },
  {
    id: 4,
    eyebrow: "SECURITY // 04",
    title: "{{ARCH_TITLE_4}} Zero-Trust Boundary Sentinel",
    body: "Hardware-accelerated cryptographic token verification and sliding-window adaptive rate limiting.",
    link: "#projects",
    tag: "Security"
  },
  {
    id: 5,
    eyebrow: "RESEARCH // 05",
    title: "{{ARCH_TITLE_5}} Memory-Tiered Distributed Cache",
    body: "Hybrid NVMe-RAM caching algorithms delivering high hit rates across multi-tenant cluster workloads.",
    link: "#projects",
    tag: "Research"
  },
  {
    id: 6,
    eyebrow: "MENTORSHIP // 06",
    title: "{{ARCH_TITLE_6}} Academic Laboratory & Mentorship",
    body: "Guiding the next wave of engineers from foundational computing fundamentals to modern cloud architectures.",
    link: "#students",
    tag: "Impact"
  }
];

export const storyCaptions = {
  hero: {
    badge: "Architecture • Motion • Systems",
    headline: "Engineering systems that redefine interaction",
    subline: "Scroll to explore the architecture and journey",
  },
  chain: {
    caption1: "From abstract computation into structured distributed filaments",
    caption2: "Every node synchronized through high-throughput consensus",
  }
};
