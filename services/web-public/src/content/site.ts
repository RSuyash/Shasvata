// ============================================================
// SHASVATA — SITE CONTENT
// Single source of truth for all public-facing copy.
// Update here; changes propagate across all pages.
// ============================================================

export const siteConfig = {
  name: "Shasvata",
  tagline: "Long-Horizon Sustainability Intelligence",
  description:
    "Shasvata is building a durable platform for sustainability intelligence, climate accountability research, and public-data-backed analytical surfaces.",
  url: "https://shasvata.com",
  whatsappNumber: "+919284620279",
  ga4Id: "",
  email: "hello@shasvata.com",
  social: {
    linkedin: "https://linkedin.com/company/shasvata",
    twitter: "https://twitter.com/shasvata",
    instagram: "https://instagram.com/shasvata",
  },
} as const;

// ─── Navigation ────────────────────────────────────────────
export const navLinks = [
  { label: "ICCAA", href: "https://iccaa.shasvata.com" },
  { label: "Workspace", href: "/app" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

// ─── Home Page ─────────────────────────────────────────────
export const heroContent = {
  eyebrow: "Business Growth Systems",
  headline: "Build the systems behind\nscalable growth.",
  subheadline:
    "We design, implement, and run the operational engines that help businesses scale with speed, consistency, and control.",
  primaryCta: { label: "Explore Packages", href: "/pricing" },
  secondaryCta: { label: "See the Service Stack", href: "/services" },
  supportLine: "For founders, brands, and operators building for scale.",
} as const;

export const trustStrip = {
  label: "We help businesses turn growth into a cleaner, more repeatable operating system.",
  metrics: [
    { value: "3", label: "Growth pillars" },
    { value: "∞", label: "Compounding systems" },
    { value: "100%", label: "Founder-led delivery" },
  ],
  items: [
    "Growth systems, not disconnected tactics",
    "Clear scope, clean execution, compounding value",
    "Marketing, systems, and automation under one roof",
    "Founder-led quality, structured delivery",
  ],
} as const;

export const pillars = [
  {
    id: "growth",
    icon: "TrendingUp",
    label: "Growth",
    headline: "Growth",
    body: "Campaign operations, funnels, content systems, performance visibility, and the practical execution layer that moves demand forward.",
    href: "/services/naya-marketing",
    color: "sky" as const,
  },
  {
    id: "infrastructure",
    icon: "Layers",
    label: "Infrastructure",
    headline: "Infrastructure",
    body: "Operational workflows, automations, internal tooling, integrations, and the systems that reduce manual drag and improve consistency.",
    href: "/services/naya-tech",
    color: "navy" as const,
  },
  {
    id: "intelligence",
    icon: "Cpu",
    label: "Intelligence",
    headline: "Intelligence",
    body: "AI-assisted workflows, reporting logic, decision support, and process layers that make action faster and smarter.",
    href: "/services/naya-advisory",
    color: "sky" as const,
  },
] as const;

export const whatWeHelpBuild = [
  {
    icon: "BarChart3",
    title: "Campaign operations",
    body: "Not just campaign execution, but the systems that make campaigns run repeatably — tracked, measured, and improving with every cycle.",
  },
  {
    icon: "Workflow",
    title: "Workflow automation",
    body: "Manual processes replaced with structured, auditable flows that reduce dependency on people memory and manual follow-through.",
  },
  {
    icon: "Database",
    title: "Data foundations",
    body: "Lead logic, tracking structures, reporting layers, and operational visibility that gives teams the information they need to decide confidently.",
  },
  {
    icon: "LayoutDashboard",
    title: "Internal tools",
    body: "Dashboards, interfaces, approval flows, and business-supporting internal systems that make teams faster without adding complexity.",
  },
  {
    icon: "Bot",
    title: "AI-assisted workflows",
    body: "Practical AI integrated into real business processes — not hype-led experiments, but operational improvements that persist.",
  },
  {
    icon: "Repeat2",
    title: "Reusable operating layers",
    body: "Systems that continue to help after the first engagement is over. Assets, playbooks, and frameworks built to compound.",
  },
] as const;

export const problemsWeSolve = [
  "Marketing is active, but the operating system behind it is weak",
  "Teams are using too many tools with too little visibility",
  "Leads, tasks, approvals, or reporting live in fragile manual workflows",
  "AI is being discussed, but not implemented in a practical, operational way",
  "Growth depends too heavily on people memory and constant founder intervention",
  "The business has execution happening, but no real compounding system underneath it",
] as const;

export const howWeWork = [
  {
    step: "01",
    title: "Diagnose",
    body: "We understand what is actually slowing growth down — not just what looks urgent on the surface. We ask the right questions before we touch a single tool or workflow.",
  },
  {
    step: "02",
    title: "Design",
    body: "We turn the problem into a structured scope with clear deliverables, defined boundaries, and prioritised implementation steps. No ambiguity in what is being built.",
  },
  {
    step: "03",
    title: "Build",
    body: "We implement the workflow, system, automation, campaign layer, or operating structure required. Founder-reviewed, not handed off carelessly.",
  },
  {
    step: "04",
    title: "Improve",
    body: "We refine, stabilise, and increase clarity so the work compounds instead of staying one-off. The goal is infrastructure that improves over time.",
  },
  {
    step: "05",
    title: "Compound",
    body: "The assets, systems, and operating layers built in each engagement continue to create value after delivery. That is the long-horizon operating model Shasvata is building toward.",
  },
] as const;

export const differentiators = [
  {
    title: "One connected model",
    body: "Marketing, systems, and intelligent workflows built as one operating layer — not handed off between three disconnected vendors.",
    icon: "Link2",
  },
  {
    title: "Structured delivery",
    body: "Defined scopes, clear deliverables, and less black-box ambiguity. You know what is being built, what done looks like, and what happens next.",
    icon: "CheckSquare",
  },
  {
    title: "Founder-level quality",
    body: "Serious thinking, sharp review, and execution that is not handed off carelessly. The quality bar is set by the founders, not delegated away.",
    icon: "Shield",
  },
  {
    title: "Compounding mindset",
    body: "The goal is not only to do work. It is to help build assets and systems that improve how the business runs — long after the engagement ends.",
    icon: "TrendingUp",
  },
] as const;

export const homepageFaqs = [
  {
    question: "What kind of businesses is Naya best for?",
    answer:
      "We work best with founders and operators who already have activity in motion, but need the systems behind that activity to become cleaner, faster, and easier to repeat.",
  },
  {
    question: "Do you only do marketing?",
    answer:
      "No. Marketing is one part of the model. We also design the workflows, data structures, automations, and internal tools that make the marketing work better over time.",
  },
  {
    question: "How does a typical engagement start?",
    answer:
      "We begin by diagnosing the real constraint, then define the scope, deliverables, and success criteria before any build work starts. The goal is clarity before execution.",
  },
  {
    question: "Can you help with AI adoption in a practical way?",
    answer:
      "Yes. We focus on AI that supports real workflows, decision-making, and operational speed — not experiments that look impressive but do not fit the business.",
  },
  {
    question: "Is this strategy, execution, or both?",
    answer:
      "Both. We help shape the system and then build the operating layer behind it, so the final result is usable, maintainable, and valuable after delivery.",
  },
] as const;

// ─── Capabilities Page ─────────────────────────────────────
export const capabilityGroups = [
  {
    id: "growth",
    label: "Growth",
    icon: "TrendingUp",
    headline: "Growth",
    intro: "For businesses that need stronger demand systems, cleaner execution, and more visible performance.",
    items: [
      { title: "Content and communication systems", body: "Building the content engine that keeps brands visible, relevant, and trustworthy without constant one-off production." },
      { title: "Brand and campaign operations", body: "Running campaigns with structure, tracking, and improving iteration logic — not just creative output." },
      { title: "Funnel support", body: "Designing the journey from awareness to action with less leakage at each stage." },
      { title: "Performance visibility", body: "Making what is working and what is not visible — with clear reporting and decision-ready dashboards." },
      { title: "Reporting logic", body: "Structuring the data layer that tells you whether your marketing is actually working." },
      { title: "Growth process design", body: "Building the repeatable systems behind campaign operations so execution scales without proportionally more effort." },
    ],
    cta: "Talk to us about growth systems",
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    icon: "Layers",
    headline: "Infrastructure",
    intro: "For businesses that need operations to stop depending on memory, manual follow-ups, and scattered tools.",
    items: [
      { title: "Workflow design", body: "Mapping and restructuring how work moves inside your business — from intake to approval to delivery." },
      { title: "Operational automations", body: "Removing the manual steps that slow down routine but important business processes." },
      { title: "Internal tools", body: "Building the interfaces, dashboards, and operational systems your team actually uses to do work." },
      { title: "Data flow logic", body: "Making sure information moves correctly between your systems — without manual reconciliation." },
      { title: "Integrations", body: "Connecting your CRM, marketing tools, operations tools, and communication systems so they talk to each other." },
      { title: "System architecture support", body: "Advising on how your operational stack should be structured as the business grows." },
    ],
    cta: "Talk to us about operational infrastructure",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    icon: "Cpu",
    headline: "Intelligence",
    intro: "For businesses that want to use AI and decision support in practical, operationally useful ways — not for theatre.",
    items: [
      { title: "AI-assisted workflows", body: "Integrating AI into real business processes where it reduces effort, improves consistency, or accelerates decision-making." },
      { title: "Reporting and decision support", body: "Building the intelligence layer that turns business data into decisions, not just dashboards." },
      { title: "Intelligent routing and process logic", body: "Designing workflows that route, prioritise, and escalate automatically based on business rules." },
      { title: "Prompt-led operational layers", body: "Structuring how AI is used inside operations — with clear prompts, governance, and quality control." },
      { title: "Review and optimisation loops", body: "Building the feedback systems that make operations improve automatically over time." },
      { title: "Reusable business knowledge systems", body: "Capturing and structuring organisational knowledge so it compounds — not just resides in people's heads." },
    ],
    cta: "Talk to us about practical AI implementation",
  },
] as const;

// ─── Solutions Page ─────────────────────────────────────────
export const solutions = [
  {
    id: "founders",
    icon: "Rocket",
    headline: "For founders who need growth without more chaos",
    body: "You know the business is moving, but too much still depends on founder memory, manual coordination, and fragmented execution. We help founders build cleaner operating layers so growth becomes easier to understand, easier to manage, and less dependent on constant intervention.",
    cta: "Book a founder discovery call",
    href: "/contact",
  },
  {
    id: "marketing",
    icon: "Megaphone",
    headline: "For teams that need more than just content and ads",
    body: "If campaigns are running but follow-up, visibility, reporting, routing, approvals, or workflow logic are weak — performance starts leaking everywhere. We help build the system around the marketing so the work compounds better and results become more predictable.",
    cta: "Explore growth capabilities",
    href: "/services/naya-marketing",
  },
  {
    id: "operations",
    icon: "Settings2",
    headline: "For businesses slowed down by manual workflows",
    body: "When information moves slowly, tasks get missed, approvals are unclear, and reporting is assembled manually — growth loses speed. We help replace operational drag with structured systems, automations, and better internal logic so teams can move with confidence.",
    cta: "Explore infrastructure capabilities",
    href: "/services/naya-tech",
  },
  {
    id: "ai",
    icon: "Sparkles",
    headline: "For companies that want practical AI adoption",
    body: "Most teams do not need AI theatre. They need AI that fits into real workflows, supports real decisions, improves real speed, and reduces real repetitive effort. Naya helps design and implement AI-assisted operating layers that are useful, governable, and connected to real business outcomes.",
    cta: "Explore intelligence capabilities",
    href: "/services/naya-advisory",
  },
  {
    id: "scaling",
    icon: "ArrowUpRight",
    headline: "For companies that have outgrown improvisation",
    body: "When the business starts growing faster than its processes, the cracks show up everywhere: delivery inconsistency, reporting failures, decision-making bottlenecks. We help build the structure, systems, and operating layer needed for the next stage of growth.",
    cta: "Talk to us about scaling systems",
    href: "/contact",
  },
] as const;

export const sharedProblems = [
  { icon: "Puzzle", label: "Too many moving parts with no unifying system" },
  { icon: "EyeOff", label: "Weak visibility into what is actually working" },
  { icon: "Users", label: "Manual dependency — people memory over process" },
  { icon: "HelpCircle", label: "Unclear ownership causing accountability gaps" },
  { icon: "Timer", label: "Slow internal response — approvals and handoffs drag" },
  { icon: "GitBranch", label: "Fragmented tools that don't talk to each other" },
  { icon: "Activity", label: "Activity without compounding infrastructure behind it" },
] as const;

// ─── About Page ─────────────────────────────────────────────
export const aboutBeliefs = [
  {
    statement: "Growth without systems becomes fragile.",
    meaning: "Marketing without an operational backbone behind it will always plateau or break when demand increases.",
  },
  {
    statement: "Systems without execution become theoretical.",
    meaning: "The best-designed workflow that never ships has zero value. Execution discipline is not optional.",
  },
  {
    statement: "AI without operational context becomes noise.",
    meaning: "Implementing AI before business processes are clear and governed just automates confusion.",
  },
  {
    statement: "Clarity is a strategic advantage.",
    meaning: "In every market, the company that communicates most clearly wins more trust and converts more of the right buyers.",
  },
  {
    statement: "The best work compounds after delivery.",
    meaning: "Every engagement should leave the client with assets, playbooks, and systems that improve how the business runs.",
  },
] as const;

// ─── Insights Page ──────────────────────────────────────────
export const insightArticles = [
  {
    slug: "growth-breaks-when-systems-stay-manual",
    title: "Why growth breaks when systems stay manual",
    excerpt: "Growth ceilings are almost always infrastructure problems, not marketing problems. Here are the patterns that appear when execution is not backed by operational systems.",
    category: "Growth Systems",
    readTime: "6 min read",
    date: "2026-01-15",
    featured: true,
  },
  {
    slug: "ai-adoption-what-is-actually-useful",
    title: "AI adoption for businesses: what is actually useful",
    excerpt: "A practical framework for evaluating where AI creates real operational value versus where it adds complexity. Focus on readiness before capability.",
    category: "AI & Automation",
    readTime: "8 min read",
    date: "2026-01-22",
    featured: false,
  },
  {
    slug: "not-just-a-marketing-problem",
    title: "Why most companies do not have a marketing problem alone",
    excerpt: "Most marketing briefs are actually operations, data, or clarity briefs. Understanding why Naya's integrated model produces better results.",
    category: "Growth Systems",
    readTime: "5 min read",
    date: "2026-02-01",
    featured: false,
  },
  {
    slug: "from-execution-to-infrastructure",
    title: "From execution to infrastructure: what serious scaling requires",
    excerpt: "Tracing the pattern of what breaks when companies scale without infrastructure — and describing the transition from people-driven to systems-driven growth.",
    category: "Scaling",
    readTime: "7 min read",
    date: "2026-02-10",
    featured: false,
  },
  {
    slug: "cost-of-fragmented-tools",
    title: "The cost of running growth on fragmented tools",
    excerpt: "The drag created by disconnected stacks: coordination loss, manual reconciliation, data gaps, and reporting failures — all invisible until they aren't.",
    category: "Infrastructure",
    readTime: "6 min read",
    date: "2026-02-20",
    featured: false,
  },
] as const;

export const insightCategories = [
  "All",
  "Growth Systems",
  "AI & Automation",
  "Infrastructure",
  "Scaling",
] as const;

// ─── Contact Page ───────────────────────────────────────────
export const serviceInterestOptions = [
  { value: "growth", label: "Growth / marketing systems" },
  { value: "automation", label: "Automation / workflow systems" },
  { value: "ai", label: "AI adoption / intelligent workflows" },
  { value: "tools", label: "Internal tools / integrations" },
  { value: "advisory", label: "Strategy / advisory" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const budgetOptions = [
  { value: "under-50k", label: "Under ₹50,000 / month" },
  { value: "50k-150k", label: "₹50,000 – ₹1,50,000 / month" },
  { value: "150k-500k", label: "₹1,50,000 – ₹5,00,000 / month" },
  { value: "500k-plus", label: "₹5,00,000+ / month" },
  { value: "project", label: "One-time project budget" },
  { value: "discuss", label: "Prefer to discuss" },
] as const;

export const timelineOptions = [
  { value: "asap", label: "As soon as possible" },
  { value: "1-month", label: "Within 1 month" },
  { value: "1-3-months", label: "1 – 3 months" },
  { value: "3-6-months", label: "3 – 6 months" },
  { value: "exploring", label: "Just exploring" },
] as const;

// ─── Footer ─────────────────────────────────────────────────
export const footerLinks = {
  company: [
    { label: "Services", href: "/services" },
    { label: "Solutions", href: "/solutions" },
    { label: "Work", href: "/work" },
    { label: "About", href: "/about" },
    { label: "Insights", href: "/insights" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;
