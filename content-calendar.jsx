import { useState, useCallback, useRef, useMemo } from "react";

// ─── WRITING STYLES BY CATEGORY ──────────────────────────────────────────────

const STYLE_CATEGORIES = [
  {
    id: "signature", label: "🌿 Signature Styles",
    styles: [
      { id:"narrative-analogy", name:"Narrative Analogy™",  emoji:"🌿", badge:"★", color:"#00F5D4", desc:"Everyday scene → deeper truth → business bridge. Human, soft-sell, unforgettable." },
      { id:"direct-hook",       name:"Direct Hook",          emoji:"🪝", color:"#FF10F0", desc:"Nuclear hook + punchy insights + CTA. Stops the scroll instantly." },
      { id:"question-led",      name:"Question-Led",         emoji:"❓", color:"#ff6699", desc:"Challenge assumptions with a powerful opener. Makes readers stop and think." },
    ]
  },
  {
    id: "social", label: "📱 Social Media",
    styles: [
      { id:"conversational",  name:"Conversational",        emoji:"💬", color:"#4da6ff", desc:"Real, warm, like texting a smart friend. People engage with content that feels personal." },
      { id:"narrative-story", name:"Narrative Storytelling",emoji:"📖", color:"#ffaa44", desc:"Scene-setting, curiosity, emotional connection. People stop for stories." },
      { id:"inspirational",   name:"Inspirational",         emoji:"✨", color:"#ffd700", desc:"Empowering without being preachy. Makes people feel hopeful and seen." },
      { id:"humorous",        name:"Humorous",              emoji:"😄", color:"#ff7f50", desc:"Dry wit, relatable irony, shareable laughs. Humor increases shares and memorability." },
      { id:"opinionated",     name:"Opinionated",           emoji:"🔥", color:"#ff4444", desc:"Bold takes that spark real engagement. Strong perspectives invite reaction." },
      { id:"reflective",      name:"Reflective",            emoji:"🪞", color:"#9988ff", desc:"Vulnerable, introspective, trust-building. Shares the real lesson, not the highlight." },
      { id:"persuasive",      name:"Persuasive",            emoji:"🎯", color:"#FF10F0", desc:"Built to influence decisions. Creates desire, builds trust, drives action." },
    ]
  },
  {
    id: "sales", label: "💰 Sales Copy",
    styles: [
      { id:"urgent-direct",    name:"Urgent / Direct Response", emoji:"⚡", color:"#ef4444", desc:"Tight, punchy, benefit-driven, action-oriented. Pushes momentum and response." },
      { id:"authority-expert", name:"Authority / Expert",       emoji:"🏆", color:"#ffd700", desc:"Credibility-first. You speak from experience, not theory. Buyers want confidence." },
      { id:"analytical",       name:"Analytical",               emoji:"📊", color:"#4da6ff", desc:"Logic, data, structure. Helps justify the decision. Clarity as persuasion." },
      { id:"luxury-elevated",  name:"Luxury / Elevated",        emoji:"💎", color:"#c084fc", desc:"Premium feel, restrained elegance, aspiration. Increases perceived value." },
    ]
  },
  {
    id: "storytelling", label: "📖 Storytelling",
    styles: [
      { id:"personal-story", name:"Personal Story",  emoji:"🔓", color:"#ff9f43", desc:"\"I used to struggle with X…\" Turn lived experience into relatable wisdom." },
      { id:"descriptive",    name:"Descriptive",     emoji:"🎨", color:"#4ade80", desc:"Vivid, sensory, makes readers see and feel. Show, don't tell." },
      { id:"dramatic",       name:"Dramatic",        emoji:"🎭", color:"#f97316", desc:"Tension, contrast, conflict, emotional release. Conflict keeps attention." },
      { id:"poetic",         name:"Poetic",          emoji:"🎵", color:"#a78bfa", desc:"Rhythm, imagery, beauty. The ordinary made profound." },
    ]
  },
  {
    id: "influencer", label: "⚡ Signature Voices",
    styles: [
      { id:"russell-brunson", name:"Story-to-Offer Method", emoji:"🚀", color:"#f59e0b", desc:"Hook-Story-Offer, epiphany bridge, identity shift. Story-based marketing mastery." },
      { id:"gary-vee",        name:"Raw & Unfiltered",       emoji:"💪", color:"#ef4444", desc:"Raw, unfiltered, no excuses, high conviction. Zero fluff, direct truth." },
    ]
  },
  {
    id: "advanced", label: "💎 Advanced / Specialized",
    styles: [
      { id:"aphoristic",            name:"Aphoristic / Maxim",          emoji:"💡", color:"#06b6d4",  desc:"Short, sharp truth-bombs that beg to be screenshotted and shared." },
      { id:"contrarian",            name:"Contrarian",                  emoji:"🔄", color:"#8b5cf6",  desc:"Flip conventional wisdom with grounded insight. Makes people rethink." },
      { id:"tension-based",         name:"Tension-Based",               emoji:"⚙️", color:"#ec4899",  desc:"Build psychological tension before the release. Can't stop reading." },
      { id:"punchy-minimalist",     name:"Punchy Minimalist",           emoji:"✦",  color:"#f97316",  desc:"Maximum impact, minimum words. Every line earns its place." },
      { id:"contrarian-aphoristic", name:"Contrarian Aphoristic",       emoji:"💣", color:"#10b981",  desc:"Quotable flips of common beliefs. The kind of line that gets saved forever." },
      { id:"educational",           name:"Educational Tips",            emoji:"📚", color:"#9988ff",  desc:"Teach-first content that builds genuine authority in your niche." },
    ]
  },
];

// Flat style lookup
const ALL_STYLES = STYLE_CATEGORIES.flatMap(c => c.styles);
const getStyle = id => ALL_STYLES.find(s => s.id === id);

// ─── SYSTEM PROMPTS ───────────────────────────────────────────────────────────

const FORMAT_RULE = `

CRITICAL — Output in EXACTLY this labeled structure. No deviations. No intro text before HOOK.

HOOK:
[ONE scroll-stopping line. Nuclear. Wicked. The very first thing they see. Demands attention immediately.]

CORE MESSAGE:
[1–2 sentences. The essential insight or offer. What this post is really about.]

BODY:
[Main content in your signature style. Short paragraphs. White space. Generous line breaks.]

CTA:
[One natural, compelling call to action. Must match the post goal. Never forced.]`;

const PROMPTS = {
  "narrative-analogy": `You are an elite copywriter who specializes in narrative analogy copy — story-driven, metaphorical, parable-style content.
Formula: (1) Open with a specific visual everyday scene. (2) Describe physically what's happening — sensory, specific. (3) Let the deeper truth reveal itself. (4) Bridge to business: "The same thing happens in business." (5) Connect to the reader's situation. (6) End with one calm, memorable reframed insight.
Rules: No exclamation points. No buzzwords. Short paragraphs. Reader discovers the lesson. Soft sell.${FORMAT_RULE}`,

  "direct-hook": `You are an elite social media copywriter creating scroll-stopping hook-driven content.
Formula: (1) Nuclear hook — bold contrarian claim, curiosity gap, pain amplifier, or shock statement. (2) Bridge line building tension. (3) 4–5 sharp insights using → arrows. (4) Paragraph reframing the big idea. (5) Conversational CTA.
Rules: Every line earns its place. Specific beats general. Confident, not arrogant.${FORMAT_RULE}`,

  "question-led": `You are a thought-leadership expert who uses questions to create high-engagement content.
Formula: (1) One challenging question that reframes a familiar problem. (2) Validate what most people believe. (3) Flip it — "here's what's actually happening." (4) Connect to their specific reality. (5) Calm reframed truth. (6) Open question inviting comments.
Rules: Opening question must be genuinely interesting. Calm, intelligent, curious tone.${FORMAT_RULE}`,

  "conversational": `You are an elite social media writer specializing in conversational copy that feels like a real person talking.
Voice: warm, direct, like texting a smart friend. Short sentences. Ask casual questions. Use "you" a lot. Small asides and real observations. Never stiff. Never corporate.
Rules: Sounds like a real person, not a brand. Relatable, approachable, personal.${FORMAT_RULE}`,

  "narrative-story": `You are a master narrative storyteller for social media who creates posts that feel like the opening of a short story.
Structure: set the scene, build toward something, land with meaning. Use curiosity and emotional stakes.
Rules: People stop for stories more than announcements. Create movement, emotion, and meaning.${FORMAT_RULE}`,

  "inspirational": `You are an expert at inspirational social media copy that empowers rather than preaches.
Voice: warm but real. No empty affirmations. Specific truth that makes people feel seen, capable, and hopeful. Lift people without being saccharine.
Rules: Speaks to their real struggle. Reframes it with genuine insight. Never hollow.${FORMAT_RULE}`,

  "humorous": `You are a social media writer who creates genuinely funny, shareable content that still serves a business purpose.
Humor style: dry wit, observational, relatable irony, unexpected angles. Never forced. The joke feels like a natural observation, not a setup with a punchline announcement.
Rules: Funny AND useful. Humor increases shares, comments, memorability.${FORMAT_RULE}`,

  "opinionated": `You are a thought-leader who writes bold, opinion-driven social media content.
Approach: take a clear, defensible position. Name the thing others talk around. Use "here's the truth," "most people won't say this." Don't soften your take.
Rules: Make the right people say "exactly" and others say "I disagree" — both are wins.${FORMAT_RULE}`,

  "reflective": `You are a writer who specializes in reflective, introspective social media content that builds genuine trust through vulnerability.
Voice: honest, thoughtful, a little raw. Share the real lesson, not the highlight. Use "I've learned" and "looking back." Make space for imperfection.
Rules: Builds trust and emotional depth. People engage with what feels honest.${FORMAT_RULE}`,

  "persuasive": `You are a master persuasive copywriter whose content influences decisions and drives action.
Formula: identify the desire or pain, create connection, build desire logically and emotionally, overcome the objection, move to action.
Rules: Never manipulative, always truthful. Persuasion through insight and relevance.${FORMAT_RULE}`,

  "urgent-direct": `You are an expert direct response copywriter. Every word serves one purpose: move the reader to action.
Style: tight, punchy, benefit-driven. Lead with the outcome. Build desire fast. Overcome the objection. Close with a clear action. No filler, no warming up.
Rules: The strongest benefit first. Specifics create urgency. Clear next step.${FORMAT_RULE}`,

  "authority-expert": `You are a senior expert writing content that establishes undeniable credibility and trust.
Voice: knowledgeable, calm, confident. You speak from experience, not theory. Precise language. Specific truths that only deep expertise would surface. The knowledge sells itself.
Rules: Credible, not arrogant. Specific details signal expertise. Buyers want confidence.${FORMAT_RULE}`,

  "analytical": `You are a data-driven analytical content writer who makes complex information clear and compelling.
Style: logical, precise, structured. Use numbered points, cause and effect, clear reasoning. Make the logic accessible, not academic.
Rules: Surprising data, counterintuitive findings, or bold logical claims stop the scroll.${FORMAT_RULE}`,

  "luxury-elevated": `You are a premium brand copywriter writing content that elevates perceived value.
Voice: refined, intentional, spacious. Never rush. Never oversell. Every word chosen with care. Create desire through restraint and elegance. Speak to the reader's best self.
Rules: White space and restraint are tools. Premium messaging = premium perception.${FORMAT_RULE}`,

  "personal-story": `You are a master storyteller who turns personal experience into relatable, trust-building social content.
Formula: (1) Honest personal admission — "I used to…" or "For two years I…" (2) Describe the struggle with specificity. (3) One specific turning point — a real moment. (4) Universal lesson. (5) Bridge to reader. (6) Genuine soft invitation.
Rules: Honesty over polish. Real beats perfect. Not motivational-speaker-y.${FORMAT_RULE}`,

  "descriptive": `You are a vivid, sensory writer who makes social media content come alive through specific description.
Craft: show, don't tell. Pick the specific detail that contains the whole. Make people feel like they're there. Your writing creates a movie in the reader's mind.
Rules: Sensory details create immersion. Specific images carry more weight than abstract statements.${FORMAT_RULE}`,

  "dramatic": `You are a dramatic storytelling writer who creates emotional tension, contrast, and payoff.
Craft: set up a conflict or tension, let it build, release it with meaning. Use contrast — before/after, high/low, failure/success. Short, punchy bursts with dramatic pacing.
Rules: Conflict keeps attention. The bigger the contrast, the stronger the impact.${FORMAT_RULE}`,

  "poetic": `You are a poetic copywriter who brings beauty, rhythm, and emotional resonance to social media content.
Craft: choose words for their sound and weight, not just meaning. Use rhythm, repetition, imagery. Short lines. White space. Memorable phrases. The ordinary made profound.
Rules: The poetic quality makes content shareable and unforgettable.${FORMAT_RULE}`,

  "russell-brunson": `You are a master of story-based marketing using the Hook-Story-Offer method and identity-shifting copy.
Key elements: (1) Hook that creates curiosity or identifies pain. (2) Short Epiphany Bridge story, the moment you discovered the thing you are teaching. (3) Identity shift: "I used to believe X, then I discovered Y." (4) Reader positioned as hero one insight away from a breakthrough. (5) Natural build to offer or invitation.
Voice: enthusiastic, story-driven, real, high-energy.${FORMAT_RULE}`,

  "gary-vee": `You are writing in a raw, direct, no-excuses voice with high conviction energy.
Key elements: Zero fluff. Say the thing. Call out the excuse or fear directly before reframing. Use phrases like "Look," "Here's the reality," "I'm not kidding." High conviction. Own your position. Self-awareness as a tool, acknowledge the counterargument before they bring it up.
Voice: blunt, energetic, direct, relentlessly honest.${FORMAT_RULE}`,

  "aphoristic": `You are a master of aphoristic, maxim-style copywriting — short, sharp, truth-sounding statements that feel instantly memorable.
Craft: compress an insight into 1–3 sentences that feel undeniably true. Each line can stand alone. Use tension → release or expectation → subversion. People read them and immediately want to share.
Rules: High quotability. Screenshotted and saved. Each line a standalone insight.${FORMAT_RULE}`,

  "contrarian": `You are a contrarian thought-leader who earns attention by saying what others are afraid to say.
Approach: identify the conventional wisdom, then flip it — not for shock value, but for genuine insight. Make people realize they've been thinking about something backwards. Use "Most people think X. Here's why they're wrong."
Rules: Grounded and honest, not inflammatory. The goal is genuine reframing.${FORMAT_RULE}`,

  "tension-based": `You are a master of tension-based copywriting — you build emotional and psychological tension before releasing it with a powerful insight.
Craft: create a gap (curiosity, fear, desire, confusion) in the opening, let it build, release it with a truth that feels earned. The reader can't stop because they need the release.
Rules: The bigger the tension you build, the more satisfying the release.${FORMAT_RULE}`,

  "punchy-minimalist": `You are a punchy minimalist copywriter. Maximum impact with minimum words.
Rules: every word must earn its place. Cut ruthlessly. Say it in one line when two will do. White space as a weapon. Short sentences. High impact. The negative space carries as much weight as the words.
Constraint: HOOK must be one line. BODY maximum 6–8 short lines. CTA maximum 5 words.${FORMAT_RULE}`,

  "contrarian-aphoristic": `You are a contrarian aphoristic thought-leader — combining the punchy memorability of aphorism with the pattern-interrupting power of contrarian thinking.
Signatures: short sharp statements that push back on accepted wisdom. Lines like "The faster you try to sell, the faster they pull away." Tension between what people believe and what's actually true. High quotability — these get screenshotted. Calm authority — not angry, just right.
Rules: Each statement should be shareable standalone. The whole post should feel quotable.${FORMAT_RULE}`,

  "educational": `You are an expert content strategist creating educational thought-leadership content that builds genuine authority.
Formula: (1) Counterintuitive insight or teaching statement that reframes the topic. (2) 4–5 numbered lessons, 1–2 sentences each, each feeling like insider knowledge. (3) Brief closing paragraph tying into a bigger truth. (4) Warm inviting CTA.
Rules: Never preach. Teach. Be specific. Avoid clichés.${FORMAT_RULE}`,
};

// ─── PARSE STRUCTURED OUTPUT ──────────────────────────────────────────────────

function parseOutput(text) {
  // Simple, bulletproof line-by-line scanner — no regex split tricks
  const buf = { HOOK:[], "CORE MESSAGE":[], BODY:[], CTA:[] };
  const LABELS = ["CORE MESSAGE", "HOOK", "BODY", "CTA"]; // longer first to avoid partial match
  let activeKey = null;
  for (const rawLine of text.split("\n")) {
    const line   = rawLine.trim();
    const lineUC = line.toUpperCase();
    let matched  = false;
    for (const label of LABELS) {
      if (lineUC === label + ":" || lineUC.startsWith(label + ": ") || lineUC.startsWith(label + ":")) {
        activeKey = label;
        const rest = line.slice(label.length + 1).trim();
        if (rest) buf[activeKey].push(rest);
        matched = true;
        break;
      }
    }
    if (!matched && activeKey !== null) {
      buf[activeKey].push(rawLine);
    }
  }
  return {
    hook:        buf["HOOK"].join("\n").trim(),
    coreMessage: buf["CORE MESSAGE"].join("\n").trim(),
    body:        buf["BODY"].join("\n").trim(),
    cta:         buf["CTA"].join("\n").trim(),
  };
}

function hasStructure(parsed) {
  return parsed.hook || parsed.coreMessage || parsed.body || parsed.cta;
}

// ─── OPENAI CALL ──────────────────────────────────────────────────────────────

async function callOpenAI(apiKey, styleId, { expertRole, profession, niche, topic, audience, ctaGoal, contentPillar }) {
  const basePrompt = PROMPTS[styleId] || PROMPTS["direct-hook"];
  const context = [
    expertRole && `You are acting as: ${expertRole}.`,
    profession && `You are writing content for a ${profession}${niche ? ` in ${niche}` : ""}.`,
  ].filter(Boolean).join("\n");
  const system = [context, basePrompt].filter(Boolean).join("\n\n");

  const user = [
    `Write a post about: ${topic || contentPillar || "this topic"}`,
    audience      ? `Target audience: ${audience}`           : "",
    ctaGoal       ? `Post goal / CTA: ${ctaGoal}`            : "",
    contentPillar ? `Content pillar: ${contentPillar}`       : "",
    `Follow the exact HOOK / CORE MESSAGE / BODY / CTA format.`,
  ].filter(Boolean).join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role:"system", content:system }, { role:"user", content:user }], max_tokens: 700, temperature: 0.85 }),
  });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message || `Error ${res.status}`); }
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// ─── REPURPOSE + REWRITE AI ───────────────────────────────────────────────────

const STRUCTURED_PLATFORM_FORMAT = `\n\nCRITICAL: Output in EXACTLY this labeled structure:\n\nHOOK:\n[One scroll-stopping opening line native to this platform]\n\nCORE MESSAGE:\n[1-2 sentences — the essential point]\n\nBODY:\n[Main content adapted for this platform's style and length]\n\nCTA:\n[One clear call to action for this platform]`;

const PLATFORM_PROMPTS = {
  facebook:        "Adapt for Facebook: conversational, community-driven, warm tone, 150-250 words. End the CTA with an open question to spark discussion." + STRUCTURED_PLATFORM_FORMAT,
  instagram:       "Adapt for Instagram: punchy visual language, 80-150 words. Add 8-10 relevant hashtags at the end of the BODY section." + STRUCTURED_PLATFORM_FORMAT,
  linkedin:        "Adapt for LinkedIn: professional thought-leadership, authoritative, 150-300 words. 2-3 hashtags max at the end of BODY." + STRUCTURED_PLATFORM_FORMAT,
  tiktok:          "Rewrite as a TikTok talking-head script. Hook in first 3 seconds, natural spoken cadence, 100-150 words." + STRUCTURED_PLATFORM_FORMAT,
  threads:         "Rewrite for Threads: BODY must be 1-3 punchy sentences max. Sharp conversational hot take. No hashtags." + STRUCTURED_PLATFORM_FORMAT,
  "teddy-thread":  "Transform this into a Teddy Thread social media thread format. Output: HOOK (1 line + 👇), then exactly 7 numbered blocks using format 1. 2. 3. through 7., each 1 to 3 sentences, then CTA: (unnumbered). Total 9 parts. Do not use em dashes.",
  "perfect-prompt":"Transform this content into a Perfect Prompting Framework™ prompt. Output: 'Act as a [expert].' then 'Here is the context:' then 'My specific request is:' then 'If you need more details to improve your answer, ask.'",
  carousel:        "Rewrite as Instagram carousel slides. Output: SLIDE 1: [hook], SLIDE 2-7: [one key point each], SLIDE 8: [CTA]. Each slide max 50 words.",
  "reel-script":   "Rewrite as a 30-45 second Reel script. Output: [HOOK - 3 sec], [BODY - 25 sec, 3 key points], [CTA - 5 sec]. Conversational, energetic, spoken word style.",
  "hook-variations":"Generate 5 hook variations for this content. Label each: CONTRARIAN, CURIOSITY, BOLD PROMISE, STORY, QUESTION. Each hook under 130 characters.",
};

async function callOpenAIRepurpose(apiKey, platform, masterContent) {
  const instruction = PLATFORM_PROMPTS[platform] || "Adapt this for social media.";
  const system = `You are an expert social media content strategist. ${instruction}\n\nKeep the core message intact. Make it feel native to the platform.`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},
    body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"system",content:system},{role:"user",content:`Adapt this content for ${platform}:\n\n${masterContent}`}],max_tokens:600,temperature:0.8}),
  });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message||`Error ${res.status}`); }
  return (await res.json()).choices[0].message.content.trim();
}

function getMockRepurpose(platform, masterContent) {
  // Extract existing parsed sections if present, else use full content
  const parsed = parseOutput(masterContent);
  const body   = parsed.body || masterContent.replace(/^(HOOK|CORE MESSAGE|BODY|CTA):\s*/gim,'').trim();
  const hook   = parsed.hook || masterContent.split('\n').filter(l=>l.trim())[0] || "";
  const cta    = parsed.cta || "";
  const core   = parsed.coreMessage || "";

  const mocks = {
    facebook: `HOOK:\n${hook || "Here's something I've been thinking about."}\n\nCORE MESSAGE:\n${core || "Small problems compound into big ones when ignored."}\n\nBODY:\n${body.split('\n\n').slice(0,3).join('\n\n')}\n\nCTA:\nI'd love to hear your perspective — what's been your experience? Drop it in the comments 👇`,
    instagram: `HOOK:\n${hook || "This stopped me in my tracks."}\n\nCORE MESSAGE:\n${core || "One insight that changed everything."}\n\nBODY:\n${body.split('\n\n').slice(0,2).join('\n\n')}\n\n💡 Save this for when you need it.\n\n#entrepreneur #contentcreator #mindset #growthmindset #smallbusiness #marketing\n\nCTA:\nFollow for more like this. Drop a 🔥 if this resonated.`,
    linkedin:  `HOOK:\n${hook || "Something I've seen play out over and over again."}\n\nCORE MESSAGE:\n${core || "The cost of ignoring small problems is always larger than fixing them early."}\n\nBODY:\n${body}\n\nCTA:\nI'd love to connect with others navigating this. What's been your experience? Drop your thoughts below. #leadership #business #growth`,
    tiktok:    `HOOK:\n"${hook || "Nobody talks about this, but they should."}"\n\nCORE MESSAGE:\n${core || "Here's the truth that changes everything."}\n\nBODY:\n[SCRIPT]\n${body.split('\n').filter(l=>l.trim()).slice(0,5).join('\n')}\n\nCTA:\nFollow for more and drop your biggest takeaway in the comments.`,
    threads:   `HOOK:\n${(hook||"This.").slice(0,120)}\n\nCORE MESSAGE:\n${(core||body.slice(0,100)+"…")}\n\nBODY:\n${(body.split('\n\n')[0]||"").slice(0,200)}\n\nCTA:\nThoughts?`,
  };
  return mocks[platform] || `HOOK:\n${hook}\n\nCORE MESSAGE:\n${core}\n\nBODY:\n${body}\n\nCTA:\n${cta}`;
}

const REWRITE_INSTRUCTIONS = {
  shorten: "Make this 50% shorter. Keep only the essential message. Every word must earn its place.",
  expand:  "Expand with 2x more content — add examples, depth, and supporting points.",
  bolder:  "Make this bolder and more impactful. Higher conviction. Stronger, more decisive language.",
  playful: "Make this more playful, fun, and casual. Add personality and relatable humor.",
  professional: "Make this more professional and authoritative. Polished, confident, business-appropriate.",
  emotional: "Make this more emotionally resonant. Add vulnerability and genuine human connection.",
  "scroll-stopping": "Completely rewrite the opening 2-3 lines to be absolutely scroll-stopping. Nuclear hook energy.",
};

async function callOpenAIRewrite(apiKey, content, actionId) {
  const instruction = REWRITE_INSTRUCTIONS[actionId] || "Improve this content.";
  const system = `You are an expert copywriter. ${instruction} Preserve any HOOK/CORE MESSAGE/BODY/CTA format if present in the original.`;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},
    body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"system",content:system},{role:"user",content:`Rewrite this:\n\n${content}`}],max_tokens:700,temperature:0.85}),
  });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message||`Error ${res.status}`); }
  return (await res.json()).choices[0].message.content.trim();
}

function getMockRewrite(content, actionId) {
  const lines = content.split('\n').filter(l=>l.trim());
  switch(actionId) {
    case "shorten":      return lines.slice(0, Math.ceil(lines.length/2)).join('\n');
    case "expand":       return content + "\n\nHere's what this really means for you:\n\nMost people hear this and nod. Very few actually apply it. The ones who do? They see results within weeks, not months. Don't be the person who saves this and scrolls on. Be the person who does the thing.";
    case "bolder":       return "Stop playing small. Here's the unfiltered truth:\n\n" + content;
    case "playful":      return "Okay, real talk... 😄\n\n" + content + "\n\nRight?? Anyone else feeling this or just me? 🙋";
    case "professional": return content + "\n\nBased on consistent experience and observation, this approach outperforms the alternative. The evidence speaks for itself.";
    case "emotional":    return "I'll be honest — this one took me a while to accept.\n\n" + content + "\n\nIf this resonated, I'd love to hear from you. We're all figuring this out together.";
    case "scroll-stopping": { const rest=lines.slice(1).join('\n'); return `🛑 Read this before you scroll past.\n\n${rest}`; }
    default: return content;
  }
}

// ─── MOCK CONTENT ─────────────────────────────────────────────────────────────

function getMock(styleId, profession, topic) {
  const p = profession || "business owner";
  const t = topic || "growing your business";
  const mocks = {
    "narrative-analogy": () =>
`HOOK:
I was looking at a cracked driveway last week.

CORE MESSAGE:
Small problems don't stay small. They compound quietly until the cost of ignoring them is far greater than the cost of fixing them.

BODY:
The crack had started as a hairline fracture near the edge. Easy to walk past. Not urgent enough to fix.

By spring it had branched. By summer, the whole surface needed replacing. What would have been a $200 repair became a $2,400 job.

The same thing happens in ${p} businesses.

A broken process. A conversation that keeps getting postponed. A system held together with workarounds everyone pretends not to notice.

Not urgent enough to fix. Not broken enough to stop for.

Until it is.

Your ${t} has a version of that crack right now.

The cost of ignoring it compounds quietly — until the day it doesn't.

CTA:
What's the hairline fracture you've been walking past? Drop it in the comments.`,

    "direct-hook": () =>
`HOOK:
The biggest mistake ${p}s make with ${t} isn't the strategy. It's optimizing the wrong thing entirely.

CORE MESSAGE:
Most ${p}s are solving a systems problem by adding more effort — and wondering why nothing changes.

BODY:
Here's what actually moves the needle:

→ Stop posting for the algorithm. Start posting for one specific person.
→ Your best content already exists — it lives in your client conversations.
→ Consistency without strategy is just noise at scale.
→ The post that performs is rarely the one you spent three hours on.
→ Your audience doesn't share information. They share identity.

Flip the ratio. Know your person. Speak their language. Tell the truth.

CTA:
What's one thing in your ${t} process you've been tolerating too long? Drop it below.`,

    "conversational": () =>
`HOOK:
Can I be honest with you about something most ${p}s won't say out loud?

CORE MESSAGE:
The problem with ${t} usually isn't what you think it is — and realizing that changes everything.

BODY:
I've had this conversation so many times.

Someone's doing all the right things. Showing up. Putting in the work. Trying every strategy they can find.

And still… stuck.

Here's what I've noticed: it's rarely the strategy. It's usually the framing.

When you shift from "what do I need to do more of" to "what's the one thing that would actually change this" — the answer shows up pretty fast.

It's usually simpler than you think. And scarier.

CTA:
What's one thing you've been avoiding that you already know you need to do? Tell me in the comments.`,

    "aphoristic": () =>
`HOOK:
The faster you try to sell, the faster they pull away.

CORE MESSAGE:
The counterintuitive truth about ${t}: the softer your grip, the more people lean in.

BODY:
Urgency signals desperation.

Confidence doesn't need to chase.

The best ${p}s aren't persuading anyone. They're simply being the obvious choice.

What you build in private becomes your power in public.

Systems outlast effort. Process outlasts hustle. Clarity outlasts cleverness.

CTA:
Which one of these landed? Save this and come back to it when you need it.`,

    "contrarian-aphoristic": () =>
`HOOK:
Working harder on the wrong thing is just efficient failure.

CORE MESSAGE:
Everything you've been told about ${t} is optimizing for the wrong outcome.

BODY:
Consistency is the advice you get from people who've never changed direction fast enough to survive.

Your audience doesn't want more content. They want to feel less alone.

The most effective ${p}s I know post less, say more, and charge more.

Busy is not a business strategy. It's a distraction with good PR.

The goal was never to be seen by everyone. It was to be unforgettable to the right people.

CTA:
Forward this to the ${p} in your life who needs to hear it.`,

    "russell-brunson": () =>
`HOOK:
I almost gave up on ${t} completely — until the day I found out I'd been doing it backwards.

CORE MESSAGE:
There's one thing separating ${p}s who scale from those who stay stuck, and it's not what they're doing — it's what they believe about themselves.

BODY:
I used to think the problem was my skills. My content. My offer.

So I kept improving those things.

Nothing moved.

Then a mentor showed me something that changed everything:

The problem wasn't what I was doing. It was the story I was telling myself about why it wasn't working.

The moment I shifted that story — from "I'm not ready yet" to "I have everything I need to start" — the results followed.

That's the epiphany bridge. And every ${p} I know who's broken through has crossed it.

CTA:
If you're ready to find yours, comment "BRIDGE" and I'll share the exact shift that changed everything for me.`,

    "gary-vee": () =>
`HOOK:
Look — most ${p}s complaining about ${t} are actually complaining about the wrong thing.

CORE MESSAGE:
The problem isn't the market, the algorithm, or the competition. It's the story you're telling yourself to justify not fully committing.

BODY:
I'm going to be direct with you.

You're not struggling with ${t} because you don't have enough information.

You have too much. And you're using the research as a reason not to start.

Here's the reality: the ${p}s winning right now are not smarter than you. They're not more talented. They just stopped waiting for permission.

You don't need another course. You need to make a decision and go.

Not tomorrow. Not when the timing is right.

Now.

CTA:
I'm not kidding. What's the one thing you've been postponing? Commit to it in the comments. Public accountability changes behavior.`,

    "question-led": () =>
`HOOK:
What if everything you've been told about ${t} is exactly backwards?

CORE MESSAGE:
The best ${p}s don't chase ${t} — they understand why their clients resist it, and that changes everything about how they communicate.

BODY:
Most people start with the answer.

They lead with what they know. What they've built. What they offer.

But here's what actually creates connection: start with the question your client is already asking themselves at 2am.

That question — the one they're afraid to say out loud — is your in. It's your hook, your content, your entire strategy.

When you lead with their question instead of your answer, something shifts. They lean in. They feel seen. They trust you before you've said anything about yourself.

Try it. Your next post: ask the question. Don't answer it yet. Just ask it.

CTA:
What's the question your ideal client is afraid to ask? Drop it in the comments — let's turn it into content.`,

    "narrative-story": () =>
`HOOK:
Three years ago, I almost gave up on ${t} completely.

CORE MESSAGE:
The turning point wasn't a strategy or a tool. It was a single conversation that made me see ${t} through a completely different lens.

BODY:
I remember the exact moment.

I was sitting in my car after a meeting that hadn't gone the way I hoped. I'd done everything right — prepared, showed up, followed the framework.

And it still fell flat.

A mentor said something to me that day that I've never forgotten:

"You're trying to solve a problem they haven't admitted they have yet."

That one sentence changed how I approached everything about ${t}.

I stopped leading with solutions. I started leading with stories — specifically, the story of someone who was exactly where my audience was right now.

Everything changed after that.

CTA:
Has a single conversation ever changed how you see your work? Tell me in the comments.`,

    "humorous": () =>
`HOOK:
Nobody warned me that ${t} would require a PhD in patience, a minor in mind-reading, and a full-time therapist.

CORE MESSAGE:
The funniest part about ${t}? The "expert advice" is usually just confident confusion packaged in a nice font.

BODY:
Things they told me about ${t}:

→ "Just be consistent." (Sure, let me also just be tall.)
→ "Post when your audience is online." (My audience is apparently nocturnal.)
→ "Quality over quantity." (But also post every day. Both. At the same time.)
→ "Find your niche." (Found it. It found me first. We're in therapy together.)
→ "Just show up authentically." (I did. Apparently my authentic self needed better lighting.)

The truth? ${t} is one part strategy, one part experimentation, and approximately four parts realizing everything you thought you knew was slightly wrong.

And somehow that's what makes it worth it.

CTA:
Which piece of advice about ${t} has aged the worst for you? Be honest. This is a safe space.`,

    "opinionated": () =>
`HOOK:
Unpopular opinion: most ${p}s are solving ${t} completely wrong — and the industry keeps rewarding them for it.

CORE MESSAGE:
The obsession with short-term results in ${t} is actively destroying long-term trust, and until we name that, nothing changes.

BODY:
I'm going to say the thing no one wants to say out loud.

The reason ${t} feels so hard for most ${p}s isn't tactics. It's that we've been optimizing for the wrong thing.

We chase what's measurable — clicks, follows, conversions — and quietly abandon what actually matters: genuine connection, real trust, lasting reputation.

And the market rewards us for it. In the short term.

Then we wonder why it stops working.

The ${p}s I respect most aren't chasing the algorithm. They're building something that compounds over time — relationships, reputation, a body of work that means something.

That's not a strategy. That's a standard.

CTA:
Where have you seen ${t} done right? Tag someone who's playing the long game.`,

    "reflective": () =>
`HOOK:
I've been in ${t} long enough to know: the lesson I needed most was the one I kept avoiding.

CORE MESSAGE:
Growth in ${t} rarely comes from doing more. It almost always comes from finally stopping to understand why something isn't working.

BODY:
There's a version of me from a few years ago who would have found this post frustrating.

That version was busy. Optimizing. Adding more.

More content. More outreach. More systems. More effort.

And then one slow week forced me to stop and actually look at what I was building.

What I found was uncomfortable: I was working hard on things that didn't matter, avoiding the one conversation I needed to have with myself about ${t}.

The question wasn't "what should I do more of?" It was "what am I doing that's actually working, and why?"

Sitting with that question changed more in 30 days than years of busyness had.

CTA:
What's one thing you've been avoiding looking at in your own ${t}? You don't have to share. But sit with it.`,

    "persuasive": () =>
`HOOK:
If you're still on the fence about ${t}, this will be the last thing you read before you decide.

CORE MESSAGE:
The ${p}s who act on ${t} now will spend the next three years ahead of the ones who waited for perfect conditions.

BODY:
Here's what I know about timing:

There is never a perfect moment. There is only the moment where the cost of waiting finally exceeds the cost of starting.

And I'd argue that moment is now.

The landscape around ${t} is shifting. The ${p}s who are building today — even imperfectly — are establishing presence, trust, and authority that takes years to replicate.

The ones waiting for the right tool, the right budget, the right moment?

They're going to be starting from scratch in a market that's already moved.

You don't need to be ready. You need to begin.

CTA:
If you're ready to stop waiting, reply with "NOW" and I'll share exactly where I'd start.`,

    "urgent-direct": () =>
`HOOK:
This window for ${t} won't stay open. Here's what to do before it closes.

CORE MESSAGE:
The ${p}s who move on ${t} in the next 90 days will have an advantage that's nearly impossible to replicate 12 months from now.

BODY:
No fluff. Here's what matters right now about ${t}:

1. The barrier to entry is still low. That won't last.
2. The audience is paying attention. They won't always be.
3. The tools work. But only for people who use them now.

I've watched ${p}s overthink this for months while others quietly built market position with half the knowledge and twice the decisiveness.

The plan doesn't need to be perfect. The timing does.

Act. Refine. Win.

CTA:
DM me "READY" if you want to map out your first move. I'll send you exactly where to start.`,

    "authority-expert": () =>
`HOOK:
After [X] years in ${t}, here's the only framework I trust — and why I stopped using everything else.

CORE MESSAGE:
Most frameworks for ${t} fail because they're built for ideal conditions. This one was built for the real ones.

BODY:
I've tested a lot of approaches to ${t}.

Some worked. Most didn't. A few worked for a while, then stopped.

What I've found after consistent experience: the strategies that last are almost never the most sophisticated. They're the ones built on the most honest understanding of what your specific client actually needs.

That insight sounds simple. Living it is different.

Here's the framework I return to:

First — understand the real problem. Not the stated one. The one underneath.
Second — build trust before you build anything else.
Third — deliver before you ask.

Every successful outcome in ${t} I've seen traces back to these three things.

CTA:
What principle has held up the longest in your own work? I read every reply.`,

    "analytical": () =>
`HOOK:
The data on ${t} tells a story most ${p}s aren't reading. Here's what the numbers actually say.

CORE MESSAGE:
The gap between average and exceptional results in ${t} almost always comes down to one measurable variable that most people overlook.

BODY:
Let's look at this clearly.

When you analyze outcomes in ${t}, a pattern emerges:

• The top 20% of ${p}s in this space share 3 behaviors
• 68% of the variance in results traces to one single input
• The bottom performers aren't less talented — they're measuring the wrong things

What's the differentiating variable? Consistency of feedback loops.

The best performers in ${t} don't just act. They instrument. They measure what's actually moving the needle versus what feels productive.

Most ${p}s optimize for activity. The best ones optimize for signal.

Build your feedback loop first. Everything else follows.

CTA:
What metric are you tracking in your ${t} process right now? Drop it below and let's audit it together.`,

    "luxury-elevated": () =>
`HOOK:
The difference between ordinary and extraordinary in ${t} is rarely visible. That's exactly the point.

CORE MESSAGE:
The most successful ${p}s in this space don't compete on price or volume. They compete on taste, precision, and the kind of trust that can't be manufactured.

BODY:
There is a certain quality of work in ${t} that announces itself quietly.

Not through volume. Not through urgency.

Through craft.

Through the sense that every detail has been considered. Every word chosen. Every interaction designed to feel effortless — which, of course, requires more effort than almost anything else.

The clients who choose this level of work aren't shopping. They're recognizing.

They know what they're looking for. They've found it before. And when they find it again, they don't negotiate.

Your job isn't to convince everyone. It's to be unmistakable to the right ones.

CTA:
What does "elevated" look like in your work? Tell me in one sentence.`,

    "personal-story": () =>
`HOOK:
I used to be the ${p} who had all the answers about ${t}. Then one client changed everything.

CORE MESSAGE:
The most important lesson I've learned about ${t} didn't come from a course or a mentor. It came from failing, quietly, in a way no one else could see.

BODY:
I don't tell this story often.

A few years into working on ${t}, I had a client who trusted me completely. I had the credentials. The confidence. The process.

And I got it wrong.

Not catastrophically. Not in a way anyone else would have noticed. But I knew.

I'd optimized for the result they asked for instead of the result they needed. And somewhere in the gap between those two things, I missed the whole point.

I spent a long time after that thinking about what I actually owed the people I worked with.

The answer I came to: honesty first. Expertise second.

I'm a better ${p} now because I stopped pretending that knowing the answer was enough.

CTA:
What's a mistake that made you better? You don't have to share the details — just that it happened.`,

    "descriptive": () =>
`HOOK:
Picture the moment before everything shifts. That's where ${t} actually begins.

CORE MESSAGE:
The most powerful work in ${t} happens not in the strategy sessions or the deliverables — it happens in the small, invisible moments of clarity that change how someone sees their situation.

BODY:
There is a specific feeling that happens when ${t} is working.

It's not the dashboard number. It's not the close.

It's quieter than that.

It's a ${p} sitting in a coffee shop, looking at something they built, and feeling — maybe for the first time — that it's actually good. That it's actually working. That the gap between where they were and where they are is real.

That moment is what this is all for.

Everything else — the strategy, the system, the process — is just scaffolding around that feeling.

Build toward it. In your work. In your clients' work.

The rest follows.

CTA:
What does success in ${t} feel like for you — not look like, feel like? I'd love to know.`,

    "dramatic": () =>
`HOOK:
There was a single moment when I realized everything I thought I knew about ${t} was wrong. I almost didn't recover.

CORE MESSAGE:
The most dangerous place in ${t} isn't failure — it's the comfortable plateau where everything looks fine and nothing is actually growing.

BODY:
I had been doing everything right.

The metrics said so. The clients said so. My bank account said so.

And then, quietly, without warning — it stopped.

Not suddenly. That's not how this kind of thing works. It stops slowly, then all at once.

The clients who used to find me weren't finding me. The thing that had worked for years had silently expired.

The worst part? I'd felt it coming for months. And I'd convinced myself it was temporary.

${t} has a way of punishing the comfortable. Not because it's cruel. Because it demands that you keep evolving or it evolves past you.

I rebuilt. It took longer than it should have because I waited too long to start.

Don't wait.

CTA:
What's the sign you've been ignoring that it's time to evolve your approach to ${t}? It's okay to name it.`,

    "poetic": () =>
`HOOK:
${t} is not a destination. It never was.

CORE MESSAGE:
The ${p}s who last are the ones who fall in love with the process — not the outcome — and that love is visible in every word they write.

BODY:
There is a kind of work that feels like arrival.

You reach something. You rest.
Then you realize the map has changed.

${t} is like that.

You learn the craft, then unlearn it.
You build the audience, then rebuild it.
You find the voice, then find it again
— deeper, quieter, more true.

The ones who stay are not the most talented.

They are the ones who decided, somewhere along the way,
that the work itself was enough.

That showing up — imperfect, honest, present —
was more than most would do.

And somehow, that became everything.

CTA:
What part of this work do you keep coming back to, even when it's hard? Tell me.`,
  };
  const fn = mocks[styleId] || mocks["direct-hook"];
  return fn();
}

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────

const MONTHS  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_S  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const daysIn  = (y,m) => new Date(y,m+1,0).getDate();
const firstDay= (y,m) => new Date(y,m,1).getDay();
const toKey   = (y,m,d) => `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const todayKey= () => { const n=new Date(); return toKey(n.getFullYear(),n.getMonth(),n.getDate()); };
const uid     = () => Math.random().toString(36).slice(2,10);
const friendly= key => { if(!key) return ""; const [y,m,d]=key.split("-").map(Number); return `${MONTHS[m-1]} ${d}, ${y}`; };

function buildGrid(y,m) {
  const n=daysIn(y,m), s=firstDay(y,m), cells=Array(s).fill(null);
  for(let d=1;d<=n;d++) cells.push(d);
  while(cells.length%7!==0) cells.push(null);
  return cells;
}

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id:"instagram", name:"Instagram", emoji:"📸" },
  { id:"linkedin",  name:"LinkedIn",  emoji:"💼" },
  { id:"facebook",  name:"Facebook",  emoji:"👥" },
  { id:"tiktok",    name:"TikTok",    emoji:"🎵" },
  { id:"threads",   name:"Threads",   emoji:"🧵" },
];

const STATUSES = [
  { id:"idea",      label:"Idea",         color:"#6366f1" },
  { id:"draft",     label:"Draft",        color:"#666699" },
  { id:"ready",     label:"Ready",        color:"#00F5D4" },
  { id:"scheduled", label:"Scheduled",    color:"#f59e0b" },
  { id:"posted",    label:"Posted ✓",     color:"#FF10F0" },
  { id:"archived",  label:"Archived",     color:"#444466" },
];

const PILLARS = [
  { id:"education",      label:"Education",         emoji:"📚", color:"#4da6ff" },
  { id:"personal-story", label:"Personal Story",    emoji:"🔓", color:"#ff9f43" },
  { id:"behind-scenes",  label:"Behind the Scenes", emoji:"🎬", color:"#9988ff" },
  { id:"promotion",      label:"Promotion",         emoji:"💰", color:"#ef4444" },
  { id:"social-proof",   label:"Social Proof",      emoji:"⭐", color:"#ffd700" },
  { id:"engagement",     label:"Engagement",        emoji:"💬", color:"#00F5D4" },
  { id:"inspiration",    label:"Inspiration",       emoji:"✨", color:"#f59e0b" },
  { id:"authority",      label:"Authority",         emoji:"🏆", color:"#c084fc" },
];

const CONTENT_TYPES = [
  { id:"text",       label:"Text Post" },
  { id:"caption",    label:"Caption" },
  { id:"carousel",   label:"Carousel" },
  { id:"reel",       label:"Reel / Video" },
  { id:"script",     label:"TikTok Script" },
  { id:"thread",     label:"Thread" },
  { id:"promo",      label:"Promotional" },
  { id:"story",      label:"Story" },
  { id:"poll",       label:"Poll / Question" },
  { id:"testimonial",label:"Testimonial" },
  { id:"listicle",   label:"List Post" },
  { id:"howto",      label:"How-To" },
  { id:"educational",label:"Educational" },
  { id:"founder",    label:"Founder Story" },
  { id:"myth",       label:"Myth vs Truth" },
];

const CAMPAIGN_TYPES = [
  { id:"product-launch", label:"Product Launch" },
  { id:"webinar",        label:"Webinar" },
  { id:"challenge",      label:"Challenge" },
  { id:"evergreen",      label:"Evergreen Nurture" },
  { id:"promo-week",     label:"Promo Week" },
  { id:"sale",           label:"Sale" },
  { id:"waitlist",       label:"Waitlist" },
  { id:"lead-magnet",    label:"Lead Magnet" },
];

const REWRITE_ACTIONS = [
  { id:"shorten",         label:"✂️ Shorten",       desc:"Cut by 50%" },
  { id:"expand",          label:"📝 Expand",         desc:"Add depth" },
  { id:"bolder",          label:"⚡ Bolder",         desc:"Higher conviction" },
  { id:"playful",         label:"😄 Playful",        desc:"Fun & casual" },
  { id:"professional",    label:"👔 Professional",   desc:"Authority tone" },
  { id:"emotional",       label:"❤️ Emotional",      desc:"Vulnerable" },
  { id:"scroll-stopping", label:"🛑 Scroll-Stop",    desc:"Nuclear hook" },
];

const SYSTEM_TEMPLATES = [
  { id:"edu-post",        name:"Educational Post",      emoji:"📚", contentType:"educational", platform:"linkedin",  pillar:"education",      structure:"Counter-intuitive insight → 5 numbered lessons → closing truth → CTA",          promptScaffold:"Write an educational post sharing 5 key lessons about: ",  defaultGoal:"build authority",      systemTemplate:true },
  { id:"myth-buster",     name:"Myth Buster",           emoji:"💡", contentType:"text",         platform:"instagram", pillar:"education",      structure:"State the myth → bust it → explain why → CTA",                                   promptScaffold:"Bust a common myth about: ",                                defaultGoal:"engagement",           systemTemplate:true },
  { id:"list-post",       name:"List Post",             emoji:"📋", contentType:"listicle",     platform:"instagram", pillar:"education",      structure:"Bold hook → numbered list of 5-7 items → closing insight → CTA",                 promptScaffold:"Create a list post — 7 things about: ",                    defaultGoal:"saves and shares",     systemTemplate:true },
  { id:"how-to",          name:"How-To Post",           emoji:"🛠", contentType:"howto",        platform:"linkedin",  pillar:"education",      structure:"Problem statement → step-by-step guide → expected result → CTA",                promptScaffold:"Write a step-by-step how-to post about: ",                 defaultGoal:"build authority",      systemTemplate:true },
  { id:"story-post",      name:"Personal Story",        emoji:"🔓", contentType:"text",         platform:"instagram", pillar:"personal-story", structure:"Scene setting → struggle → turning point → lesson → CTA",                       promptScaffold:"Share a personal story and lesson about: ",                defaultGoal:"connection and trust", systemTemplate:true },
  { id:"authority-post",  name:"Authority Post",        emoji:"🏆", contentType:"text",         platform:"linkedin",  pillar:"authority",      structure:"Bold claim → 3 supporting points → proof → CTA",                                promptScaffold:"Write an authority post establishing expertise about: ",    defaultGoal:"credibility",          systemTemplate:true },
  { id:"engagement-q",    name:"Engagement Question",   emoji:"💬", contentType:"poll",         platform:"instagram", pillar:"engagement",     structure:"Relatable opener → this-or-that question → invite response",                     promptScaffold:"Create an engagement post to spark comments about: ",      defaultGoal:"comments",             systemTemplate:true },
  { id:"promo-post",      name:"Promotional Post",      emoji:"💰", contentType:"promo",        platform:"facebook",  pillar:"promotion",      structure:"Pain point → solution → 3 benefits → urgency → CTA",                            promptScaffold:"Write a promotional post for this offer: ",                defaultGoal:"sales",                systemTemplate:true },
  { id:"testimonial",     name:"Testimonial Post",      emoji:"⭐", contentType:"testimonial",  platform:"instagram", pillar:"social-proof",   structure:"Client quote → context → transformation → invitation",                          promptScaffold:"Write a testimonial post featuring a client result about: ",defaultGoal:"trust",                systemTemplate:true },
  { id:"founder-post",    name:"Founder Story",         emoji:"🌱", contentType:"founder",      platform:"linkedin",  pillar:"personal-story", structure:"Where I started → what went wrong → what I learned → where I am now",            promptScaffold:"Write a founder origin story about: ",                     defaultGoal:"brand trust",          systemTemplate:true },
  { id:"launch-post",     name:"Launch Post",           emoji:"🚀", contentType:"promo",        platform:"instagram", pillar:"promotion",      structure:"Big announcement → what it is → who it's for → what they get → urgency",        promptScaffold:"Write a launch announcement post for: ",                   defaultGoal:"conversions",          systemTemplate:true },
  { id:"threads-rant",    name:"Threads Mini-Rant",     emoji:"🧵", contentType:"thread",       platform:"threads",   pillar:"engagement",     structure:"Hot take → 2-3 punchy follow-ups → mic drop ending",                            promptScaffold:"Write a punchy Threads-style opinion about: ",             defaultGoal:"reach",                systemTemplate:true },
  { id:"tiktok-script",   name:"TikTok Talking Head",  emoji:"🎵", contentType:"script",       platform:"tiktok",    pillar:"education",      structure:"[Hook line] → [3-5 spoken points] → [CTA spoken]",                              promptScaffold:"Write a TikTok talking head script about: ",               defaultGoal:"views and follows",    systemTemplate:true },
  { id:"linkedin-insight",name:"LinkedIn Insight Post", emoji:"💼", contentType:"text",         platform:"linkedin",  pillar:"authority",      structure:"Counterintuitive insight → story/data → broader truth → professional CTA",      promptScaffold:"Write a LinkedIn insight post about: ",                    defaultGoal:"connections",          systemTemplate:true },
];

const DEFAULT_BRAND = {
  brandName:"", businessType:"", audienceDescription:"", toneWords:"",
  brandVoiceSummary:"", signaturePhrases:"", ctaPreferences:"",
  commonOffers:"", contentThemes:"", bannedWords:"",
  preferredPlatforms:[], writingStyleNotes:"",
  // Phase 3B additions
  sentenceStyle:"",   // e.g. "short punchy sentences" or "long flowing prose"
  humorLevel:"medium",        // "low" | "medium" | "high"
  boldnessLevel:"medium",     // "low" | "medium" | "high"
  emojiPreference:"light",    // "none" | "light" | "moderate" | "high"
  readingLevel:"standard",    // "simple" | "standard" | "advanced"
};

function seedCampaigns() {
  return [
    { id:"camp1", name:"Spring Launch",  type:"product-launch", description:"New offer launch for Q2", startDate:"2026-03-01", endDate:"2026-03-31", status:"active", createdAt:new Date().toISOString() },
    { id:"camp2", name:"Weekly Nurture", type:"evergreen",      description:"Ongoing educational content series", startDate:null, endDate:null, status:"active", createdAt:new Date().toISOString() },
  ];
}

function seedIdeas() {
  return [
    { id:"idea1", title:"The 3-hour workday myth",       ideaText:"Most productivity advice assumes 8+ hour days. What if you designed for 3 hours of deep work?",              tags:"productivity,entrepreneur",  pillar:"education",      platforms:["linkedin","threads"],   campaignId:null,    favorite:true,  status:"idea", notes:"Reference 4-hour work week angle",          createdAt:new Date().toISOString() },
    { id:"idea2", title:"Why I almost quit last year",   ideaText:"Personal story about hitting burnout — the morning I cried at my laptop and what changed after",             tags:"personal,story,burnout",     pillar:"personal-story", platforms:["instagram","facebook"], campaignId:null,    favorite:false, status:"idea", notes:"Be vulnerable — share the specific moment", createdAt:new Date().toISOString() },
    { id:"idea3", title:"5 pricing mistakes coaches make",ideaText:"List-style post: undercharging, no anchoring, no premium tier, discounting too fast, no packages",          tags:"pricing,coaches,business",   pillar:"education",      platforms:["linkedin","instagram"], campaignId:"camp1", favorite:true,  status:"idea", notes:"Link to my pricing workshop",               createdAt:new Date().toISOString() },
    { id:"idea4", title:"My content planning routine",   ideaText:"Behind the scenes: how I plan 30 days of content in 2 hours. Show the actual process.",                     tags:"content,planning,routine",   pillar:"behind-scenes",  platforms:["instagram","tiktok"],   campaignId:null,    favorite:false, status:"idea", notes:"Record the actual planning session",         createdAt:new Date().toISOString() },
  ];
}

function seedPosts() {
  const y=new Date().getFullYear(), m=new Date().getMonth();
  const make = (date, styleId, title, plats, status, extra={}) => ({
    id:uid(), date, title, platforms:plats, status, style:styleId,
    content: getMock(styleId, "small business owner", "growing your business"),
    contentType: extra.contentType||"text",
    pillar: extra.pillar||"education",
    campaignId: extra.campaignId||null,
    hashtags: extra.hashtags||"",
    notes: extra.notes||"",
    audience: extra.audience||"",
    goal: extra.goal||"",
    aiGenerated: true,
    repurposedFrom: null,
    analytics: extra.analytics||null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return [
    make(toKey(y,m,3),  "narrative-analogy",    "The cracked driveway",              ["instagram","linkedin"], "posted",    { pillar:"personal-story", analytics:{likes:234,comments:45,shares:12,saves:67,reach:3200} }),
    make(toKey(y,m,3),  "gary-vee",             "Stop waiting for permission",        ["facebook"],             "posted",    { pillar:"inspiration",    analytics:{likes:87,comments:23,shares:8,saves:15,reach:1100} }),
    make(toKey(y,m,8),  "contrarian-aphoristic","Working harder on the wrong thing",  ["instagram","linkedin","threads"],"ready",{ pillar:"education",  campaignId:"camp2" }),
    make(toKey(y,m,12), "russell-brunson",      "The epiphany bridge",                ["instagram","tiktok"],   "scheduled", { pillar:"personal-story", campaignId:"camp1", contentType:"script" }),
    make(toKey(y,m,15), "question-led",         "What if it's not the strategy?",     ["linkedin","threads"],   "draft",     { pillar:"engagement" }),
    make(toKey(y,m,19), "aphoristic",           "The faster you try to sell",          ["instagram"],            "draft",     { pillar:"authority" }),
    make(toKey(y,m,22), "educational",          "5 lessons from 100 sales calls",      ["linkedin"],             "draft",     { pillar:"education",  campaignId:"camp2" }),
    make(null, "direct-hook",    "Unscheduled — hook post",  ["instagram","linkedin"], "draft", { pillar:"education" }),
    make(null, "conversational", "Unscheduled — story post", ["instagram"],            "draft", { pillar:"personal-story" }),
  ];
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const C = { bg:"#050510", surf:"#0d0d25", surf2:"#0a0a1e", border:"#252550", pink:"#FF10F0", teal:"#00F5D4", white:"#ffffff", muted:"rgba(255,255,255,0.78)", dim:"rgba(255,255,255,0.44)", text:"rgba(255,255,255,0.96)" };

// ─── TYPOGRAPHY SCALE ─────────────────────────────────────────────────────────
const TYPE = {
  pageTitle:    "22px",
  sectionTitle: "18px",
  body:         "15px",
  label:        "13px",
  nav:          "13px",
  chip:         "12px",
  helper:       "12px",
  statNumber:   "24px",
  statLabel:    "13px",
};
const glow = (c,s=1) => `0 0 ${18*s}px ${c}44, 0 0 ${36*s}px ${c}18`;
const labelSt = { display:"block", marginBottom:"6px", fontSize:TYPE.label, fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.6px", color:C.muted };
const inputSt = { width:"100%", boxSizing:"border-box", background:C.surf2, border:`1px solid ${C.border}`, borderRadius:"8px", color:C.white, padding:"10px 13px", fontSize:"14px", outline:"none", fontFamily:"inherit" };

// ─── SHARED UI ────────────────────────────────────────────────────────────────

function GradText({ children }) {
  return <span style={{ background:`linear-gradient(135deg,${C.pink},${C.teal})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{children}</span>;
}
function Chip({ color, children, style={} }) {
  return <span style={{ display:"inline-flex", alignItems:"center", gap:"3px", padding:"2px 8px", borderRadius:"20px", fontSize:"10px", fontWeight:"700", background:color+"1a", color, border:`1px solid ${color}28`, ...style }}>{children}</span>;
}
function Btn({ children, onClick, disabled, variant="primary", style={}, small=false }) {
  const base = { border:"none", borderRadius:"9px", cursor:disabled?"not-allowed":"pointer", fontFamily:"inherit", fontWeight:"700", transition:"all 0.15s", padding:small?"6px 13px":"11px 22px", fontSize:small?"12px":"14px", opacity:disabled?0.4:1 };
  const V = {
    primary: { background:`linear-gradient(135deg,${C.pink},${C.teal})`, color:C.white, boxShadow:disabled?"none":glow(C.pink,1.1) },
    ghost:   { background:"transparent", color:C.muted, border:`1px solid ${C.border}` },
    teal:    { background:C.teal+"18", color:C.teal, border:`1px solid ${C.teal}40` },
    pink:    { background:C.pink+"18", color:C.pink, border:`1px solid ${C.pink}40` },
    danger:  { background:"#ff334418", color:"#ff6666", border:"1px solid #ff334428" },
  };
  return <button onClick={onClick} disabled={disabled} style={{...base,...V[variant],...style}}>{children}</button>;
}
function execCopy(text) {
  const el = document.createElement("textarea");
  el.value = text;
  el.setAttribute("readonly","");
  el.style.cssText = "position:absolute;left:-9999px;top:-9999px;opacity:0;";
  document.body.appendChild(el);
  el.select();
  try { document.execCommand("copy"); } catch(e){}
  document.body.removeChild(el);
}
function copyToClipboard(text) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => execCopy(text));
  } else {
    execCopy(text);
  }
}
function CopyBtn({ text, label="📋 Copy", small=true }) {
  const [done,setDone]=useState(false);
  return <Btn small={small} variant="ghost" style={{ color:done?C.teal:C.muted, borderColor:done?C.teal+"44":C.border }} onClick={()=>{ copyToClipboard(text); setDone(true); setTimeout(()=>setDone(false),2200); }}>{done?"✓ Copied":label}</Btn>;
}
function StatusDot({ status }) {
  const s=STATUSES.find(x=>x.id===status)||STATUSES[0];
  return <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:s.color, display:"inline-block", flexShrink:0, boxShadow:`0 0 5px ${s.color}88` }} />;
}
function PillarChip({ pillarId }) {
  if (!pillarId) return null;
  const p=PILLARS.find(x=>x.id===pillarId);
  if (p) return <Chip color={p.color} style={{fontSize:"9px"}}>{p.emoji} {p.label}</Chip>;
  return <Chip color="#aabbcc" style={{fontSize:"9px"}}>🏷 {pillarId}</Chip>;
}
function StatCard({ label, value, color, sub }) {
  return (
    <div style={{background:C.surf2,border:`1px solid ${color}44`,borderRadius:"12px",padding:"16px 18px",flex:1,minWidth:"110px",boxShadow:`0 0 14px ${color}28, 0 0 4px ${color}18`}}>
      <div style={{fontSize:TYPE.statLabel,color:C.muted,fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"5px"}}>{label}</div>
      <div style={{fontSize:TYPE.statNumber,fontWeight:"900",color:color}}>{value}</div>
      {sub&&<div style={{fontSize:TYPE.helper,color:C.muted,marginTop:"3px"}}>{sub}</div>}
    </div>
  );
}
function SectionHdr({ title, action }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px"}}>
      <h2 style={{fontSize:TYPE.sectionTitle,fontWeight:"800",color:C.white}}>{title}</h2>
      {action}
    </div>
  );
}
function Modal({ onClose, title, children, wide=false }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:"20px"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:"16px",padding:"24px",maxWidth:wide?"940px":"580px",width:"100%",maxHeight:"88vh",overflowY:"auto",boxShadow:glow(C.pink,1.5)}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
          <h3 style={{color:C.white,fontWeight:"800",fontSize:"15px"}}>{title}</h3>
          <Btn variant="ghost" small onClick={onClose}>✕</Btn>
        </div>
        {children}
      </div>
    </div>
  );
}
function SearchBar({ value, onChange, placeholder="Search…" }) {
  return (
    <div style={{position:"relative",flex:1,minWidth:"160px"}}>
      <span style={{position:"absolute",left:"11px",top:"50%",transform:"translateY(-50%)",color:C.muted,fontSize:"13px",pointerEvents:"none"}}>🔍</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{...inputSt,paddingLeft:"32px",fontSize:"13px",padding:"9px 12px 9px 32px"}} />
    </div>
  );
}
function Sel({ value, onChange, children, style={} }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)} style={{...inputSt,...style,padding:"8px 10px",fontSize:TYPE.label,cursor:"pointer"}}>
      {children}
    </select>
  );
}
function EmptyState({ icon, title, sub, action }) {
  return (
    <div style={{textAlign:"center",padding:"40px 20px",background:C.surf2,borderRadius:"14px",border:`1px dashed ${C.border}`}}>
      <div style={{fontSize:"36px",marginBottom:"10px"}}>{icon}</div>
      <div style={{color:C.white,fontWeight:"700",fontSize:TYPE.body,marginBottom:"6px"}}>{title}</div>
      <div style={{color:C.muted,fontSize:TYPE.helper,marginBottom:action?"14px":"0"}}>{sub}</div>
      {action}
    </div>
  );
}

// ─── CREATOR MODAL (FULL SCREEN) ──────────────────────────────────────────────

function CreatorModal({ apiKey, targetDate, onCreated, onClose, brandProfile={}, templatePrefill=null, ideaPrefill=null, campaigns=[] }) {
  const [expertRole,    setExpertRole]    = useState("");
  const [profession,    setProfession]    = useState(brandProfile.businessType||"");
  const [niche,         setNiche]         = useState("");
  const [styleId,       setStyleId]       = useState("narrative-analogy");
  const [contentPillar, setContentPillar] = useState("");
  const [topic,         setTopic]         = useState(ideaPrefill?.ideaText||templatePrefill?.promptScaffold||"");
  const [audience,      setAudience]      = useState(brandProfile.audienceDescription||"");
  const [ctaGoal,       setCtaGoal]       = useState(templatePrefill?.defaultGoal||brandProfile.ctaPreferences||"");
  const [platforms,     setPlatforms]     = useState(
    templatePrefill?.platform ? [templatePrefill.platform]
    : (brandProfile.preferredPlatforms||[]).length ? brandProfile.preferredPlatforms
    : ["instagram"]
  );
  const [generating,    setGenerating]    = useState(false);
  const [rawOutput,     setRawOutput]     = useState("");
  const [error,         setError]         = useState("");
  const [editSection,      setEditSection]      = useState(null);
  const [drafts,           setDrafts]           = useState({});
  const [activeCategory,   setActiveCategory]   = useState("signature");
  const [pillar,           setPillar]           = useState(ideaPrefill?.pillar||templatePrefill?.pillar||"");
  const [contentType,      setContentType]      = useState(templatePrefill?.contentType||"text");
  const [campaignId,       setCampaignId]       = useState(ideaPrefill?.campaignId||"");
  const [platformVersions, setPlatformVersions] = useState({}); // raw text per platform
  const [platformDrafts,   setPlatformDrafts]   = useState({}); // parsed {hook,coreMessage,body,cta} per platform
  const [genningPlatform,  setGenningPlatform]  = useState(null);
  const [activePlatTab,    setActivePlatTab]    = useState("main");

  const toggleP = id => setPlatforms(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);

  const generate = async () => {
    setGenerating(true); setError(""); setRawOutput(""); setEditSection(null); setDrafts({}); setPlatformVersions({}); setPlatformDrafts({}); setActivePlatTab("main");
    try {
      const raw = apiKey
        ? await callOpenAI(apiKey, styleId, { expertRole, profession, niche, topic: topic||contentPillar, audience, ctaGoal, contentPillar })
        : await new Promise(r => setTimeout(() => r(getMock(styleId, profession, topic||contentPillar)), 1500));
      setRawOutput(raw);
      const p = parseOutput(raw);
      // Always show structured sections — if AI output has no labels, put everything in BODY
      const structured = hasStructure(p) ? p : { hook:"", coreMessage:"", body:raw.trim(), cta:"" };
      setDrafts(structured);
    } catch(e) { setError(e.message); }
    finally { setGenerating(false); }
  };

  const generatePlatformVersion = async (pid) => {
    if(!fullPost) return;
    setGenningPlatform(pid);
    try {
      const version = apiKey
        ? await callOpenAIRepurpose(apiKey, pid, fullPost)
        : await new Promise(r => setTimeout(() => r(getMockRepurpose(pid, fullPost)), 1200));
      const pd = parseOutput(version);
      const pdStructured = hasStructure(pd) ? pd : { hook:"", coreMessage:"", body:version.trim(), cta:"" };
      setPlatformVersions(v => ({...v, [pid]: version}));
      setPlatformDrafts(d => ({...d, [pid]: pdStructured}));
      setActivePlatTab(pid);
    } catch(e) { setError(e.message); }
    finally { setGenningPlatform(null); }
  };

  const fullPost = drafts.hook
    ? [drafts.hook, drafts.coreMessage, drafts.body, drafts.cta].filter(Boolean).join("\n\n")
    : rawOutput;

  const activeContent = activePlatTab==="main" ? fullPost : (() => {
    const pd = platformDrafts[activePlatTab];
    if (pd) return [pd.hook, pd.coreMessage, pd.body, pd.cta].filter(Boolean).join("\n\n");
    return platformVersions[activePlatTab] || "";
  })();

  const save = () => {
    if (!activeContent) return;
    const ws = getStyle(styleId);
    const platForSave = activePlatTab==="main" ? platforms : [activePlatTab];
    onCreated({ id:uid(), date:targetDate||null, title:topic||contentPillar||ws?.name||"New post", content:activeContent, platforms:platForSave, status:"draft", style:styleId, pillar, contentType, campaignId:campaignId||null, hashtags:"", notes:"", createdAt:new Date().toISOString() });
  };

  const ws = getStyle(styleId);
  const catStyles = STYLE_CATEGORIES.find(c => c.id === activeCategory)?.styles || [];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(2,2,12,0.97)", zIndex:500, display:"flex", flexDirection:"column", fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom:`1px solid ${C.border}`, padding:"12px 24px", background:C.surf, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:28, height:28, borderRadius:"7px", background:`linear-gradient(135deg,${C.pink},${C.teal})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px" }}>⚡</div>
            <span style={{ fontSize:"16px", fontWeight:"800", color:C.white }}>Content Creator Builder™</span>
          </div>
          <div style={{ height:"20px", width:"1px", background:C.border }} />
          {targetDate ? <Chip color={C.teal}>📅 Scheduling for {friendly(targetDate)}</Chip> : <Chip color={C.muted}>📥 Saving to Unscheduled</Chip>}
          {templatePrefill && <Chip color="#f59e0b">📋 Template: {templatePrefill.name}</Chip>}
          {!apiKey && <Chip color={C.pink}>Demo mode: add your API key for live AI</Chip>}
        </div>
        <Btn variant="ghost" small onClick={onClose}>✕ Close</Btn>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"400px 1fr", overflow:"hidden" }}>

        {/* LEFT: Content Prompting Framework */}
        <div style={{ borderRight:`1px solid ${C.border}`, overflowY:"auto", display:"flex", flexDirection:"column" }}>
          {/* CPF badge */}
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, background:`${C.teal}06` }}>
            <div style={{ fontSize:"11px", fontWeight:"800", color:C.teal, textTransform:"uppercase", letterSpacing:"1px", marginBottom:"4px" }}>Content Prompting Framework™</div>
            <div style={{ fontSize:"11px", color:C.muted, lineHeight:"1.5" }}>Four steps to precise, high-performing AI content every time.</div>
          </div>

          <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:"20px" }}>

            {/* Step 1: Expert Role */}
            <div style={{ background:C.surf2, borderRadius:"10px", padding:"14px", border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg,${C.pink},${C.teal})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"800", color:C.white, flexShrink:0 }}>1</div>
                <div>
                  <div style={{ fontSize:"12px", fontWeight:"700", color:C.white }}>Define Expert Perspective</div>
                  <div style={{ fontSize:"10px", color:C.muted }}>Who should the AI be writing as?</div>
                </div>
              </div>
              <input value={expertRole} onChange={e=>setExpertRole(e.target.value)}
                placeholder={`e.g. "a senior copywriter specializing in service businesses"`}
                style={{ ...inputSt, fontSize:"13px", padding:"9px 12px" }} />
            </div>

            {/* Step 2: Context */}
            <div style={{ background:C.surf2, borderRadius:"10px", padding:"14px", border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg,${C.pink},${C.teal})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"800", color:C.white, flexShrink:0 }}>2</div>
                <div>
                  <div style={{ fontSize:"12px", fontWeight:"700", color:C.white }}>Provide Context</div>
                  <div style={{ fontSize:"10px", color:C.muted }}>Background the AI needs about you</div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                <div>
                  <label style={{ ...labelSt, fontSize:"10px", marginBottom:"4px" }}>Your Profession</label>
                  <input value={profession} onChange={e=>setProfession(e.target.value)} placeholder="e.g. Realtor, Coach…" style={{ ...inputSt, fontSize:"13px", padding:"8px 11px" }} />
                </div>
                <div>
                  <label style={{ ...labelSt, fontSize:"10px", marginBottom:"4px" }}>Niche / Background</label>
                  <input value={niche} onChange={e=>setNiche(e.target.value)} placeholder="e.g. luxury homes, life coaching…" style={{ ...inputSt, fontSize:"13px", padding:"8px 11px" }} />
                </div>
              </div>
            </div>

            {/* Step 3: Content Brief */}
            <div style={{ background:C.surf2, borderRadius:"10px", padding:"14px", border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"12px" }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg,${C.pink},${C.teal})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"800", color:C.white, flexShrink:0 }}>3</div>
                <div>
                  <div style={{ fontSize:"12px", fontWeight:"700", color:C.white }}>Content Brief</div>
                  <div style={{ fontSize:"10px", color:C.muted }}>The specific post you want to create</div>
                </div>
              </div>

              {/* Writing style */}
              <div style={{ marginBottom:"12px" }}>
                <label style={{ ...labelSt, fontSize:"10px", marginBottom:"6px" }}>Writing Style / Content Pillar</label>
                {/* Category tabs */}
                <div style={{ display:"flex", gap:"4px", flexWrap:"wrap", marginBottom:"8px" }}>
                  {STYLE_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={()=>setActiveCategory(cat.id)} style={{ background:activeCategory===cat.id?C.teal+"20":"transparent", border:`1px solid ${activeCategory===cat.id?C.teal:C.border}`, borderRadius:"6px", padding:"3px 9px", cursor:"pointer", color:activeCategory===cat.id?C.teal:C.muted, fontSize:"10px", fontWeight:activeCategory===cat.id?"700":"400", fontFamily:"inherit", transition:"all 0.12s" }}>
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"4px", maxHeight:"160px", overflowY:"auto" }}>
                  {catStyles.map(s => (
                    <button key={s.id} onClick={()=>setStyleId(s.id)} style={{ background:styleId===s.id?s.color+"18":"transparent", border:`1px solid ${styleId===s.id?s.color:C.border}`, borderRadius:"7px", padding:"7px 10px", cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"all 0.12s", display:"flex", alignItems:"center", gap:"8px" }}>
                      <span style={{ fontSize:"14px", flexShrink:0 }}>{s.emoji}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                          <span style={{ fontSize:"11px", fontWeight:"700", color:styleId===s.id?s.color:C.white }}>{s.name}</span>
                          {s.badge && <span style={{ fontSize:"9px", color:s.color }}>{s.badge}</span>}
                        </div>
                        <div style={{ fontSize:"10px", color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.desc}</div>
                      </div>
                      {styleId===s.id && <span style={{ color:s.color, flexShrink:0 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                <div>
                  <label style={{ ...labelSt, fontSize:"10px", marginBottom:"4px" }}>Audience Pain Point / Topic *</label>
                  <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. inconsistent lead generation, fear of posting…" style={{ ...inputSt, fontSize:"13px", padding:"8px 11px" }} />
                </div>
                <div>
                  <label style={{ ...labelSt, fontSize:"10px", marginBottom:"4px" }}>Target Audience</label>
                  <input value={audience} onChange={e=>setAudience(e.target.value)} placeholder="e.g. first-time homebuyers, small business owners…" style={{ ...inputSt, fontSize:"13px", padding:"8px 11px" }} />
                </div>
                <div>
                  <label style={{ ...labelSt, fontSize:"10px", marginBottom:"4px" }}>CTA / Post Goal / Offer</label>
                  <input value={ctaGoal} onChange={e=>setCtaGoal(e.target.value)} placeholder="e.g. book a call, follow for more, DM me…" style={{ ...inputSt, fontSize:"13px", padding:"8px 11px" }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                  <div>
                    <label style={{ ...labelSt, fontSize:"10px", marginBottom:"4px" }}>Content Pillar</label>
                    <Sel value={PILLARS.find(p=>p.id===pillar)?pillar:(pillar?"other":"")} onChange={v=>{if(v!=="other")setPillar(v);else setPillar("other");}}>
                      <option value="">No pillar</option>
                      {PILLARS.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
                      <option value="other">🏷 Other / Custom…</option>
                    </Sel>
                    {(pillar==="other"||(pillar&&!PILLARS.find(p=>p.id===pillar)))&&(
                      <input value={pillar==="other"?"":pillar} onChange={e=>setPillar(e.target.value||"other")} placeholder="Type your custom pillar…" style={{...inputSt,marginTop:"5px",fontSize:"12px",padding:"6px 10px"}} />
                    )}
                  </div>
                  <div>
                    <label style={{ ...labelSt, fontSize:"10px", marginBottom:"4px" }}>Content Type</label>
                    <Sel value={contentType} onChange={setContentType}>
                      {CONTENT_TYPES.map(ct=><option key={ct.id} value={ct.id}>{ct.emoji} {ct.label}</option>)}
                    </Sel>
                  </div>
                </div>
                {campaigns.length>0&&(
                  <div>
                    <label style={{ ...labelSt, fontSize:"10px", marginBottom:"4px" }}>Campaign (optional)</label>
                    <Sel value={campaignId} onChange={setCampaignId}>
                      <option value="">No campaign</option>
                      {campaigns.map(c=><option key={c.id} value={c.id}>🎯 {c.name}</option>)}
                    </Sel>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Platform */}
            <div style={{ background:C.surf2, borderRadius:"10px", padding:"14px", border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg,${C.pink},${C.teal})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"800", color:C.white, flexShrink:0 }}>4</div>
                <div>
                  <div style={{ fontSize:"12px", fontWeight:"700", color:C.white }}>Platform & Generate</div>
                  <div style={{ fontSize:"10px", color:C.muted }}>Where is this post going?</div>
                </div>
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"12px" }}>
                {PLATFORMS.map(p => { const on=platforms.includes(p.id); return <button key={p.id} onClick={()=>toggleP(p.id)} style={{ background:on?C.pink+"18":"transparent", border:`1px solid ${on?C.pink:C.border}`, borderRadius:"6px", padding:"5px 10px", cursor:"pointer", color:on?C.pink:C.muted, fontSize:"11px", fontWeight:on?"700":"400", fontFamily:"inherit", transition:"all 0.12s" }}>{p.emoji} {p.name}</button>; })}
              </div>
              <Btn onClick={generate} disabled={generating||!topic||platforms.length===0} style={{ width:"100%" }}>
                {generating ? "⚡ Generating…" : `✨ Generate ${ws ? ws.emoji + " " + ws.name : ""} Post`}
              </Btn>
              {error && <div style={{ background:"#ff334418", border:"1px solid #ff334428", borderRadius:"7px", padding:"9px 12px", fontSize:"12px", color:"#ff6666", marginTop:"8px" }}>⚠️ {error}</div>}
            </div>
          </div>
        </div>

        {/* RIGHT: Structured Output */}
        <div style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:"14px" }}>
            {generating && (
              <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px", minHeight:"300px" }}>
                <div style={{ width:64, height:64, borderRadius:"50%", background:`linear-gradient(135deg,${C.pink},${C.teal})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", boxShadow:glow(C.pink,2), animation:"pulse 1.4s ease-in-out infinite" }}>⚡</div>
                <div style={{ color:C.muted, fontSize:"14px" }}>Writing your {ws?.name} post…</div>
                <div style={{ fontSize:"12px", color:C.dim }}>Building: Hook → Core Message → Body → CTA</div>
              </div>
            )}

            {!generating && !rawOutput && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"300px", border:`1px dashed ${C.border}`, borderRadius:"14px" }}>
                <div style={{ textAlign:"center", color:C.dim }}>
                  <div style={{ fontSize:"40px", marginBottom:"14px" }}>✍️</div>
                  <div style={{ fontSize:"14px", marginBottom:"6px", color:C.muted }}>Your post will appear here</div>
                  <div style={{ fontSize:"12px" }}>Hook → Core Message → Body → CTA</div>
                </div>
              </div>
            )}

            {!generating && rawOutput && (
              <>
                {/* Platform version tabs — shown when multiple platforms selected */}
                {platforms.length>1&&(
                  <div style={{display:"flex",gap:"6px",flexWrap:"wrap",paddingBottom:"6px",borderBottom:`1px solid ${C.border}`,marginBottom:"4px"}}>
                    <button onClick={()=>setActivePlatTab("main")} style={{background:activePlatTab==="main"?`${C.pink}18`:"transparent",border:`1px solid ${activePlatTab==="main"?C.pink:C.border}`,borderRadius:"7px",padding:"5px 12px",color:activePlatTab==="main"?C.pink:C.muted,fontSize:"11px",fontWeight:"700",fontFamily:"inherit",cursor:"pointer"}}>
                      ✨ Base Version
                    </button>
                    {platforms.map(pid=>{
                      const pl=PLATFORMS.find(p=>p.id===pid); if(!pl) return null;
                      const hasVer=!!platformVersions[pid];
                      const isActive=activePlatTab===pid;
                      return (
                        <button key={pid} onClick={()=>hasVer?setActivePlatTab(pid):generatePlatformVersion(pid)}
                          style={{background:isActive?`${C.teal}18`:hasVer?`${C.teal}08`:"transparent",border:`1px solid ${isActive?C.teal:hasVer?C.teal+"44":C.border}`,borderRadius:"7px",padding:"5px 12px",color:isActive?C.teal:hasVer?C.teal:C.dim,fontSize:"11px",fontWeight:"700",fontFamily:"inherit",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"}}>
                          {genningPlatform===pid?"⏳":pl.emoji} {pl.label} {!hasVer&&"→ Generate"}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Main base output — always show sections, same pattern as PerfectPromptingScreen */}
                {activePlatTab==="main" && (
                  <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                    <OutputSection label="🪝 HOOK" sublabel="Scroll-stopping first line" color={C.pink} value={drafts.hook||""} isEditing={editSection==="hook"} onEdit={()=>setEditSection("hook")} onClose={()=>setEditSection(null)} onChange={v=>setDrafts(d=>({...d,hook:v}))} />
                    <OutputSection label="💡 CORE MESSAGE" sublabel="The essential insight in 1–2 sentences" color={C.teal} value={drafts.coreMessage||""} isEditing={editSection==="coreMessage"} onEdit={()=>setEditSection("coreMessage")} onClose={()=>setEditSection(null)} onChange={v=>setDrafts(d=>({...d,coreMessage:v}))} />
                    <OutputSection label="📝 BODY" sublabel="Main content in your chosen style" color="#9988ff" value={drafts.body||""} isEditing={editSection==="body"} onEdit={()=>setEditSection("body")} onClose={()=>setEditSection(null)} onChange={v=>setDrafts(d=>({...d,body:v}))} tall />
                    <OutputSection label="🎯 CTA" sublabel="Call to action" color="#ffaa44" value={drafts.cta||""} isEditing={editSection==="cta"} onEdit={()=>setEditSection("cta")} onClose={()=>setEditSection(null)} onChange={v=>setDrafts(d=>({...d,cta:v}))} />
                  </div>
                )}

                {/* Platform-specific version */}
                {activePlatTab!=="main" && (() => {
                  const platInfo = PLATFORMS.find(p=>p.id===activePlatTab);
                  const pd = platformDrafts[activePlatTab];
                  const rawVer = platformVersions[activePlatTab];
                  return (
                    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                      {/* Platform header bar */}
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 4px"}}>
                        <span style={{fontSize:"14px",fontWeight:"800",color:C.teal}}>
                          {platInfo?.emoji} {platInfo?.label} Version
                        </span>
                        <div style={{display:"flex",gap:"6px"}}>
                          <CopyBtn text={activeContent} />
                          <Btn small variant="ghost" onClick={()=>generatePlatformVersion(activePlatTab)}>↺ Redo</Btn>
                        </div>
                      </div>
                      {!rawVer && (
                        <div style={{color:C.muted,fontSize:"13px",padding:"10px 0"}}>Generating {platInfo?.label} version…</div>
                      )}
                      {rawVer && pd && (
                        <>
                          <OutputSection label="🪝 HOOK" sublabel="Scroll-stopping first line" color={C.pink}
                            value={pd.hook||""} isEditing={editSection==="plat-hook"}
                            onEdit={()=>setEditSection("plat-hook")} onClose={()=>setEditSection(null)}
                            onChange={v=>setPlatformDrafts(d=>({...d,[activePlatTab]:{...d[activePlatTab],hook:v}}))} />
                          <OutputSection label="💡 CORE MESSAGE" sublabel="The essential insight in 1–2 sentences" color={C.teal}
                            value={pd.coreMessage||""} isEditing={editSection==="plat-coreMessage"}
                            onEdit={()=>setEditSection("plat-coreMessage")} onClose={()=>setEditSection(null)}
                            onChange={v=>setPlatformDrafts(d=>({...d,[activePlatTab]:{...d[activePlatTab],coreMessage:v}}))} />
                          <OutputSection label="📝 BODY" sublabel="Main content adapted for this platform" color="#9988ff"
                            value={pd.body||""} isEditing={editSection==="plat-body"}
                            onEdit={()=>setEditSection("plat-body")} onClose={()=>setEditSection(null)}
                            onChange={v=>setPlatformDrafts(d=>({...d,[activePlatTab]:{...d[activePlatTab],body:v}}))} tall />
                          <OutputSection label="🎯 CTA" sublabel="Call to action" color="#ffaa44"
                            value={pd.cta||""} isEditing={editSection==="plat-cta"}
                            onEdit={()=>setEditSection("plat-cta")} onClose={()=>setEditSection(null)}
                            onChange={v=>setPlatformDrafts(d=>({...d,[activePlatTab]:{...d[activePlatTab],cta:v}}))} />
                        </>
                      )}
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* Footer */}
          {rawOutput && !generating && (
            <div style={{ borderTop:`1px solid ${C.border}`, padding:"14px 24px", background:C.surf, display:"flex", gap:"10px", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <div style={{ display:"flex", gap:"8px" }}>
                <CopyBtn text={activeContent} label="📋 Copy" small={false} />
                <Btn variant="ghost" onClick={()=>{ setRawOutput(""); setDrafts({}); setEditSection(null); setPlatformVersions({}); setPlatformDrafts({}); setActivePlatTab("main"); }}>Clear</Btn>
                <Btn variant="ghost" onClick={generate} small>↺ Regenerate</Btn>
              </div>
              <Btn onClick={save} disabled={!activeContent} style={{ minWidth:"200px" }}>
                {targetDate ? `📅 Add to ${friendly(targetDate)}` : "📥 Save to Unscheduled"}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OutputSection({ label, sublabel, color, value, isEditing, onEdit, onClose, onChange, tall=false }) {
  return (
    <div style={{ background:C.surf2, border:`1px solid ${color}55`, borderRadius:"12px", overflow:"hidden" }}>
      <div style={{ padding:"10px 16px", borderBottom:`1px solid ${color}33`, display:"flex", alignItems:"center", justifyContent:"space-between", background:color+"14" }}>
        <div>
          <span style={{ fontSize:"13px", fontWeight:"800", color }}>{label}</span>
          <span style={{ fontSize:"11px", color:C.muted, marginLeft:"8px" }}>{sublabel}</span>
        </div>
        <div style={{ display:"flex", gap:"6px" }}>
          <CopyBtn text={value} />
          {isEditing
            ? <Btn small variant="ghost" onClick={onClose}>Done</Btn>
            : <Btn small variant="ghost" onClick={onEdit}>✏️ Edit</Btn>
          }
        </div>
      </div>
      <div style={{ padding:"16px 18px", minHeight:"70px" }}>
        {isEditing ? (
          <textarea value={value} onChange={e=>onChange(e.target.value)} rows={tall?8:4}
            style={{ ...inputSt, resize:"vertical", lineHeight:"1.75", background:C.bg, fontSize:"14px" }} />
        ) : value ? (
          <pre style={{ whiteSpace:"pre-wrap", wordBreak:"break-word", color:C.white, lineHeight:"1.85", fontSize:"15px", fontFamily:"inherit", margin:0 }}>{value}</pre>
        ) : (
          <div style={{ color:C.muted, fontStyle:"italic", fontSize:"13px", paddingTop:"8px" }}>— no content —</div>
        )}
      </div>
    </div>
  );
}

// ─── POST EDITOR ─────────────────────────────────────────────────────────────

function PostEditor({ post, onSave, onDelete, onClose, campaigns=[], apiKey="", onRepurpose=null }) {
  const [title,       setTitle]       = useState(post.title||"");
  const [content,     setContent]     = useState(post.content||"");
  const [plats,       setPlats]       = useState(post.platforms||[]);
  const [status,      setStatus]      = useState(post.status||"draft");
  const [style,       setStyle]       = useState(post.style||"");
  const [pillar,      setPillar]      = useState(post.pillar||"");
  const [contentType, setContentType] = useState(post.contentType||"text");
  const [campaignId,  setCampaignId]  = useState(post.campaignId||"");
  const [hashtags,    setHashtags]    = useState(post.hashtags||"");
  const [notes,       setNotes]       = useState(post.notes||"");
  const [rewriting,   setRewriting]   = useState(false);
  const [rewriteErr,  setRewriteErr]  = useState("");
  const [showRewrite, setShowRewrite] = useState(false);

  const toggleP = id => setPlats(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const save = () => onSave({ ...post, title:title||content.slice(0,50)+"…", content, platforms:plats, status, style, pillar, contentType, campaignId:campaignId||null, hashtags, notes, updatedAt:new Date().toISOString() });
  const doDelete = e => { e.stopPropagation(); onDelete(post.id); };

  const doRewrite = async actionId => {
    setRewriting(true); setRewriteErr("");
    try {
      const result = apiKey
        ? await callOpenAIRewrite(apiKey, content, actionId)
        : getMockRewrite(content, actionId);
      setContent(result);
    } catch(e) { setRewriteErr(e.message); }
    finally { setRewriting(false); }
  };

  return (
    <div style={{ background:C.bg, border:`1px solid ${C.pink}44`, borderRadius:"12px", padding:"14px", boxShadow:glow(C.pink,0.5) }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
        <span style={{ fontSize:"12px", fontWeight:"700", color:C.pink }}>✏️ Edit Post</span>
        <div style={{ display:"flex", gap:"5px" }}>
          {onRepurpose&&<Btn small variant="teal" onClick={()=>onRepurpose({...post,content})}>🔄 Repurpose</Btn>}
          <CopyBtn text={content} small />
          <Btn small onClick={save}>Save</Btn>
          <Btn small variant="ghost" onClick={onClose}>✕</Btn>
        </div>
      </div>

      {/* Title */}
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Post title (for your reference)"
        style={{ ...inputSt, marginBottom:"8px", padding:"8px 11px", fontSize:"13px", background:C.surf2 }} />

      {/* Content */}
      <textarea value={content} onChange={e=>setContent(e.target.value)} rows={8}
        style={{ ...inputSt, resize:"vertical", lineHeight:"1.75", background:C.surf2, marginBottom:"8px" }} />

      {/* Rewrite actions */}
      <div style={{ marginBottom:"10px" }}>
        <button onClick={()=>setShowRewrite(r=>!r)} style={{ background:"transparent", border:`1px solid ${C.border}`, borderRadius:"6px", padding:"5px 11px", cursor:"pointer", color:C.muted, fontSize:"11px", fontWeight:"600", fontFamily:"inherit", marginBottom:"6px" }}>
          {showRewrite?"▲ Hide Rewrite Actions":"⚡ Rewrite with AI"}
        </button>
        {showRewrite&&(
          <div style={{ background:C.surf2, borderRadius:"8px", padding:"10px", border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:"10px", color:C.muted, marginBottom:"8px" }}>{apiKey?"Live AI rewrites:":"Demo rewrites (add API key for live AI):"}</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
              {REWRITE_ACTIONS.map(a=>(
                <button key={a.id} onClick={()=>doRewrite(a.id)} disabled={rewriting} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:"6px", padding:"4px 10px", cursor:rewriting?"not-allowed":"pointer", color:C.text, fontSize:"11px", fontFamily:"inherit", opacity:rewriting?0.5:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"1px" }}>
                  <span>{a.label}</span>
                  <span style={{ fontSize:"9px", color:C.muted }}>{a.desc}</span>
                </button>
              ))}
            </div>
            {rewriting&&<div style={{ fontSize:"11px", color:C.teal, marginTop:"6px" }}>Rewriting…</div>}
            {rewriteErr&&<div style={{ fontSize:"11px", color:"#ff6666", marginTop:"6px" }}>⚠️ {rewriteErr}</div>}
          </div>
        )}
      </div>

      {/* Fields grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"8px" }}>
        <div>
          <label style={{ ...labelSt, fontSize:"10px", marginBottom:"3px" }}>Content Pillar</label>
          <Sel value={PILLARS.find(p=>p.id===pillar)?pillar:(pillar?"other":"")} onChange={v=>{if(v!=="other")setPillar(v);else setPillar("other");}} style={{ width:"100%", fontSize:"11px" }}>
            <option value="">No pillar</option>
            {PILLARS.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
            <option value="other">🏷 Other / Custom…</option>
          </Sel>
          {(pillar==="other"||(pillar&&!PILLARS.find(p=>p.id===pillar)))&&(
            <input value={pillar==="other"?"":pillar} onChange={e=>setPillar(e.target.value||"other")} placeholder="Type your custom pillar…" style={{...inputSt,marginTop:"5px",fontSize:"11px",padding:"5px 8px"}} />
          )}
        </div>
        <div>
          <label style={{ ...labelSt, fontSize:"10px", marginBottom:"3px" }}>Content Type</label>
          <Sel value={contentType} onChange={setContentType} style={{ width:"100%", fontSize:"11px" }}>
            {CONTENT_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
          </Sel>
        </div>
      </div>

      <div style={{ marginBottom:"8px" }}>
        <label style={{ ...labelSt, fontSize:"10px", marginBottom:"3px" }}>Campaign</label>
        <Sel value={campaignId} onChange={setCampaignId} style={{ width:"100%", fontSize:"11px" }}>
          <option value="">No campaign</option>
          {campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </Sel>
      </div>

      {/* Style */}
      <div style={{ marginBottom:"8px" }}>
        <label style={{ ...labelSt, fontSize:"10px", marginBottom:"4px" }}>Writing Style</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
          {ALL_STYLES.map(ws=><button key={ws.id} onClick={()=>setStyle(ws.id)} style={{ background:style===ws.id?ws.color+"18":"transparent", border:`1px solid ${style===ws.id?ws.color:C.border}`, borderRadius:"5px", padding:"3px 9px", cursor:"pointer", color:style===ws.id?ws.color:C.muted, fontSize:"10px", fontWeight:style===ws.id?"700":"400", fontFamily:"inherit" }}>{ws.emoji} {ws.name}</button>)}
        </div>
      </div>

      {/* Platforms */}
      <div style={{ marginBottom:"8px" }}>
        <label style={{ ...labelSt, fontSize:"10px", marginBottom:"4px" }}>Platforms</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
          {PLATFORMS.map(p=>{const on=plats.includes(p.id);return <button key={p.id} onClick={()=>toggleP(p.id)} style={{ background:on?C.pink+"18":"transparent", border:`1px solid ${on?C.pink:C.border}`, borderRadius:"5px", padding:"3px 9px", cursor:"pointer", color:on?C.pink:C.muted, fontSize:"10px", fontWeight:on?"700":"400", fontFamily:"inherit" }}>{p.emoji} {p.name}</button>;})}
        </div>
      </div>

      {/* Status */}
      <div style={{ marginBottom:"8px" }}>
        <label style={{ ...labelSt, fontSize:"10px", marginBottom:"4px" }}>Status</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
          {STATUSES.map(s=><button key={s.id} onClick={()=>setStatus(s.id)} style={{ background:status===s.id?s.color+"18":"transparent", border:`1px solid ${status===s.id?s.color:C.border}`, borderRadius:"5px", padding:"4px 10px", cursor:"pointer", color:status===s.id?s.color:C.muted, fontSize:"10px", fontWeight:status===s.id?"700":"400", fontFamily:"inherit", display:"flex", alignItems:"center", gap:"4px" }}><StatusDot status={s.id}/>{s.label}</button>)}
        </div>
      </div>

      {/* Hashtags */}
      <div style={{ marginBottom:"8px" }}>
        <label style={{ ...labelSt, fontSize:"10px", marginBottom:"3px" }}>Hashtags</label>
        <input value={hashtags} onChange={e=>setHashtags(e.target.value)} placeholder="#yourbrand #niche #content" style={{ ...inputSt, fontSize:"12px", padding:"7px 10px", background:C.surf2 }} />
      </div>

      {/* Notes */}
      <div style={{ marginBottom:"12px" }}>
        <label style={{ ...labelSt, fontSize:"10px", marginBottom:"3px" }}>Notes (internal)</label>
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes for yourself about this post…" style={{ ...inputSt, resize:"vertical", fontSize:"12px", background:C.surf2, lineHeight:"1.5" }} />
      </div>

      {/* Footer */}
      <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"8px", borderTop:`1px solid ${C.border}` }}>
        <Btn small variant="danger" onClick={doDelete}>🗑 Delete</Btn>
        <Btn small onClick={save}>💾 Save Changes</Btn>
      </div>
    </div>
  );
}

// ─── POST CARD ────────────────────────────────────────────────────────────────

function PostCard({ post, isDragging, onDragStart, onDragEnd, onClick }) {
  const wasDrag = useRef(false);
  const stat = STATUSES.find(s=>s.id===post.status)||STATUSES[0];
  const ws   = getStyle(post.style);
  return (
    <div draggable
      onDragStart={e=>{ wasDrag.current=true; e.dataTransfer.effectAllowed="move"; onDragStart(); }}
      onDragEnd={()=>{ onDragEnd(); setTimeout(()=>{ wasDrag.current=false; },80); }}
      onClick={()=>{ if(!wasDrag.current) onClick(); }}
      style={{ background:C.surf2, border:`1px solid ${C.border}`, borderLeft:`3px solid ${stat.color}`, borderRadius:"10px", padding:"11px 12px", cursor:"grab", opacity:isDragging?0.3:1, transition:"opacity 0.15s", userSelect:"none" }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"6px", marginBottom:"5px" }}>
        <span style={{ fontSize:"12px", fontWeight:"700", color:C.white, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{post.title||post.content.slice(0,40)+"…"}</span>
        <Chip color={stat.color}>{stat.label}</Chip>
      </div>
      <div style={{ fontSize:"11px", color:C.muted, lineHeight:"1.5", marginBottom:"7px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{post.content}</div>
      {post.pillar&&<div style={{marginBottom:"4px"}}><PillarChip pillarId={post.pillar} /></div>}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:"3px" }}>
          {post.platforms.map(pid=><span key={pid} style={{ fontSize:"11px" }}>{PLATFORMS.find(p=>p.id===pid)?.emoji}</span>)}
          {ws&&<span style={{ marginLeft:"4px", fontSize:"10px", color:ws.color, background:ws.color+"14", borderRadius:"8px", padding:"1px 6px" }}>{ws.emoji} {ws.name}</span>}
        </div>
        <span style={{ fontSize:"10px", color:C.dim }}>⠿ drag</span>
      </div>
    </div>
  );
}

// ─── DAY CELL ─────────────────────────────────────────────────────────────────

function DayCell({ day, year, month, posts, selected, isToday, isDropTarget, draggingId, onCellClick, onPostClick, onPostDragStart, onPostDragEnd, onDragOver, onDragLeave, onDrop, onStatusChange }) {
  const [activeChipId, setActiveChipId] = useState(null);
  if(!day) return <div style={{ minHeight:"90px" }} />;
  const key=toKey(year,month,day);
  const dp=posts.filter(p=>p.date===key);
  const STATUS_QUICK = [{id:"draft",label:"Draft",color:"#666699"},{id:"ready",label:"Ready",color:C.teal},{id:"scheduled",label:"Scheduled",color:"#f59e0b"},{id:"posted",label:"Posted",color:C.pink}];
  return (
    <div onClick={()=>{setActiveChipId(null);onCellClick(key);}} onDragOver={e=>{e.preventDefault();onDragOver(key);}} onDragLeave={onDragLeave} onDrop={e=>{e.preventDefault();onDrop(key);}}
      style={{ background:isDropTarget?`${C.teal}12`:selected?`${C.pink}0a`:C.surf2, border:`1px solid ${isDropTarget?C.teal:selected?C.pink:isToday?C.teal+"55":C.border}`, borderRadius:"9px", minHeight:"90px", padding:"6px", cursor:"pointer", transition:"all 0.12s", boxShadow:isDropTarget?glow(C.teal,1.4):selected?glow(C.pink,0.7):isToday?glow(C.teal,0.3):"none", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"3px" }}>
        <span style={{ fontSize:"11px", fontWeight:isToday?"900":"700", color:isToday?C.teal:selected?C.pink:C.muted }}>{day}</span>
        {isToday&&<span style={{ fontSize:"7px", fontWeight:"800", color:C.teal, letterSpacing:"0.5px" }}>TODAY</span>}
        {isDropTarget&&<span style={{ fontSize:"9px", color:C.teal }}>⬇</span>}
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"2px" }}>
        {dp.slice(0,3).map(p=>{
          const sc=STATUSES.find(s=>s.id===p.status)?.color||C.muted;
          const isActive = activeChipId===p.id;
          return (
            <div key={p.id}>
              <div draggable
                onDragStart={e=>{e.stopPropagation();e.dataTransfer.effectAllowed="move";onPostDragStart(p.id);}}
                onDragEnd={e=>{e.stopPropagation();onPostDragEnd();}}
                onClick={e=>{e.stopPropagation();setActiveChipId(isActive?null:p.id);}}
                style={{ display:"flex", alignItems:"center", gap:"3px", background:isActive?sc+"30":sc+"14", border:isActive?`1px solid ${sc}55`:"1px solid transparent", borderRadius:"3px", padding:"2px 4px", cursor:"pointer", opacity:draggingId===p.id?0.25:1, userSelect:"none" }}>
                <StatusDot status={p.status}/>
                <span style={{ fontSize:"8px", color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{p.title||p.content.slice(0,20)}</span>
                <span style={{ fontSize:"7px", color:sc, flexShrink:0 }}>{isActive?"▲":"▼"}</span>
              </div>
              {isActive&&(
                <div onClick={e=>e.stopPropagation()} style={{ background:C.surf, border:`1px solid ${sc}55`, borderRadius:"5px", padding:"5px 6px", marginTop:"2px", display:"flex", flexDirection:"column", gap:"3px", zIndex:10 }}>
                  <div style={{ fontSize:"8px", color:C.dim, marginBottom:"1px", fontWeight:"700" }}>Change status:</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"3px" }}>
                    {STATUS_QUICK.map(s=>(
                      <button key={s.id} onClick={()=>{onStatusChange(p.id,s.id);setActiveChipId(null);}}
                        style={{ background:p.status===s.id?`${s.color}33`:"transparent", border:`1px solid ${p.status===s.id?s.color:C.border}`, borderRadius:"3px", padding:"1px 5px", color:p.status===s.id?s.color:C.dim, fontSize:"8px", fontWeight:"700", fontFamily:"inherit", cursor:"pointer" }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>{onPostClick(p.id,key);setActiveChipId(null);}} style={{ background:`${C.pink}18`, border:`1px solid ${C.pink}44`, borderRadius:"3px", padding:"2px 5px", color:C.pink, fontSize:"8px", fontWeight:"700", fontFamily:"inherit", cursor:"pointer", marginTop:"2px", textAlign:"center" }}>
                    ✏️ Edit Post
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {dp.length>3&&<span style={{ fontSize:"8px", color:C.dim, paddingLeft:"3px" }}>+{dp.length-3}</span>}
      </div>
      {dp.length>0&&(
        <div style={{ display:"flex", gap:"1px", marginTop:"2px", flexWrap:"wrap" }}>
          {[...new Set(dp.flatMap(p=>p.platforms))].map(pid=><span key={pid} style={{ fontSize:"8px" }}>{PLATFORMS.find(p=>p.id===pid)?.emoji}</span>)}
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS MODAL ───────────────────────────────────────────────────────────

function SettingsModal({ apiKey, setApiKey, onClose }) {
  const [draft,setDraft]=useState(apiKey);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:400, padding:"20px" }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:"16px", padding:"28px", maxWidth:"440px", width:"100%", boxShadow:glow(C.pink,1.5) }}>
        <h3 style={{ color:C.white, fontWeight:"800", marginBottom:"6px" }}>⚙ API Settings</h3>
        <p style={{ color:C.muted, fontSize:"13px", marginBottom:"18px", lineHeight:"1.6" }}>Add your OpenAI key to enable live AI generation. Without it, high-quality pre-written examples are used.</p>
        <label style={labelSt}>OpenAI API Key</label>
        <input type="password" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="sk-…" style={{ ...inputSt, marginBottom:"12px" }} />
        <div style={{ background:`${C.teal}10`, border:`1px solid ${C.teal}28`, borderRadius:"8px", padding:"10px 13px", marginBottom:"18px" }}>
          <p style={{ color:C.teal, fontSize:"12px", margin:0, lineHeight:"1.5" }}>Get your key at <strong>platform.openai.com</strong> → API Keys. Stored in your session only.</p>
        </div>
        <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn onClick={()=>{ setApiKey(draft); onClose(); }}>Save Key</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── REPURPOSE MODAL ──────────────────────────────────────────────────────────

function RepurposeModal({ apiKey, post, onSave, onClose }) {
  const [master, setMaster] = useState(post?.content || "");
  const [selectedPlats, setSelectedPlats] = useState(["facebook","instagram","linkedin","tiktok","threads"]);
  const [results, setResults] = useState({});        // { platformId: content string }
  const [edits, setEdits] = useState({});            // { platformId: edited string }
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("facebook");
  const [error, setError] = useState("");
  const [selectedToSave, setSelectedToSave] = useState({});
  const [repEditSection, setRepEditSection] = useState(null); // "pid-field" for section editing

  const togglePlat = id => setSelectedPlats(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const generate = async () => {
    if(!master.trim()) return;
    setGenerating(true); setError(""); setResults({}); setEdits({});
    try {
      const newResults = {};
      for(const pid of selectedPlats) {
        const content = apiKey
          ? await callOpenAIRepurpose(apiKey, pid, master)
          : await new Promise(r=>setTimeout(()=>r(getMockRepurpose(pid, master)), 600));
        newResults[pid] = content;
      }
      setResults(newResults);
      setEdits(Object.fromEntries(Object.entries(newResults).map(([k,v])=>[k,v])));
      setSelectedToSave(Object.fromEntries(selectedPlats.map(k=>[k,true])));
      setActiveTab(selectedPlats[0]);
    } catch(e) { setError(e.message); }
    finally { setGenerating(false); }
  };

  const EXTRA_TARGET_NAMES = {"teddy-thread":"Teddy Thread","perfect-prompt":"Perfect Prompt","carousel":"Carousel","reel-script":"Reel Script","hook-variations":"Hook Variations"};
  const saveSelected = () => {
    const toSave = Object.entries(edits)
      .filter(([pid])=>selectedToSave[pid])
      .map(([pid,content])=>{
        const platMatch = PLATFORMS.find(p=>p.id===pid);
        const targetName = platMatch?.name || EXTRA_TARGET_NAMES[pid] || pid;
        const isFormat = !!EXTRA_TARGET_NAMES[pid];
        return {
          id:uid(), date:post?.date||null,
          title:`${post?.title||"Post"} (${targetName})`,
          content, platforms:isFormat?post?.platforms||[]:([pid]),
          status:"draft", style:post?.style||"direct-hook",
          pillar:post?.pillar||"", contentType:isFormat?pid:"text",
          campaignId:post?.campaignId||null,
          hashtags:"", notes:`Repurposed from: ${post?.title||"original post"} → ${targetName}`,
          repurposedFrom:post?.id||null,
          analytics:null, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
        };
      });
    onSave(toSave);
  };

  const hasResults = Object.keys(results).length > 0;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(2,2,12,0.97)",zIndex:500,display:"flex",flexDirection:"column",fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif"}}>
      {/* Header */}
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"12px 24px",background:C.surf,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:28,height:28,borderRadius:"7px",background:`linear-gradient(135deg,${C.pink},${C.teal})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px"}}>🔄</div>
          <span style={{fontSize:"16px",fontWeight:"800",color:C.white}}>Cross-Platform Repurposing Engine</span>
          {!apiKey && <Chip color={C.pink}>Demo mode: add your API key for live AI</Chip>}
        </div>
        <Btn variant="ghost" small onClick={onClose}>✕ Close</Btn>
      </div>

      {/* Body */}
      <div style={{flex:1,display:"grid",gridTemplateColumns:"380px 1fr",overflow:"hidden"}}>
        {/* LEFT: Master content + platform selection */}
        <div style={{borderRight:`1px solid ${C.border}`,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:"16px"}}>
          <div>
            <label style={labelSt}>Master Content</label>
            <textarea value={master} onChange={e=>setMaster(e.target.value)} rows={10}
              placeholder="Paste your original post or type your core idea here. We'll adapt it for each platform while keeping your message intact."
              style={{...inputSt,resize:"vertical",lineHeight:"1.7",fontSize:"13px"}} />
          </div>
          <div>
            <label style={labelSt}>Repurpose For</label>
            <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
              {[
                ...PLATFORMS.map(p=>({id:p.id,emoji:p.emoji,name:p.name,desc:{facebook:"Conversational + question",instagram:"Punchy + hashtags",linkedin:"Professional insight",tiktok:"Spoken script",threads:"Short hot take"}[p.id]||""})),
                {id:"teddy-thread",  emoji:"🧵",name:"Teddy Thread",      desc:"9-block structured thread"},
                {id:"perfect-prompt",emoji:"🧠",name:"Perfect Prompt",    desc:"4-part AI prompt template"},
                {id:"carousel",      emoji:"📱",name:"Carousel Slides",   desc:"8-slide Instagram carousel"},
                {id:"reel-script",   emoji:"🎬",name:"Reel Script",       desc:"30-45 sec talking-head script"},
                {id:"hook-variations",emoji:"🪝",name:"5 Hook Variations", desc:"Contrarian, Curiosity, Promise, Story, Q"},
              ].map(p=>{
                const on=selectedPlats.includes(p.id);
                return (
                  <button key={p.id} onClick={()=>togglePlat(p.id)} style={{background:on?C.pink+"15":"transparent",border:`1px solid ${on?C.pink:C.border}`,borderRadius:"8px",padding:"9px 12px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",display:"flex",alignItems:"center",gap:"10px",transition:"all 0.12s"}}>
                    <span style={{fontSize:"16px"}}>{p.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:TYPE.label,fontWeight:"700",color:on?C.pink:C.white}}>{p.name}</div>
                      <div style={{fontSize:TYPE.helper,color:C.muted}}>{p.desc}</div>
                    </div>
                    {on&&<span style={{color:C.pink,fontSize:"12px"}}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <Btn onClick={generate} disabled={generating||!master.trim()||selectedPlats.length===0}>
            {generating?"🔄 Generating versions…":"✨ Repurpose for All Platforms"}
          </Btn>
          {error&&<div style={{background:"#ff334418",border:"1px solid #ff334428",borderRadius:"7px",padding:"9px 12px",fontSize:"12px",color:"#ff6666"}}>⚠️ {error}</div>}
        </div>

        {/* RIGHT: Platform results in tabs */}
        <div style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {!hasResults && !generating && (
            <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{textAlign:"center",color:C.dim}}>
                <div style={{fontSize:"48px",marginBottom:"16px"}}>🔄</div>
                <div style={{fontSize:"15px",color:C.muted,marginBottom:"6px"}}>Platform versions appear here</div>
                <div style={{fontSize:"12px"}}>Select platforms and hit Repurpose</div>
              </div>
            </div>
          )}
          {generating && (
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"14px"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.pink},${C.teal})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",boxShadow:glow(C.pink,2),animation:"pulse 1.4s ease-in-out infinite"}}>🔄</div>
              <div style={{color:C.muted,fontSize:"14px"}}>Adapting your content for {selectedPlats.length} platforms…</div>
            </div>
          )}
          {hasResults && !generating && (
            <>
              {/* Platform tabs */}
              <div style={{borderBottom:`1px solid ${C.border}`,padding:"0 20px",display:"flex",gap:"2px",flexShrink:0,overflowX:"auto"}}>
                {Object.keys(results).map(pid=>{
                  const pl=PLATFORMS.find(p=>p.id===pid);
                  const active=activeTab===pid;
                  return (
                    <button key={pid} onClick={()=>setActiveTab(pid)} style={{background:"transparent",border:"none",borderBottom:`2px solid ${active?C.pink:"transparent"}`,padding:"10px 14px",cursor:"pointer",color:active?C.pink:C.muted,fontSize:"12px",fontWeight:active?"700":"500",fontFamily:"inherit",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:"5px"}}>
                      {pl?.emoji} {pl?.name}
                      {selectedToSave[pid]&&<span style={{width:"6px",height:"6px",borderRadius:"50%",background:C.teal,display:"inline-block"}}/>}
                    </button>
                  );
                })}
              </div>
              {/* Active platform content */}
              {Object.entries(edits).map(([pid,content])=>activeTab===pid&&(
                <div key={pid} style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
                  <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:"10px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{fontSize:"12px",fontWeight:"700",color:C.muted,textTransform:"uppercase",letterSpacing:"0.6px"}}>{PLATFORMS.find(p=>p.id===pid)?.name} Version</div>
                      <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                        <CopyBtn text={content} />
                        <label style={{display:"flex",alignItems:"center",gap:"5px",cursor:"pointer",fontSize:"12px",color:selectedToSave[pid]?C.teal:C.muted}}>
                          <input type="checkbox" checked={!!selectedToSave[pid]} onChange={e=>setSelectedToSave(prev=>({...prev,[pid]:e.target.checked}))} style={{accentColor:C.teal}} />
                          Save this version
                        </label>
                      </div>
                    </div>
                    {(()=>{
                      const p=parseOutput(content);
                      const s=hasStructure(p)?p:{hook:"",coreMessage:"",body:content.trim(),cta:""};
                      const upd=(field,value)=>{
                        const n={...s,[field]:value};
                        const raw=[n.hook?`HOOK:\n${n.hook}`:"",n.coreMessage?`CORE MESSAGE:\n${n.coreMessage}`:"",n.body?`BODY:\n${n.body}`:"",n.cta?`CTA:\n${n.cta}`:""].filter(Boolean).join("\n\n");
                        setEdits(prev=>({...prev,[pid]:raw}));
                      };
                      return (<>
                        <OutputSection label="🪝 HOOK" sublabel="Scroll-stopping first line" color={C.pink} value={s.hook||""} isEditing={repEditSection===`${pid}-hook`} onEdit={()=>setRepEditSection(`${pid}-hook`)} onClose={()=>setRepEditSection(null)} onChange={v=>upd("hook",v)} />
                        <OutputSection label="💡 CORE MESSAGE" sublabel="The essential insight in 1–2 sentences" color={C.teal} value={s.coreMessage||""} isEditing={repEditSection===`${pid}-coreMessage`} onEdit={()=>setRepEditSection(`${pid}-coreMessage`)} onClose={()=>setRepEditSection(null)} onChange={v=>upd("coreMessage",v)} />
                        <OutputSection label="📝 BODY" sublabel="Main content for this platform" color="#9988ff" value={s.body||""} isEditing={repEditSection===`${pid}-body`} onEdit={()=>setRepEditSection(`${pid}-body`)} onClose={()=>setRepEditSection(null)} onChange={v=>upd("body",v)} tall />
                        <OutputSection label="🎯 CTA" sublabel="Call to action" color="#ffaa44" value={s.cta||""} isEditing={repEditSection===`${pid}-cta`} onEdit={()=>setRepEditSection(`${pid}-cta`)} onClose={()=>setRepEditSection(null)} onChange={v=>upd("cta",v)} />
                      </>);
                    })()}
                  </div>
                </div>
              ))}
              {/* Footer */}
              <div style={{borderTop:`1px solid ${C.border}`,padding:"14px 24px",background:C.surf,display:"flex",gap:"10px",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                <div style={{fontSize:"12px",color:C.muted}}>{Object.values(selectedToSave).filter(Boolean).length} version{Object.values(selectedToSave).filter(Boolean).length!==1?"s":""} selected to save</div>
                <div style={{display:"flex",gap:"8px"}}>
                  <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
                  <Btn onClick={saveSelected} disabled={!Object.values(selectedToSave).some(Boolean)}>
                    📥 Save Selected to Content Library
                  </Btn>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NAV BAR ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id:"dashboard",  label:"Dashboard",     emoji:"📊" },
  { id:"calendar",   label:"Calendar",      emoji:"📅" },
  { id:"content",    label:"Content",       emoji:"📝" },
  { id:"ideas",      label:"Idea Bank",     emoji:"💡" },
  { id:"campaigns",  label:"Campaigns",     emoji:"🎯" },
  { id:"templates",  label:"Templates",     emoji:"📋" },
  { id:"brand",      label:"Brand Profile", emoji:"🧬" },
  { id:"analytics",  label:"Analytics",     emoji:"📈" },
  { id:"hook-gen",   label:"Hook Generator",emoji:"🪝", isAction:true },
  { id:"cta-gen",    label:"CTA Generator", emoji:"🎯", isAction:true },
];

// ─── PAGE HEADER (reusable back-button header for every internal screen) ───────
function PageHeader({ title, subtitle, onBack, actions }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"22px", paddingBottom:"16px", borderBottom:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
        {onBack && (
          <button onClick={onBack} style={{ background:`${C.teal}14`, border:`1px solid ${C.teal}44`, borderRadius:"8px", color:C.teal, cursor:"pointer", fontSize:"13px", fontWeight:"700", fontFamily:"inherit", padding:"7px 14px", display:"flex", alignItems:"center", gap:"6px", transition:"all 0.15s" }}>
            ← Back
          </button>
        )}
        <div>
          <h1 style={{ fontSize:TYPE.pageTitle, fontWeight:"800", color:C.white, margin:0, lineHeight:"1.2" }}>{title}</h1>
          {subtitle && <div style={{ fontSize:TYPE.helper, color:C.muted, marginTop:"3px" }}>{subtitle}</div>}
        </div>
      </div>
      {actions && <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>{actions}</div>}
    </div>
  );
}

function NavBar({ screen, setScreen, apiKey, onSettings, onCreatePost, onHookGen, onCTAGen }) {
  return (
    <div style={{borderBottom:`1px solid ${C.border}`,background:"rgba(5,5,16,0.97)",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:200}}>
      {/* Top row: logo + actions */}
      <div style={{maxWidth:"1400px",margin:"0 auto",padding:"0 18px",height:"50px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:26,height:26,borderRadius:"7px",background:`linear-gradient(135deg,${C.pink},${C.teal})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",boxShadow:glow(C.pink)}}>⚡</div>
          <span style={{fontSize:"14px",fontWeight:"800",background:`linear-gradient(135deg,${C.pink},${C.teal})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",whiteSpace:"nowrap"}}>Content Creator Calendar Pro™</span>
        </div>
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <Btn small variant={apiKey?"teal":"ghost"} onClick={onSettings}>{apiKey?"✓ AI Connected":"⚙ Add API Key"}</Btn>
          <Btn small onClick={onCreatePost}>✨ Create Post</Btn>
        </div>
      </div>
      {/* Nav tabs row */}
      <div style={{maxWidth:"1400px",margin:"0 auto",padding:"0 18px",display:"flex",gap:"2px",overflowX:"auto"}}>
        {NAV_ITEMS.map(item=>{
          const active = !item.isAction && screen===item.id;
          const handleClick = item.isAction
            ? (item.id==="hook-gen" ? onHookGen : onCTAGen)
            : ()=>setScreen(item.id);
          return (
            <button key={item.id} onClick={handleClick} style={{background:item.isAction?`${C.teal}10`:"transparent",border:"none",borderBottom:`2px solid ${active?C.pink:item.isAction?C.teal+"44":"transparent"}`,padding:"9px 14px",cursor:"pointer",color:active?C.pink:item.isAction?C.teal:C.muted,fontSize:TYPE.nav,fontWeight:active||item.isAction?"700":"600",fontFamily:"inherit",whiteSpace:"nowrap",transition:"all 0.15s",display:"flex",alignItems:"center",gap:"5px"}}>
              <span>{item.emoji}</span><span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── PLACEHOLDER SCREENS (filled in later phases) ─────────────────────────────

function DashboardScreen({ posts, ideas, campaigns, setScreen, onCreatePost }) {
  const now = new Date();
  const y=now.getFullYear(), m=now.getMonth();
  const thisMonthKey = `${y}-${String(m+1).padStart(2,"0")}`;
  const thisMonth = posts.filter(p=>p.date&&p.date.startsWith(thisMonthKey));
  const scheduled = posts.filter(p=>p.status==="scheduled"||p.date);
  const drafts    = posts.filter(p=>p.status==="draft");
  const ready     = posts.filter(p=>p.status==="ready");
  const posted    = posts.filter(p=>p.status==="posted");
  // Upcoming: next 7 days
  const today = todayKey();
  const upcoming = posts.filter(p=>p.date&&p.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,6);
  // Pillar breakdown
  const pillarCounts = PILLARS.map(pl=>({ ...pl, count: posts.filter(p=>p.pillar===pl.id).length }));
  const maxPillar = Math.max(...pillarCounts.map(p=>p.count), 1);
  // Active campaigns
  const activeCampaigns = campaigns.filter(c=>c.status==="active");

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>
      {/* Welcome */}
      <div style={{background:C.surf,border:`1px solid ${C.pink}44`,borderRadius:"14px",padding:"22px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px",boxShadow:`0 0 28px ${C.pink}22, 0 0 8px ${C.teal}18`}}>
        <div>
          <h1 style={{fontSize:"20px",fontWeight:"900",color:C.white,marginBottom:"4px"}}>Welcome to <GradText>Content Creator Calendar Pro™</GradText></h1>
          <p style={{fontSize:"13px",color:C.muted}}>Your AI-powered social media command center. Plan smarter, post consistently, grow faster.</p>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <Btn small variant="teal" onClick={()=>setScreen("ideas")}>💡 Add Idea</Btn>
          <Btn small onClick={onCreatePost}>✨ Create Post</Btn>
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
        <StatCard label="Total Posts"   value={posts.length}        color={C.white}            sub="in library" />
        <StatCard label="This Month"    value={thisMonth.length}    color={C.teal}             sub="created" />
        <StatCard label="Scheduled"     value={scheduled.length}    color="#f59e0b"            sub="on calendar" />
        <StatCard label="Drafts"        value={drafts.length}       color={STATUSES[1].color}  sub="in progress" />
        <StatCard label="Ready"         value={ready.length}        color={STATUSES[2].color}  sub="to post" />
        <StatCard label="Posted"        value={posted.length}       color={STATUSES[4].color}  sub="published" />
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18px"}}>
        {/* Upcoming Posts */}
        <div style={{background:C.surf,border:`1px solid ${C.teal}44`,borderRadius:"13px",padding:"18px",boxShadow:`0 0 18px ${C.teal}22, 0 0 5px ${C.teal}14`}}>
          <SectionHdr title="📅 Upcoming Posts" action={<Btn small variant="ghost" onClick={()=>setScreen("calendar")}>View Calendar →</Btn>} />
          {upcoming.length===0 ? (
            <EmptyState icon="📅" title="Nothing scheduled yet" sub="Create posts and drag them onto calendar days" action={<Btn small onClick={onCreatePost}>✨ Create Post</Btn>} />
          ) : upcoming.map(p=>{
            const stat=STATUSES.find(s=>s.id===p.status)||STATUSES[1];
            return (
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{width:"40px",textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:"10px",fontWeight:"700",color:C.teal}}>{p.date?.slice(5,7)}/{p.date?.slice(8,10)}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"12px",fontWeight:"700",color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</div>
                  <div style={{display:"flex",gap:"4px",alignItems:"center",marginTop:"2px"}}>
                    <Chip color={stat.color} style={{fontSize:"9px"}}>{stat.label}</Chip>
                    {p.pillar&&<PillarChip pillarId={p.pillar} />}
                  </div>
                </div>
                <div style={{display:"flex",gap:"2px"}}>{p.platforms?.map(pid=><span key={pid} style={{fontSize:"11px"}}>{PLATFORMS.find(x=>x.id===pid)?.emoji}</span>)}</div>
              </div>
            );
          })}
        </div>

        {/* Pillar Breakdown */}
        <div style={{background:C.surf,border:`1px solid ${C.pink}44`,borderRadius:"13px",padding:"18px",boxShadow:`0 0 18px ${C.pink}22, 0 0 5px ${C.pink}14`}}>
          <SectionHdr title="🏛 Content Pillars" action={null} />
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {pillarCounts.map(pl=>(
              <div key={pl.id} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontSize:"12px",width:"16px"}}>{pl.emoji}</span>
                <span style={{fontSize:"11px",color:C.muted,width:"110px",flexShrink:0}}>{pl.label}</span>
                <div style={{flex:1,background:C.dim,borderRadius:"4px",height:"6px",overflow:"hidden"}}>
                  <div style={{width:`${(pl.count/maxPillar)*100}%`,height:"100%",background:pl.color,borderRadius:"4px",transition:"width 0.4s"}} />
                </div>
                <span style={{fontSize:"11px",fontWeight:"700",color:pl.color,width:"20px",textAlign:"right"}}>{pl.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18px"}}>
        {/* Idea Bank Preview */}
        <div style={{background:C.surf,border:`1px solid #f59e0b44`,borderRadius:"13px",padding:"18px",boxShadow:`0 0 18px #f59e0b22, 0 0 5px #f59e0b14`}}>
          <SectionHdr title="💡 Idea Bank" action={<Btn small variant="ghost" onClick={()=>setScreen("ideas")}>View All →</Btn>} />
          {ideas.length===0 ? (
            <EmptyState icon="💡" title="No ideas yet" sub="Capture ideas before they disappear" />
          ) : ideas.slice(0,3).map(idea=>(
            <div key={idea.id} style={{padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:"12px",fontWeight:"700",color:C.white,marginBottom:"3px"}}>{idea.title}</div>
              <div style={{fontSize:"11px",color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{idea.ideaText}</div>
            </div>
          ))}
        </div>

        {/* Active Campaigns */}
        <div style={{background:C.surf,border:`1px solid #c084fc44`,borderRadius:"13px",padding:"18px",boxShadow:`0 0 18px #c084fc22, 0 0 5px #c084fc14`}}>
          <SectionHdr title="🎯 Active Campaigns" action={<Btn small variant="ghost" onClick={()=>setScreen("campaigns")}>Manage →</Btn>} />
          {activeCampaigns.length===0 ? (
            <EmptyState icon="🎯" title="No active campaigns" sub="Create campaigns to organize your content" />
          ) : activeCampaigns.map(c=>{
            const postCount=posts.filter(p=>p.campaignId===c.id).length;
            const ct=CAMPAIGN_TYPES.find(x=>x.id===c.type);
            return (
              <div key={c.id} style={{padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:"12px",fontWeight:"700",color:C.white}}>{c.name}</div>
                  <Chip color={C.teal} style={{fontSize:"9px"}}>{postCount} posts</Chip>
                </div>
                <div style={{fontSize:"11px",color:C.muted,marginTop:"2px"}}>{ct?.label||c.type}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:"13px",padding:"18px"}}>
        <SectionHdr title="⚡ Quick Actions" action={null} />
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
          {[
            {label:"✨ Create Post",    action:onCreatePost,             variant:"primary"},
            {label:"💡 Add Idea",       action:()=>setScreen("ideas"),   variant:"teal"},
            {label:"📅 Calendar",       action:()=>setScreen("calendar"),variant:"ghost"},
            {label:"📋 Templates",      action:()=>setScreen("templates"),variant:"ghost"},
            {label:"🧠 Brand Profile",  action:()=>setScreen("brand"),   variant:"ghost"},
            {label:"🎯 Campaigns",      action:()=>setScreen("campaigns"),variant:"ghost"},
          ].map(a=><Btn key={a.label} small variant={a.variant} onClick={a.action}>{a.label}</Btn>)}
        </div>
      </div>
    </div>
  );
}

function ContentScreen({ posts, campaigns, upsert, remove, apiKey="", onRepurpose=null, onBack=null, onGoToCalendar=null }) {
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fPlatform, setFPlatform] = useState("");
  const [fPillar, setFPillar] = useState("");
  const [fCampaign, setFCampaign] = useState("");
  const [editingPost, setEditingPost] = useState(null);

  const filtered = useMemo(()=>{
    let r = [...posts].sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
    if(search) r=r.filter(p=>(p.title+p.content).toLowerCase().includes(search.toLowerCase()));
    if(fStatus)   r=r.filter(p=>p.status===fStatus);
    if(fPlatform) r=r.filter(p=>p.platforms?.includes(fPlatform));
    if(fPillar)   r=r.filter(p=>p.pillar===fPillar);
    if(fCampaign) r=r.filter(p=>p.campaignId===fCampaign);
    return r;
  },[posts,search,fStatus,fPlatform,fPillar,fCampaign]);

  const duplicate = p => upsert({...p,id:uid(),title:p.title+" (copy)",date:null,status:"draft",createdAt:new Date().toISOString()});

  return (
    <div>
      <PageHeader title="📝 Content Library" subtitle="Browse, filter, edit and repurpose all your saved posts." onBack={onBack} actions={<Chip color={C.muted}>{filtered.length} of {posts.length} posts</Chip>} />
      {/* Filters */}
      <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"16px"}}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search posts…" />
        <Sel value={fStatus} onChange={setFStatus} style={{width:"130px"}}>
          <option value="">All Statuses</option>
          {STATUSES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
        </Sel>
        <Sel value={fPlatform} onChange={setFPlatform} style={{width:"130px"}}>
          <option value="">All Platforms</option>
          {PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
        </Sel>
        <Sel value={fPillar} onChange={setFPillar} style={{width:"145px"}}>
          <option value="">All Pillars</option>
          {PILLARS.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
        </Sel>
        <Sel value={fCampaign} onChange={setFCampaign} style={{width:"145px"}}>
          <option value="">All Campaigns</option>
          {campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </Sel>
        {(search||fStatus||fPlatform||fPillar||fCampaign)&&<Btn small variant="ghost" onClick={()=>{setSearch("");setFStatus("");setFPlatform("");setFPillar("");setFCampaign("");}}>✕ Clear</Btn>}
      </div>
      {/* Grid */}
      {filtered.length===0 ? (
        <EmptyState icon="📝" title="No posts found" sub="Try adjusting your filters or create new content" />
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"12px"}}>
          {filtered.map(p=>{
            const stat=STATUSES.find(s=>s.id===p.status)||STATUSES[1];
            const camp=campaigns.find(c=>c.id===p.campaignId);
            return (
              <div key={p.id} style={{background:C.surf,border:`1px solid ${C.border}`,borderLeft:`3px solid ${stat.color}`,borderRadius:"11px",padding:"14px",display:"flex",flexDirection:"column",gap:"8px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"6px"}}>
                  <span style={{fontSize:"13px",fontWeight:"700",color:C.white,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title||"Untitled"}</span>
                  <div style={{display:"flex",gap:"4px",alignItems:"center"}}>
                    <Chip color={stat.color}>{stat.label}</Chip>
                    <button onClick={()=>remove(p.id)} title="Delete post" style={{background:"transparent",border:"none",cursor:"pointer",color:"#ff4444",fontSize:"14px",padding:"2px 4px",lineHeight:1,borderRadius:"4px",flexShrink:0}} onMouseEnter={e=>e.target.style.background="#ff444422"} onMouseLeave={e=>e.target.style.background="transparent"}>🗑</button>
                  </div>
                </div>
                <div style={{fontSize:"11px",color:C.muted,lineHeight:"1.5",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.content}</div>
                <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
                  {p.pillar&&<PillarChip pillarId={p.pillar} />}
                  {camp&&<Chip color="#f59e0b" style={{fontSize:"9px"}}>🎯 {camp.name}</Chip>}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:"6px",borderTop:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",gap:"3px"}}>{p.platforms?.map(pid=><span key={pid} style={{fontSize:"12px"}}>{PLATFORMS.find(x=>x.id===pid)?.emoji}</span>)}</div>
                  <div style={{display:"flex",gap:"5px",flexWrap:"wrap",justifyContent:"flex-end"}}>
                    {onGoToCalendar&&<Btn small variant="ghost" onClick={()=>{ upsert({...p, date:null, status:(p.status==="scheduled"||p.status==="posted")?"ready":p.status}); onGoToCalendar(); }} style={{color:C.teal,borderColor:C.teal+"44"}}>📅 Send to Tray</Btn>}
                    <Btn small variant="ghost" onClick={()=>duplicate(p)}>⧉ Duplicate</Btn>
                    <Btn small variant="teal" onClick={()=>setEditingPost(p)}>✏️ Edit</Btn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Edit Modal */}
      {editingPost&&(
        <Modal title="✏️ Edit Post" onClose={()=>setEditingPost(null)} wide>
          <PostEditor post={editingPost} campaigns={campaigns} apiKey={apiKey} onRepurpose={onRepurpose?p=>{setEditingPost(null);onRepurpose(p);}:null} onSave={p=>{upsert(p);setEditingPost(null);}} onDelete={id=>{remove(id);setEditingPost(null);}} onClose={()=>setEditingPost(null)} />
        </Modal>
      )}
    </div>
  );
}

function IdeaBankScreen({ ideas, setIdeas, campaigns, onConvertToPost, onQuickDraft=null, onBack=null }) {
  const [newIdea, setNewIdea] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [search, setSearch] = useState("");
  const [fPillar, setFPillar] = useState("");
  const [fFav, setFFav] = useState(false);


  const addIdea = () => {
    if(!newIdea.trim()) return;
    setIdeas(prev=>[{id:uid(),title:newTitle||newIdea.slice(0,50),ideaText:newIdea,tags:"",pillar:"",platforms:[],campaignId:null,favorite:false,status:"idea",notes:"",createdAt:new Date().toISOString()},...prev]);
    setNewIdea(""); setNewTitle("");
  };
  const toggleFav = id => setIdeas(prev=>prev.map(i=>i.id===id?{...i,favorite:!i.favorite}:i));
  const archiveIdea = id => setIdeas(prev=>prev.map(i=>i.id===id?{...i,status:"archived"}:i));
  const unarchiveIdea = id => setIdeas(prev=>prev.map(i=>i.id===id?{...i,status:"idea"}:i));
  const deleteIdea  = id => setIdeas(prev=>prev.filter(i=>i.id!==id));
  const updateIdea  = idea => setIdeas(prev=>prev.map(i=>i.id===idea.id?idea:i));

  const archivedCount = useMemo(()=>ideas.filter(i=>i.status==="archived").length,[ideas]);

  const visible = useMemo(()=>{
    let r = ideas.filter(i=>i.status!=="archived");
    if(fFav) r=r.filter(i=>i.favorite);
    if(fPillar) r=r.filter(i=>i.pillar===fPillar);
    if(search) r=r.filter(i=>(i.title+i.ideaText+(i.tags||"")).toLowerCase().includes(search.toLowerCase()));
    return r;
  },[ideas,search,fPillar,fFav]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      <PageHeader title="💡 Idea Bank" subtitle="Capture, organize, and convert your best content ideas." onBack={onBack}
        actions={<Chip color={C.muted}>{visible.length} ideas</Chip>}
      />

      {/* Button legend */}
      <div style={{background:`${C.teal}08`,border:`1px solid ${C.teal}22`,borderRadius:"10px",padding:"12px 16px",display:"flex",gap:"20px",flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <span style={{fontSize:TYPE.chip,fontWeight:"700",color:C.pink,background:`${C.pink}15`,border:`1px solid ${C.pink}33`,borderRadius:"5px",padding:"2px 8px"}}>✨ Build with AI</span>
          <span style={{fontSize:TYPE.helper,color:C.muted}}>Opens the AI Creator with your idea pre-filled so you can generate a full post</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <span style={{fontSize:TYPE.chip,fontWeight:"700",color:C.teal,background:`${C.teal}15`,border:`1px solid ${C.teal}33`,borderRadius:"5px",padding:"2px 8px"}}>📋 Quick Draft</span>
          <span style={{fontSize:TYPE.helper,color:C.muted}}>Instantly saves your idea as a draft post in the Content Library so you can write it yourself</span>
        </div>
      </div>

      {/* Quick capture */}
      <div style={{background:C.surf,border:`1px solid ${C.teal}33`,borderRadius:"13px",padding:"18px"}}>
        <div style={{fontSize:TYPE.label,fontWeight:"700",color:C.teal,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"10px"}}>💡 Capture an Idea</div>
        <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Idea title (optional)…" style={{...inputSt,marginBottom:"8px",fontSize:"13px"}} />
        <textarea value={newIdea} onChange={e=>setNewIdea(e.target.value)} placeholder="Describe your content idea, a rough thought, a topic you want to cover…" rows={3} style={{...inputSt,resize:"vertical",lineHeight:"1.6",marginBottom:"10px"}} />
        <Btn onClick={addIdea} disabled={!newIdea.trim()}>💡 Save Idea</Btn>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center"}}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search ideas…" />
        <Sel value={fPillar} onChange={setFPillar} style={{width:"145px"}}>
          <option value="">All Pillars</option>
          {PILLARS.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
        </Sel>
        <Btn small variant={fFav?"teal":"ghost"} onClick={()=>setFFav(f=>!f)}>⭐ Favorites {fFav?"✓":""}</Btn>
      </div>

      {/* Ideas grid */}
      {visible.length===0 ? (
        <EmptyState icon="💡" title="No ideas yet" sub="Use the capture field above to save your next great idea before it disappears" />
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"12px"}}>
          {visible.map(idea=>{
            const pl=PILLARS.find(p=>p.id===idea.pillar);
            return (
              <div key={idea.id} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:"11px",padding:"14px",display:"flex",flexDirection:"column",gap:"8px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"6px"}}>
                  <span style={{fontSize:"13px",fontWeight:"700",color:C.white,flex:1}}>{idea.title}</span>
                  <button onClick={()=>toggleFav(idea.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"16px",opacity:idea.favorite?1:0.3,padding:"0"}}>{idea.favorite?"⭐":"☆"}</button>
                </div>
                <div style={{fontSize:"11px",color:C.muted,lineHeight:"1.5",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{idea.ideaText}</div>
                {/* Pillar select */}
                <Sel value={PILLARS.find(p=>p.id===(idea.pillar||""))?(idea.pillar||""):((idea.pillar)?"other":"")} onChange={v=>{if(v!=="other")updateIdea({...idea,pillar:v});else updateIdea({...idea,pillar:"other"});}} style={{width:"100%",fontSize:"11px",padding:"5px 8px"}}>
                  <option value="">Assign pillar…</option>
                  {PILLARS.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.label}</option>)}
                  <option value="other">🏷 Other / Custom…</option>
                </Sel>
                {(idea.pillar==="other"||(idea.pillar&&!PILLARS.find(p=>p.id===idea.pillar)))&&(
                  <input value={idea.pillar==="other"?"":idea.pillar} onChange={e=>updateIdea({...idea,pillar:e.target.value||"other"})} placeholder="Type your custom pillar…" style={{...inputSt,marginTop:"5px",fontSize:"11px",padding:"5px 8px"}} />
                )}
                {idea.tags&&<div style={{fontSize:"10px",color:C.dim}}>{idea.tags.split(",").map(t=>t.trim()).filter(Boolean).map(t=><span key={t} style={{background:C.dim,borderRadius:"4px",padding:"1px 6px",marginRight:"3px"}}>{t}</span>)}</div>}
                <div style={{display:"flex",gap:"5px",paddingTop:"6px",borderTop:`1px solid ${C.border}`}}>
                    <>
                    {idea.status!=="draft" && <Btn small onClick={()=>onConvertToPost(idea)} style={{flex:1}}>✨ Build with AI</Btn>}
                    {onQuickDraft&&idea.status!=="draft"&&<Btn small variant="teal" onClick={()=>onQuickDraft(idea)}>📋 Quick Draft</Btn>}
                    {idea.status==="draft"&&<Btn small variant="teal" onClick={()=>onQuickDraft&&onQuickDraft(idea)} style={{flex:1}}>📋 View Draft</Btn>}
                    <Btn small variant="danger" onClick={()=>deleteIdea(idea.id)}>🗑</Btn>
                  </>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CampaignsScreen({ campaigns, setCampaigns, posts, upsert, onCreatePost, onBack=null }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"", type:"product-launch", description:"", startDate:"", endDate:"", status:"active" });
  const [viewingId, setViewingId] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);

  const openNew = () => { setForm({name:"",type:"product-launch",description:"",startDate:"",endDate:"",status:"active"}); setEditing(null); setShowForm(true); };
  const openEdit = c => { setForm({name:c.name,type:c.type,description:c.description||"",startDate:c.startDate||"",endDate:c.endDate||"",status:c.status}); setEditing(c.id); setShowForm(true); };
  const saveCampaign = () => {
    if(!form.name.trim()) return;
    if(editing) {
      setCampaigns(prev=>prev.map(c=>c.id===editing?{...c,...form}:c));
    } else {
      setCampaigns(prev=>[...prev,{id:uid(),...form,createdAt:new Date().toISOString()}]);
    }
    setShowForm(false);
  };
  const deleteCamp = id => { setCampaigns(prev=>prev.filter(c=>c.id!==id)); if(viewingId===id) setViewingId(null); };
  const f = (k,v) => setForm(prev=>({...prev,[k]:v}));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      <PageHeader title="🎯 Campaigns" subtitle="Organize your content into focused marketing campaigns." onBack={onBack} actions={<Btn small onClick={openNew}>+ New Campaign</Btn>} />

      {campaigns.length===0 ? (
        <EmptyState icon="🎯" title="No campaigns yet" sub="Create campaigns to organize related content into a cohesive plan" action={<Btn small onClick={openNew}>+ Create Campaign</Btn>} />
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"12px"}}>
          {campaigns.map(c=>{
            const ct=CAMPAIGN_TYPES.find(x=>x.id===c.type);
            const postCount=posts.filter(p=>p.campaignId===c.id).length;
            const isViewing=viewingId===c.id;
            const campPosts=posts.filter(p=>p.campaignId===c.id);
            return (
              <div key={c.id} style={{background:C.surf,border:`1px solid ${isViewing?C.teal:C.border}`,borderRadius:"12px",overflow:"hidden"}}>
                <div style={{padding:"14px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
                    <div style={{fontSize:"14px",fontWeight:"800",color:C.white}}>{c.name}</div>
                    <Chip color={c.status==="active"?C.teal:C.muted}>{c.status}</Chip>
                  </div>
                  <div style={{fontSize:"11px",color:C.muted,marginBottom:"8px"}}>{ct?.label||c.type}</div>
                  {c.description&&<div style={{fontSize:"11px",color:C.text,marginBottom:"8px",lineHeight:"1.5"}}>{c.description}</div>}
                  {(c.startDate||c.endDate)&&<div style={{fontSize:"10px",color:C.dim,marginBottom:"8px"}}>{c.startDate} {c.startDate&&c.endDate?"→":""} {c.endDate}</div>}
                  <div style={{display:"flex",gap:"6px",alignItems:"center",flexWrap:"wrap"}}>
                    <Chip color={C.teal}>{postCount} posts</Chip>
                    <div style={{display:"flex",gap:"4px",marginLeft:"auto"}}>
                      <Btn small variant="ghost" onClick={()=>setViewingId(isViewing?null:c.id)}>{isViewing?"▲ Hide":"▼ Posts"}</Btn>
                      <Btn small variant="teal" onClick={()=>openEdit(c)}>✏️</Btn>
                      <Btn small variant="danger" onClick={()=>deleteCamp(c.id)}>🗑</Btn>
                    </div>
                  </div>
                </div>
                {isViewing&&(
                  <div style={{borderTop:`1px solid ${C.border}`,padding:"10px 14px",background:C.surf2}}>
                    {campPosts.length===0 ? (
                      <div style={{fontSize:"11px",color:C.dim,textAlign:"center",padding:"8px 0"}}>No posts yet. <span style={{color:C.teal,cursor:"pointer"}} onClick={()=>onCreatePost({campaignId:c.id})}>create one</span></div>
                    ) : campPosts.map(p=>{
                      const stat=STATUSES.find(s=>s.id===p.status)||STATUSES[1];
                      const isExpanded=expandedPostId===p.id;
                      return (
                        <div key={p.id} style={{borderBottom:`1px solid ${C.border}`,paddingBottom:"2px",marginBottom:"2px"}}>
                          <div onClick={()=>setExpandedPostId(isExpanded?null:p.id)} style={{display:"flex",alignItems:"center",gap:"6px",padding:"6px 4px",cursor:"pointer",borderRadius:"6px",transition:"background 0.12s",background:isExpanded?`${C.teal}10`:"transparent"}}>
                            <StatusDot status={p.status}/>
                            <span style={{fontSize:"11px",color:C.white,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</span>
                            <Chip color={stat.color} style={{fontSize:"9px"}}>{stat.label}</Chip>
                            <span style={{fontSize:"10px",color:C.dim}}>{isExpanded?"▲":"▼"}</span>
                          </div>
                          {isExpanded&&(
                            <div style={{padding:"8px 8px 10px",background:`${C.teal}08`,borderRadius:"8px",marginBottom:"4px",display:"flex",flexDirection:"column",gap:"8px"}}>
                              <div style={{fontSize:"11px",color:C.muted,fontWeight:"700"}}>Move to status:</div>
                              <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                                {STATUSES.filter(s=>s.id!=="archived").map(s=>(
                                  <button key={s.id} onClick={()=>{upsert({...p,status:s.id,updatedAt:new Date().toISOString()});setExpandedPostId(null);}}
                                    style={{background:p.status===s.id?`${s.color}22`:"transparent",border:`1px solid ${p.status===s.id?s.color:C.border}`,borderRadius:"6px",padding:"4px 10px",color:p.status===s.id?s.color:C.muted,fontSize:"10px",fontWeight:"700",fontFamily:"inherit",cursor:"pointer",transition:"all 0.12s"}}>
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                              <div style={{fontSize:"10px",color:C.dim,lineHeight:"1.5",marginTop:"2px",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.content?.slice(0,120)}{p.content?.length>120?"…":""}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm&&(
        <Modal title={editing?"✏️ Edit Campaign":"🎯 New Campaign"} onClose={()=>setShowForm(false)}>
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <div><label style={labelSt}>Campaign Name *</label><input value={form.name} onChange={e=>f("name",e.target.value)} placeholder="e.g. Spring Launch 2026" style={inputSt} /></div>
            <div><label style={labelSt}>Campaign Type</label>
              <Sel value={form.type} onChange={v=>f("type",v)} style={{width:"100%"}}>{CAMPAIGN_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</Sel>
            </div>
            <div><label style={labelSt}>Description</label><textarea value={form.description} onChange={e=>f("description",e.target.value)} placeholder="What is this campaign about?" rows={2} style={{...inputSt,resize:"vertical"}} /></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
              <div><label style={labelSt}>Start Date</label><input type="date" value={form.startDate} onChange={e=>f("startDate",e.target.value)} style={inputSt} /></div>
              <div><label style={labelSt}>End Date</label><input type="date" value={form.endDate} onChange={e=>f("endDate",e.target.value)} style={inputSt} /></div>
            </div>
            <div><label style={labelSt}>Status</label>
              <Sel value={form.status} onChange={v=>f("status",v)} style={{width:"100%"}}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option></Sel>
            </div>
            <div style={{display:"flex",gap:"8px",justifyContent:"flex-end",paddingTop:"8px"}}>
              <Btn variant="ghost" onClick={()=>setShowForm(false)}>Cancel</Btn>
              <Btn onClick={saveCampaign} disabled={!form.name.trim()}>Save Campaign</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TemplatesScreen({ onUseTemplate, onBack=null, setScreen=null }) {
  const byCategory = [
    { label:"📚 Education & Authority",  items: SYSTEM_TEMPLATES.filter(t=>["education","authority"].includes(t.pillar)) },
    { label:"❤️ Story & Connection",     items: SYSTEM_TEMPLATES.filter(t=>["personal-story","behind-scenes"].includes(t.pillar)) },
    { label:"💰 Sales & Promotion",      items: SYSTEM_TEMPLATES.filter(t=>["promotion"].includes(t.pillar)) },
    { label:"💬 Engagement & Social",   items: SYSTEM_TEMPLATES.filter(t=>["engagement","social-proof"].includes(t.pillar)) },
    { label:"📱 Platform-Specific",     items: SYSTEM_TEMPLATES.filter(t=>["tiktok","threads"].includes(t.platform)&&!["promotion","engagement"].includes(t.pillar)) },
  ];

  const SPECIAL_TOOLS = [
    {
      id:"perfect-prompting", emoji:"🧠", name:"Content Creator Builder™",
      tagline:"4-step guided content builder",
      desc:"Build a precise AI prompt in 4 steps: Expert Perspective, Context, Specific Request, and Encourage Dialogue. Get sharper, more on-brand content every time.",
      color:C.pink, screen:"perfect-prompting",
    },
    {
      id:"teddy-thread", emoji:"🧵", name:"Thread Hooks",
      tagline:"Structured 9-block social thread generator",
      desc:"Turn any topic into a perfectly formatted social thread. Generates 5 hook options, you pick one, set your CTA goal, and get a ready-to-post 9-block thread.",
      color:C.teal, screen:"teddy-thread",
    },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>
      <PageHeader title="📋 Template Library" subtitle="Pre-built content frameworks and AI tools to jump-start any post type." onBack={onBack} actions={<Chip color={C.muted}>{SYSTEM_TEMPLATES.length} templates</Chip>} />

      {/* Featured AI Tools */}
      <div>
        <div style={{fontSize:TYPE.label,fontWeight:"700",color:C.muted,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"10px"}}>⭐ Featured AI Tools</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:"12px",marginBottom:"8px"}}>
          {SPECIAL_TOOLS.map(tool=>(
            <div key={tool.id} style={{background:C.surf,border:`2px solid ${tool.color}33`,borderRadius:"13px",padding:"18px",display:"flex",flexDirection:"column",gap:"10px",boxShadow:glow(tool.color,0.6)}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{width:40,height:40,borderRadius:"10px",background:`linear-gradient(135deg,${tool.color}33,${tool.color}11)`,border:`1px solid ${tool.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>{tool.emoji}</div>
                <div>
                  <div style={{fontSize:TYPE.body,fontWeight:"800",color:C.white}}>{tool.name}</div>
                  <div style={{fontSize:TYPE.chip,color:tool.color,fontWeight:"600"}}>{tool.tagline}</div>
                </div>
              </div>
              <div style={{fontSize:TYPE.helper,color:C.muted,lineHeight:"1.6"}}>{tool.desc}</div>
              <Btn variant="teal" small onClick={()=>setScreen&&setScreen(tool.screen)} style={{background:`${tool.color}18`,borderColor:tool.color,color:tool.color,marginTop:"auto"}}>
                Open {tool.name} →
              </Btn>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:`${C.teal}08`,border:`1px solid ${C.teal}22`,borderRadius:"10px",padding:"12px 16px"}}>
        <p style={{fontSize:TYPE.helper,color:C.teal,margin:0}}>✨ Click <strong>Use Template</strong> on any card below to open the AI Creator pre-loaded with that template's structure and goal.</p>
      </div>
      {byCategory.map(cat=>(
        <div key={cat.label}>
          <div style={{fontSize:"12px",fontWeight:"700",color:C.muted,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"10px"}}>{cat.label}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"10px"}}>
            {cat.items.map(t=>{
              const plat=PLATFORMS.find(p=>p.id===t.platform);
              const pl=PILLARS.find(p=>p.id===t.pillar);
              return (
                <div key={t.id} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:"11px",padding:"14px",display:"flex",flexDirection:"column",gap:"8px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{fontSize:"22px"}}>{t.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:"13px",fontWeight:"700",color:C.white}}>{t.name}</div>
                      <div style={{display:"flex",gap:"4px",marginTop:"2px"}}>
                        {plat&&<Chip color={C.muted} style={{fontSize:"9px"}}>{plat.emoji} {plat.name}</Chip>}
                        {pl&&<Chip color={pl.color} style={{fontSize:"9px"}}>{pl.emoji} {pl.label}</Chip>}
                      </div>
                    </div>
                  </div>
                  <div style={{fontSize:"11px",color:C.muted,lineHeight:"1.5"}}>{t.structure}</div>
                  <div style={{fontSize:"10px",color:C.dim,fontStyle:"italic",lineHeight:"1.4"}}>Goal: {t.defaultGoal}</div>
                  <Btn small variant="teal" onClick={()=>onUseTemplate(t)} style={{marginTop:"auto"}}>✨ Use Template</Btn>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function BrandProfileScreen({ brandProfile, setBrandProfile, onBack=null }) {
  const [form, setForm] = useState(brandProfile);
  const [saved, setSaved] = useState(false);
  const f = (k,v) => setForm(prev=>({...prev,[k]:v}));
  const save = () => { setBrandProfile(form); setSaved(true); setTimeout(()=>setSaved(false),2500); };
  const togglePlatform = id => f("preferredPlatforms", form.preferredPlatforms.includes(id)?form.preferredPlatforms.filter(x=>x!==id):[...form.preferredPlatforms,id]);

  const filled = Object.entries(form).filter(([k,v])=>k!=="preferredPlatforms"&&String(v).trim()).length;
  const total  = Object.keys(form).length - 1;
  const pct    = Math.round((filled/total)*100);

  return (
    <div style={{maxWidth:"720px"}}>
      <PageHeader title="🧬 Brand Voice Profile" subtitle="Define your voice, tone, and preferences. All fields are injected into every AI generation.." onBack={onBack} actions={
        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
          <Chip color={pct===100?C.teal:pct>50?"#f59e0b":C.muted}>{pct}% complete</Chip>
          <Btn small onClick={save}>{saved?"✓ Saved!":"💾 Save Profile"}</Btn>
        </div>
      } />
      <div style={{background:`${C.teal}08`,border:`1px solid ${C.teal}22`,borderRadius:"10px",padding:"12px 16px",marginBottom:"20px"}}>
        <p style={{fontSize:"12px",color:C.teal,margin:0}}>🧠 Your brand profile auto-fills the AI Creator so every post sounds like <em>you</em>. The more you fill in, the better your AI content will be.</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
          <div><label style={labelSt}>Brand / Business Name</label><input value={form.brandName} onChange={e=>f("brandName",e.target.value)} placeholder="e.g. Amy's Coaching Studio" style={inputSt} /></div>
          <div><label style={labelSt}>Business Type / Profession</label><input value={form.businessType} onChange={e=>f("businessType",e.target.value)} placeholder="e.g. Life Coach, Realtor, Creator" style={inputSt} /></div>
        </div>
        <div><label style={labelSt}>Audience Description</label><textarea value={form.audienceDescription} onChange={e=>f("audienceDescription",e.target.value)} placeholder="Who are you talking to? e.g. Female entrepreneurs in their 30s-40s who want to scale without burnout" rows={2} style={{...inputSt,resize:"vertical"}} /></div>
        <div><label style={labelSt}>Tone Words (comma-separated)</label><input value={form.toneWords} onChange={e=>f("toneWords",e.target.value)} placeholder="e.g. warm, direct, inspiring, no-BS, professional yet approachable" style={inputSt} /></div>
        <div><label style={labelSt}>Brand Voice Summary</label><textarea value={form.brandVoiceSummary} onChange={e=>f("brandVoiceSummary",e.target.value)} placeholder="Describe your overall brand voice in 2-3 sentences. How should content feel when people read it?" rows={3} style={{...inputSt,resize:"vertical"}} /></div>
        <div><label style={labelSt}>Signature Phrases / Expressions You Use</label><input value={form.signaturePhrases} onChange={e=>f("signaturePhrases",e.target.value)} placeholder="e.g. 'strategy over hustle', 'done is better than perfect', your taglines" style={inputSt} /></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
          <div><label style={labelSt}>CTA Preferences</label><input value={form.ctaPreferences} onChange={e=>f("ctaPreferences",e.target.value)} placeholder="e.g. 'DM me READY', 'Book a call', 'Follow for more'" style={inputSt} /></div>
          <div><label style={labelSt}>Common Offers / Products</label><input value={form.commonOffers} onChange={e=>f("commonOffers",e.target.value)} placeholder="e.g. 1:1 coaching, online course, free guide" style={inputSt} /></div>
        </div>
        <div><label style={labelSt}>Content Themes / Topics You Cover</label><input value={form.contentThemes} onChange={e=>f("contentThemes",e.target.value)} placeholder="e.g. mindset, pricing, marketing, time management, scaling" style={inputSt} /></div>
        <div><label style={labelSt}>Words / Phrases to Avoid</label><input value={form.bannedWords} onChange={e=>f("bannedWords",e.target.value)} placeholder="e.g. 'hustle', 'grinding', 'boss babe', corporate jargon" style={inputSt} /></div>
        <div><label style={labelSt}>Writing Style Notes</label><textarea value={form.writingStyleNotes} onChange={e=>f("writingStyleNotes",e.target.value)} placeholder="Any other notes for the AI: e.g. Never use exclamation points. Always write in first person. Keep posts under 200 words." rows={2} style={{...inputSt,resize:"vertical"}} /></div>
        <div>
          <label style={labelSt}>Preferred Platforms</label>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {PLATFORMS.map(p=>{const on=form.preferredPlatforms.includes(p.id);return <button key={p.id} onClick={()=>togglePlatform(p.id)} style={{background:on?C.pink+"18":"transparent",border:`1px solid ${on?C.pink:C.border}`,borderRadius:"7px",padding:"6px 12px",cursor:"pointer",color:on?C.pink:C.muted,fontSize:"12px",fontWeight:on?"700":"400",fontFamily:"inherit"}}>{p.emoji} {p.name}</button>;})}
          </div>
        </div>
        {/* Phase 3B: Voice controls */}
        <div style={{background:C.surf2,border:`1px solid ${C.border}`,borderRadius:"11px",padding:"16px"}}>
          <div style={{fontSize:TYPE.label,fontWeight:"700",color:C.muted,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"12px"}}>🎛 Voice Controls: injected into every AI generation</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
            <div><label style={labelSt}>Sentence Style</label><input value={form.sentenceStyle||""} onChange={e=>f("sentenceStyle",e.target.value)} placeholder="e.g. short punchy sentences, paragraph storytelling" style={{...inputSt,fontSize:TYPE.body}} /></div>
            <div><label style={labelSt}>Humor Level</label>
              <Sel value={form.humorLevel||"medium"} onChange={v=>f("humorLevel",v)}>
                <option value="low">Low: mostly serious</option>
                <option value="medium">Medium: occasional wit</option>
                <option value="high">High: funny and playful</option>
              </Sel>
            </div>
            <div><label style={labelSt}>Boldness Level</label>
              <Sel value={form.boldnessLevel||"medium"} onChange={v=>f("boldnessLevel",v)}>
                <option value="low">Low: careful, nuanced</option>
                <option value="medium">Medium: confident</option>
                <option value="high">High: bold, provocative</option>
              </Sel>
            </div>
            <div><label style={labelSt}>Emoji Preference</label>
              <Sel value={form.emojiPreference||"light"} onChange={v=>f("emojiPreference",v)}>
                <option value="none">None: no emojis</option>
                <option value="light">Light: 1-2 per post</option>
                <option value="moderate">Moderate: used for emphasis</option>
                <option value="high">High: emoji-rich</option>
              </Sel>
            </div>
            <div><label style={labelSt}>Reading Level</label>
              <Sel value={form.readingLevel||"standard"} onChange={v=>f("readingLevel",v)}>
                <option value="simple">Simple: 6th grade, short words</option>
                <option value="standard">Standard: clear, direct</option>
                <option value="advanced">Advanced: nuanced vocabulary</option>
              </Sel>
            </div>
          </div>
        </div>
        <div style={{paddingTop:"8px"}}>
          <Btn onClick={save}>{saved?"✓ Profile Saved!":"💾 Save Brand Profile"}</Btn>
        </div>
      </div>
    </div>
  );
}

function AnalyticsScreen({ posts, upsert, onBack=null }) {
  const [editingStats, setEditingStats] = useState(null);
  const [statForm, setStatForm] = useState({});

  const postedPosts = posts.filter(p=>p.status==="posted"||p.analytics);
  const withStats   = postedPosts.filter(p=>p.analytics&&(p.analytics.likes||p.analytics.reach));

  // Totals
  const totalReach  = withStats.reduce((s,p)=>s+(p.analytics?.reach||0),0);
  const totalEng    = withStats.reduce((s,p)=>s+(p.analytics?.likes||0)+(p.analytics?.comments||0)+(p.analytics?.shares||0),0);
  const avgEng      = withStats.length ? Math.round(totalEng/withStats.length) : 0;

  // Best platform
  const byPlatform = PLATFORMS.map(pl=>{
    const ps=withStats.filter(p=>p.platforms?.includes(pl.id));
    const eng=ps.reduce((s,p)=>s+(p.analytics?.likes||0)+(p.analytics?.comments||0)+(p.analytics?.shares||0),0);
    return {...pl,eng,count:ps.length};
  });
  const bestPlatform=byPlatform.sort((a,b)=>b.eng-a.eng)[0];
  const maxPlatEng=Math.max(...byPlatform.map(p=>p.eng),1);

  // Best pillar
  const byPillar=PILLARS.map(pl=>{
    const ps=withStats.filter(p=>p.pillar===pl.id);
    const eng=ps.reduce((s,p)=>s+(p.analytics?.likes||0)+(p.analytics?.comments||0)+(p.analytics?.shares||0),0);
    return {...pl,eng,count:ps.length};
  });
  const bestPillar=byPillar.sort((a,b)=>b.eng-a.eng)[0];

  const openStats = p => { setEditingStats(p.id); setStatForm(p.analytics||{likes:0,comments:0,shares:0,saves:0,reach:0}); };
  const saveStats = postId => {
    upsert({...posts.find(p=>p.id===postId), analytics:Object.fromEntries(Object.entries(statForm).map(([k,v])=>[k,Number(v)||0]))});
    setEditingStats(null);
  };
  const sf = (k,v) => setStatForm(prev=>({...prev,[k]:v}));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"24px"}}>
      <PageHeader title="📈 Analytics Snapshot" subtitle="Track performance, spot top platforms, and optimize your content mix." onBack={onBack} actions={<Chip color={C.muted}>{withStats.length} posts tracked</Chip>} />

      {/* Summary stats */}
      <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
        <StatCard label="Total Reach"       value={totalReach.toLocaleString()} color={C.teal}   sub="across all posts" />
        <StatCard label="Total Engagement"  value={totalEng.toLocaleString()}   color={C.pink}   sub="likes + comments + shares" />
        <StatCard label="Avg Engagement"    value={avgEng}                      color="#f59e0b"  sub="per post" />
        <StatCard label="Best Platform"     value={bestPlatform?.emoji||"—"}    color="#4da6ff"  sub={bestPlatform?.name||"No data yet"} />
        <StatCard label="Best Pillar"       value={bestPillar?.emoji||"—"}      color="#c084fc"  sub={bestPillar?.label||"No data yet"} />
      </div>

      {/* Platform breakdown */}
      <div style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:"13px",padding:"18px"}}>
        <div style={{fontSize:"12px",fontWeight:"700",color:C.muted,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:"14px"}}>Engagement by Platform</div>
        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
          {byPlatform.map(pl=>(
            <div key={pl.id} style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <span style={{fontSize:"14px",width:"20px"}}>{pl.emoji}</span>
              <span style={{fontSize:"11px",color:C.muted,width:"90px",flexShrink:0}}>{pl.name}</span>
              <div style={{flex:1,background:C.dim,borderRadius:"4px",height:"7px",overflow:"hidden"}}>
                <div style={{width:`${(pl.eng/maxPlatEng)*100}%`,height:"100%",background:`linear-gradient(to right,${C.pink},${C.teal})`,borderRadius:"4px"}} />
              </div>
              <span style={{fontSize:"11px",fontWeight:"700",color:C.white,width:"40px",textAlign:"right"}}>{pl.eng}</span>
              <span style={{fontSize:"10px",color:C.dim,width:"50px"}}>{pl.count} posts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts with manual stats entry */}
      <div style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:"13px",padding:"18px"}}>
        <SectionHdr title="📊 Track Post Performance" action={null} />
        {postedPosts.length===0 ? (
          <EmptyState icon="📊" title="No posted content yet" sub="Mark posts as 'Posted' to track their performance here" />
        ) : postedPosts.map(p=>{
          const isEditing=editingStats===p.id;
          const a=p.analytics;
          return (
            <div key={p.id} style={{borderBottom:`1px solid ${C.border}`,padding:"12px 0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:isEditing?"10px":"0"}}>
                <div>
                  <div style={{fontSize:"13px",fontWeight:"700",color:C.white}}>{p.title}</div>
                  <div style={{display:"flex",gap:"4px",marginTop:"3px"}}>
                    {p.platforms?.map(pid=><span key={pid} style={{fontSize:"11px"}}>{PLATFORMS.find(x=>x.id===pid)?.emoji}</span>)}
                    {a&&<span style={{fontSize:"10px",color:C.muted,marginLeft:"4px"}}>❤️ {a.likes} 💬 {a.comments} 🔁 {a.shares} 🔖 {a.saves} 👁 {a.reach}</span>}
                  </div>
                </div>
                <Btn small variant={isEditing?"ghost":"teal"} onClick={()=>isEditing?setEditingStats(null):openStats(p)}>{isEditing?"Cancel":"📊 Enter Stats"}</Btn>
              </div>
              {isEditing&&(
                <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"flex-end"}}>
                  {["likes","comments","shares","saves","reach"].map(k=>(
                    <div key={k} style={{display:"flex",flexDirection:"column",gap:"3px"}}>
                      <label style={{...labelSt,marginBottom:"2px",fontSize:"9px"}}>{k}</label>
                      <input type="number" value={statForm[k]||""} onChange={e=>sf(k,e.target.value)} placeholder="0" style={{...inputSt,width:"80px",padding:"6px 8px",fontSize:"13px"}} />
                    </div>
                  ))}
                  <Btn small onClick={()=>saveStats(p.id)}>Save Stats</Btn>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HOOK GENERATOR PANEL ─────────────────────────────────────────────────────

const HOOK_OUTPUT_GROUPS = ["Curiosity","Contrarian","Pain Point","Authority","Story","Outcome","Question"];

async function callOpenAIHookGen(apiKey, input) {
  const { topic, audience, painPoint, tone, platform } = input;
  const prompt = `Generate 7 powerful social media hooks, one per group below, for:\nTopic: ${topic}\nAudience: ${audience||"general audience"}\nPain point: ${painPoint||"unspecified"}\nTone: ${tone||"conversational"}\nPlatform: ${platform||"Instagram"}\n\nOutput format (exactly):\nCuriosity: [hook]\nContrarian: [hook]\nPain Point: [hook]\nAuthority: [hook]\nStory: [hook]\nOutcome: [hook]\nQuestion: [hook]\n\nEach hook under 150 chars. No preamble.`;
  const res = await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"user",content:prompt}],max_tokens:600})});
  const data = await res.json().catch(()=>({}));
  return data.choices?.[0]?.message?.content||"";
}

function parseHookGroups(raw) {
  const lines = raw.trim().split("\n").filter(l=>l.includes(":"));
  return lines.map(line=>{
    const idx=line.indexOf(":");
    return { group:line.slice(0,idx).trim(), text:line.slice(idx+1).trim() };
  });
}

function HookGeneratorModal({ apiKey, onClose, onUseAsTopic }) {
  const [topic,     setTopic]     = useState("");
  const [audience,  setAudience]  = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [tone,      setTone]      = useState("conversational");
  const [platform,  setPlatform]  = useState("instagram");
  const [hooks,     setHooks]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const generate = async () => {
    if(!topic.trim()) return;
    setLoading(true); setError(""); setHooks([]);
    try {
      const raw = apiKey
        ? await callOpenAIHookGen(apiKey,{topic,audience,painPoint,tone,platform})
        : await new Promise(r=>setTimeout(()=>r(HOOK_OUTPUT_GROUPS.map(g=>`${g}: ${g==="Curiosity"?`What nobody tells you about ${topic.slice(0,25)}…`:g==="Contrarian"?`${topic.slice(0,30)} doesn't work. Here's what does.`:g==="Pain Point"?`Tired of struggling with ${topic.slice(0,25)}? This changes everything.`:g==="Authority"?`After 10 years in ${topic.slice(0,20)}, here's what I know for sure.`:g==="Story"?`3 years ago I failed at ${topic.slice(0,20)}. Last month I hit a record.`:g==="Outcome"?`How to ${topic.slice(0,35)} without burning out or giving up.`:`Is your ${topic.slice(0,25)} strategy actually working?`}`).join("\n")),900));
      setHooks(parseHookGroups(raw));
    } catch(e){ setError(e.message); }
    finally{ setLoading(false); }
  };

  return (
    <Modal title="🪝 Hook Generator" onClose={onClose} wide>
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
          <div><label style={labelSt}>Topic *</label><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. building a personal brand" style={{...inputSt,fontSize:TYPE.body}} /></div>
          <div><label style={labelSt}>Target Audience</label><input value={audience} onChange={e=>setAudience(e.target.value)} placeholder="e.g. small business owners" style={{...inputSt,fontSize:TYPE.body}} /></div>
          <div><label style={labelSt}>Pain Point</label><input value={painPoint} onChange={e=>setPainPoint(e.target.value)} placeholder="e.g. inconsistent posting" style={{...inputSt,fontSize:TYPE.body}} /></div>
          <div><label style={labelSt}>Tone</label>
            <Sel value={tone} onChange={setTone}>
              {["conversational","professional","bold","playful","inspirational","educational"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </Sel>
          </div>
        </div>
        <Btn onClick={generate} disabled={!topic.trim()||loading}>{loading?"⚡ Generating…":"🪝 Generate Hooks"}</Btn>
        {error&&<div style={{background:"#ff334418",borderRadius:"8px",padding:"10px",fontSize:TYPE.helper,color:"#ff6666"}}>⚠️ {error}</div>}
        {hooks.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {hooks.map((h,i)=>(
              <div key={i} style={{background:C.surf2,border:`1px solid ${C.border}`,borderRadius:"10px",padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"10px"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:TYPE.chip,fontWeight:"700",color:C.teal,marginBottom:"4px"}}>{h.group}</div>
                  <div style={{fontSize:TYPE.body,color:C.text,lineHeight:"1.6"}}>{h.text}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"5px",flexShrink:0}}>
                  <CopyBtn text={h.text} small />
                  {onUseAsTopic&&<Btn small variant="teal" onClick={()=>{onUseAsTopic(h.text);onClose();}}>Use</Btn>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── CTA GENERATOR MODAL ────────────────────────────────────────────────────────

async function callOpenAICTA(apiKey, input) {
  const { goal, style, topic, audience, offer, platform } = input;
  const prompt = `Generate 6 CTA options for social media content.\n\nGoal: ${goal}\nStyle: ${style}\nTopic: ${topic}\nAudience: ${audience||"general"}\nOffer: ${offer||"none"}\nPlatform: ${platform||"Instagram"}\n\nOutput 6 distinct CTAs, one per line, numbered 1-6. Each under 100 chars. Action-oriented. No preamble.`;
  const res = await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"user",content:prompt}],max_tokens:400})});
  const data = await res.json().catch(()=>({}));
  return data.choices?.[0]?.message?.content||"";
}

function CTAGeneratorModal({ apiKey, onClose, onInsert }) {
  const [goal,     setGoal]     = useState("comment");
  const [style,    setStyle]    = useState("soft");
  const [topic,    setTopic]    = useState("");
  const [audience, setAudience] = useState("");
  const [offer,    setOffer]    = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [ctas,     setCtas]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const CTA_GOALS  = ["comment","follow","save","share","click","DM","buy","apply","join","book"];
  const CTA_STYLES = ["soft","direct","curiosity","urgency","authority","community"];

  const generate = async () => {
    setLoading(true); setError(""); setCtas([]);
    try {
      const raw = apiKey
        ? await callOpenAICTA(apiKey,{goal,style,topic,audience,offer,platform})
        : await new Promise(r=>setTimeout(()=>r(`1. Drop a 💬 below if this resonated with you.\n2. Save this for when you need a reminder.\n3. Tag someone who needs to hear this today.\n4. Follow for more content like this every week.\n5. Comment "${topic.slice(0,15)||"YES"}" and I'll send you the full breakdown.\n6. Share this with your audience. They will thank you.`),900));
      setCtas(raw.trim().split("\n").filter(l=>l.trim()).map(l=>l.replace(/^\d+\.\s*/,"").trim()).filter(Boolean));
    } catch(e){ setError(e.message); }
    finally{ setLoading(false); }
  };

  return (
    <Modal title="🎯 CTA Generator" onClose={onClose} wide>
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
          <div><label style={labelSt}>CTA Goal</label>
            <Sel value={goal} onChange={setGoal}>
              {CTA_GOALS.map(g=><option key={g} value={g}>{g.charAt(0).toUpperCase()+g.slice(1)}</option>)}
            </Sel>
          </div>
          <div><label style={labelSt}>CTA Style</label>
            <Sel value={style} onChange={setStyle}>
              {CTA_STYLES.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </Sel>
          </div>
          <div><label style={labelSt}>Topic / Content Context</label><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Instagram growth tips" style={{...inputSt,fontSize:TYPE.body}} /></div>
          <div><label style={labelSt}>Audience</label><input value={audience} onChange={e=>setAudience(e.target.value)} placeholder="e.g. coaches, freelancers" style={{...inputSt,fontSize:TYPE.body}} /></div>
          <div><label style={labelSt}>Offer (optional)</label><input value={offer} onChange={e=>setOffer(e.target.value)} placeholder="e.g. free guide, $197 course" style={{...inputSt,fontSize:TYPE.body}} /></div>
          <div><label style={labelSt}>Platform</label>
            <Sel value={platform} onChange={setPlatform}>
              {PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
            </Sel>
          </div>
        </div>
        <Btn onClick={generate} disabled={loading}>{loading?"⚡ Generating…":"🎯 Generate CTA Options"}</Btn>
        {error&&<div style={{background:"#ff334418",borderRadius:"8px",padding:"10px",fontSize:TYPE.helper,color:"#ff6666"}}>⚠️ {error}</div>}
        {ctas.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {ctas.map((cta,i)=>(
              <div key={i} style={{background:C.surf2,border:`1px solid ${C.border}`,borderRadius:"10px",padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"10px"}}>
                <div style={{fontSize:TYPE.body,color:C.text,flex:1,lineHeight:"1.5"}}>{cta}</div>
                <div style={{display:"flex",gap:"5px",flexShrink:0}}>
                  <CopyBtn text={cta} small />
                  {onInsert&&<Btn small variant="teal" onClick={()=>{onInsert(cta);onClose();}}>Insert</Btn>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── TEDDY THREAD SCREEN ───────────────────────────────────────────────────────

const HOOK_STRATEGIES = [
  { id:"contrarian",    label:"Contrarian Hook",    desc:"Challenge a belief your audience holds" },
  { id:"curiosity-gap", label:"Curiosity Gap Hook",  desc:"Leave an irresistible information gap" },
  { id:"bold-promise",  label:"Bold Promise Hook",   desc:"Make a specific, compelling promise" },
  { id:"story",         label:"Story Hook",          desc:"Open with a relatable scene or moment" },
  { id:"question",      label:"Question Hook",        desc:"Pose a question that stops the scroll" },
];

const CTA_OPTIONS = [
  { id:"follow",    label:"Follow for more" },
  { id:"comment",   label:"Comment below" },
  { id:"save",      label:"Save this for later" },
  { id:"link",      label:"Click the link in bio" },
  { id:"share",     label:"Share with someone who needs this" },
  { id:"dm",        label:"DM me the word" },
  { id:"custom",    label:"Custom CTA…" },
];

async function callOpenAIHooks(apiKey, topic) {
  const prompt = `Generate exactly 5 distinct social media thread hook options for this topic: "${topic}"\n\nFor each hook, output it in this exact format:\n[STRATEGY]: [hook text under 130 chars]\n\nStrategies (use each once, in order):\n1. CONTRARIAN\n2. CURIOSITY GAP\n3. BOLD PROMISE\n4. STORY\n5. QUESTION\n\nOnly output the 5 lines. No preamble.`;
  const res = await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"user",content:prompt}],max_tokens:500})});
  const data = await res.json().catch(()=>({}));
  return data.choices?.[0]?.message?.content || "";
}

async function callOpenAIThread(apiKey, topic, hook, ctaGoal) {
  const prompt = `You are writing a social media thread using the Teddy Thread format.\n\nTopic: ${topic}\nHook (first tweet): ${hook}\nCTA goal: ${ctaGoal}\n\nGenerate the thread in EXACTLY this format:\n\nHOOK:\n${hook}\n👇\n\n1. [value point]\n\n2. [value point]\n\n3. [value point]\n\n4. [value point]\n\n5. [value point]\n\n6. [value point]\n\n7. [value point]\n\nCTA:\n[One clear CTA tweet based on goal: ${ctaGoal}]\n\nRules:\n- Exactly 7 numbered blocks using format 1. 2. 3. etc\n- CTA is never numbered\n- Each block is 1 to 3 sentences max\n- Hook already given, do not change it\n- Do not use em dashes anywhere in the output\n- Output only the thread, no preamble`;
  const res = await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"user",content:prompt}],max_tokens:1200})});
  const data = await res.json().catch(()=>({}));
  return data.choices?.[0]?.message?.content || "";
}

function getMockHooks(topic) {
  return [
    `CONTRARIAN: Most people think ${topic.slice(0,30)} is hard. It is not. Here is what they are missing.`,
    `CURIOSITY GAP: I spent 90 days studying ${topic.slice(0,25)}. What I found surprised everyone.`,
    `BOLD PROMISE: Master ${topic.slice(0,30)} in 7 steps and you will never struggle with it again.`,
    `STORY: Three years ago I knew nothing about ${topic.slice(0,20)}. Here is what changed everything.`,
    `QUESTION: What if everything you have been told about ${topic.slice(0,20)} is wrong?`,
  ].join("\n");
}

function getMockThread(topic, hook, ctaGoal) {
  return `HOOK:\n${hook}\n👇\n\n1. Most people overcomplicate ${topic}. The truth? It comes down to 3 core principles.\n\n2. Principle one: Start before you are ready. Momentum builds clarity. Waiting kills progress.\n\n3. Principle two: Consistency over perfection. One good thing every day beats one great thing every month.\n\n4. Principle three: Your audience wants to see your journey, not just your highlight reel.\n\n5. Here is the system that makes this automatic: batch, schedule, and show up. Rinse, repeat.\n\n6. The people who win at ${topic} are not more talented. They just stopped waiting for perfect conditions.\n\n7. If you remember one thing from this thread: action is the strategy. Start ugly, refine as you go.\n\nCTA:\n${ctaGoal==="follow"?"Follow me for more threads like this. I post weekly on content strategy and growth.":`Drop a 🔥 if this hit home. ${ctaGoal==="comment"?"Comment below with what was most useful.":ctaGoal==="save"?"Save this for when you need a reminder.":ctaGoal==="link"?"Click the link in bio for the full breakdown.":"Share this with someone who needs it."}`}`;
}

function parseHooks(raw) {
  return raw.trim().split("\n").filter(l=>l.trim()).map((line,i)=>{
    const colonIdx = line.indexOf(":");
    if(colonIdx===-1) return { id:`h${i}`, label:HOOK_STRATEGIES[i]?.label||`Hook ${i+1}`, type:HOOK_STRATEGIES[i]?.id||"hook", text:line.trim() };
    const strategy = line.slice(0,colonIdx).trim().toLowerCase().replace(/\s+/g,"-");
    const text = line.slice(colonIdx+1).trim();
    const matched = HOOK_STRATEGIES.find(s=>strategy.includes(s.id.replace("-gap","").replace("bold-","").replace("curiosity-",""))||strategy.includes(s.label.toLowerCase().slice(0,6)));
    return { id:`h${i}`, label:HOOK_STRATEGIES[i]?.label||`Hook ${i+1}`, type:matched?.id||strategy, text };
  }).slice(0,5);
}

function TeddyThreadScreen({ apiKey, onBack, upsert, setScreen }) {
  const [topic,         setTopic]         = useState("");
  const [hookOptions,   setHookOptions]   = useState([]);
  const [selectedHook,  setSelectedHook]  = useState(null);
  const [ctaGoal,       setCtaGoal]       = useState("follow");
  const [customCta,     setCustomCta]     = useState("");
  const [finalThread,   setFinalThread]   = useState("");
  const [step,          setStep]          = useState(1); // 1=topic, 2=hooks, 3=cta, 4=result
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [copied,        setCopied]        = useState(false);
  const [copiedBlock,   setCopiedBlock]   = useState(null);

  const effectiveCta = ctaGoal==="custom" ? customCta : CTA_OPTIONS.find(c=>c.id===ctaGoal)?.label||ctaGoal;
  const selectedHookText = hookOptions.find(h=>h.id===selectedHook)?.text||"";

  const generateHooks = async () => {
    if(!topic.trim()) return;
    setLoading(true); setError(""); setHookOptions([]); setSelectedHook(null); setFinalThread(""); setStep(2);
    try {
      const raw = apiKey ? await callOpenAIHooks(apiKey, topic) : await new Promise(r=>setTimeout(()=>r(getMockHooks(topic)),1200));
      setHookOptions(parseHooks(raw));
    } catch(e){ setError(e.message); setStep(1); }
    finally{ setLoading(false); }
  };

  const generateThread = async () => {
    if(!selectedHookText||!effectiveCta) return;
    setLoading(true); setError(""); setFinalThread(""); setStep(4);
    try {
      const raw = apiKey ? await callOpenAIThread(apiKey, topic, selectedHookText, effectiveCta) : await new Promise(r=>setTimeout(()=>r(getMockThread(topic,selectedHookText,ctaGoal)),1600));
      setFinalThread(raw);
    } catch(e){ setError(e.message); setStep(3); }
    finally{ setLoading(false); }
  };

  const saveAsPost = () => {
    if(!finalThread) return;
    upsert({ id:uid(), title:`🧵 ${topic.slice(0,50)}`, content:finalThread, platforms:["twitter"], status:"draft", format:"thread", threadFramework:"teddy", threadHookType:hookOptions.find(h=>h.id===selectedHook)?.type||"", threadGoal:effectiveCta, pillar:"education", contentType:"thread", hashtags:"", notes:"", createdAt:new Date().toISOString() });
    setScreen("content");
  };

  const copyThread = () => { if(finalThread){ copyToClipboard(finalThread); setCopied(true); setTimeout(()=>setCopied(false),2000); } };
  const copyBlock = (text, key) => { copyToClipboard(text); setCopiedBlock(key); setTimeout(()=>setCopiedBlock(null),2000); };
  const reset = () => { setStep(1); setTopic(""); setHookOptions([]); setSelectedHook(null); setFinalThread(""); setError(""); };

  const parseThreadBlocks = (raw) => {
    const blocks = [];
    // Extract HOOK (everything from HOOK: up to first numbered block)
    const hookMatch = raw.match(/HOOK:\s*([\s\S]*?)(?=\n\s*1\.)/i);
    if(hookMatch) blocks.push({ key:"hook", label:"🪝 Hook", text: hookMatch[1].replace(/👇\s*$/,"").trim() });
    // Extract numbered blocks 1-7 — text only (no number prefix, label shows number)
    const numRegex = /(?:^|\n)\s*(\d+)\.\s+([\s\S]*?)(?=\n\s*\d+\.|\n\s*CTA:|$)/gi;
    let m;
    while((m=numRegex.exec(raw))!==null){
      const txt = m[2].trim();
      if(txt) blocks.push({ key:`block-${m[1]}`, label:`${m[1]}.`, text: txt });
    }
    // Extract CTA
    const ctaMatch = raw.match(/CTA:\s*([\s\S]*)$/i);
    if(ctaMatch) blocks.push({ key:"cta", label:"🎯 CTA", text: ctaMatch[1].trim() });
    // Fallback: if nothing parsed, show raw as single block
    if(blocks.length===0) blocks.push({ key:"raw", label:"Thread", text: raw.trim() });
    return blocks;
  };

  const STEP_LABELS = ["1. Topic","2. Pick Hook","3. CTA Goal","4. Thread"];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      <PageHeader title="🧵 Teddy Thread" subtitle="Generate a perfectly structured 9-block social thread in minutes." onBack={onBack}
        actions={step>1&&<Btn small variant="ghost" onClick={reset}>↺ Start Over</Btn>}
      />

      {/* Step indicators */}
      <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
        {STEP_LABELS.map((label,i)=>{
          const n=i+1; const done=step>n; const active=step===n;
          return (
            <div key={label} style={{display:"flex",alignItems:"center",gap:"6px",padding:"7px 14px",borderRadius:"20px",background:done?`${C.teal}18`:active?`${C.pink}18`:C.surf2,border:`1px solid ${done?C.teal:active?C.pink:C.border}`,fontSize:TYPE.label,fontWeight:"700",color:done?C.teal:active?C.pink:C.muted}}>
              {done?"✓ ":""}{label}
            </div>
          );
        })}
      </div>

      {error && <div style={{background:"#ff334418",border:"1px solid #ff334428",borderRadius:"8px",padding:"10px 13px",fontSize:TYPE.helper,color:"#ff6666"}}>⚠️ {error}</div>}

      {/* STEP 1: Topic */}
      <div style={{background:C.surf,border:`1px solid ${step===1?C.pink:C.border}`,borderRadius:"13px",padding:"20px"}}>
        <div style={{fontSize:TYPE.body,fontWeight:"700",color:step===1?C.pink:C.muted,marginBottom:"4px"}}>Step 1: What is your thread about?</div>
        <div style={{fontSize:TYPE.helper,color:C.muted,marginBottom:"12px"}}>Enter a specific topic or angle. The more specific, the better your hooks.</div>
        <textarea value={topic} onChange={e=>setTopic(e.target.value)} rows={3} placeholder="e.g. How I went from 0 to 10k followers in 90 days without paid ads…" style={{...inputSt,resize:"vertical",lineHeight:"1.6",marginBottom:"12px"}} disabled={step>1} />
        {step===1&&<Btn onClick={generateHooks} disabled={!topic.trim()||loading}>{loading?"⚡ Generating hooks…":"✨ Generate Hook Options"}</Btn>}
      </div>

      {/* STEP 2: Hook options */}
      {hookOptions.length>0&&(
        <div style={{background:C.surf,border:`1px solid ${step===2?C.pink:C.border}`,borderRadius:"13px",padding:"20px"}}>
          <div style={{fontSize:TYPE.body,fontWeight:"700",color:step===2?C.pink:C.muted,marginBottom:"4px"}}>Step 2: Pick your hook</div>
          <div style={{fontSize:TYPE.helper,color:C.muted,marginBottom:"12px"}}>Each is under 130 characters. Choose the one that feels most "you."</div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"14px"}}>
            {hookOptions.map(h=>{
              const sel=selectedHook===h.id;
              return (
                <button key={h.id} onClick={()=>{setSelectedHook(h.id);if(step===2)setStep(3);}} style={{background:sel?`${C.teal}14`:"transparent",border:`1px solid ${sel?C.teal:C.border}`,borderRadius:"10px",padding:"12px 14px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.15s"}}>
                  <div style={{fontSize:TYPE.chip,fontWeight:"700",color:sel?C.teal:C.muted,marginBottom:"4px"}}>{h.label}</div>
                  <div style={{fontSize:TYPE.body,color:sel?C.white:C.text,lineHeight:"1.6"}}>{h.text}</div>
                  {sel&&<div style={{fontSize:TYPE.chip,color:C.teal,marginTop:"4px"}}>✓ Selected</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: CTA Goal */}
      {(step>=3||selectedHook)&&(
        <div style={{background:C.surf,border:`1px solid ${step===3?C.pink:C.border}`,borderRadius:"13px",padding:"20px"}}>
          <div style={{fontSize:TYPE.body,fontWeight:"700",color:step===3?C.pink:C.muted,marginBottom:"4px"}}>Step 3: Set your CTA goal</div>
          <div style={{fontSize:TYPE.helper,color:C.muted,marginBottom:"12px"}}>What do you want readers to do at the end?</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"12px"}}>
            {CTA_OPTIONS.map(c=>{
              const sel=ctaGoal===c.id;
              return <button key={c.id} onClick={()=>setCtaGoal(c.id)} style={{background:sel?`${C.pink}18`:"transparent",border:`1px solid ${sel?C.pink:C.border}`,borderRadius:"8px",padding:"7px 14px",cursor:"pointer",color:sel?C.pink:C.muted,fontSize:TYPE.label,fontWeight:sel?"700":"600",fontFamily:"inherit",transition:"all 0.15s"}}>{c.label}</button>;
            })}
          </div>
          {ctaGoal==="custom"&&<input value={customCta} onChange={e=>setCustomCta(e.target.value)} placeholder="Type your custom CTA…" style={{...inputSt,marginBottom:"12px",fontSize:TYPE.body}} />}
          <Btn onClick={generateThread} disabled={!selectedHook||loading||(ctaGoal==="custom"&&!customCta.trim())}>{loading?"⚡ Writing your thread…":"🧵 Generate Teddy Thread"}</Btn>
        </div>
      )}

      {/* STEP 4: Final Thread */}
      {finalThread&&(
        <div style={{background:C.surf,border:`1px solid ${C.teal}44`,borderRadius:"13px",padding:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
            <div style={{fontSize:TYPE.body,fontWeight:"700",color:C.teal}}>🧵 Your Teddy Thread</div>
            <div style={{display:"flex",gap:"8px"}}>
              <Btn small variant="ghost" onClick={copyThread}>{copied?"✓ All Copied!":"📋 Copy Full Thread"}</Btn>
              <Btn small variant="teal" onClick={saveAsPost}>💾 Save as Post</Btn>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {parseThreadBlocks(finalThread).map(block=>{
              const isHook = block.key==="hook";
              const isCta  = block.key==="cta";
              const accent = isHook ? C.pink : isCta ? C.teal : "rgba(255,255,255,0.18)";
              const labelColor = isHook ? C.pink : isCta ? C.teal : C.muted;
              const isCopied = copiedBlock===block.key;
              return (
                <div key={block.key} style={{background:C.surf2,border:`1px solid ${accent}`,borderRadius:"10px",overflow:"hidden"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 13px",borderBottom:`1px solid ${accent}33`,background:`${accent}08`}}>
                    <span style={{fontSize:TYPE.chip,fontWeight:"700",color:labelColor,letterSpacing:"0.04em"}}>{block.label}</span>
                    <button onClick={()=>copyBlock(block.text, block.key)} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:"5px",color:isCopied?"#00F5D4":C.pink,fontSize:"11px",fontWeight:"700",fontFamily:"inherit",padding:"3px 10px",cursor:"pointer",transition:"all 0.15s"}}>{isCopied?"✓ Copied":"Copy"}</button>
                  </div>
                  <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-word",color:C.white,fontSize:TYPE.body,lineHeight:"1.85",fontFamily:"inherit",margin:0,padding:"13px 15px"}}>{block.text}</pre>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PERFECT PROMPTING FRAMEWORK™ SCREEN ──────────────────────────────────────

const DEFAULT_PROMPT_TEMPLATE = { expertPerspective:"", context:"", specificQuestion:"", dialogueInstruction:"If you need more details to improve your answer, ask." };

async function callOpenAIPrompt(apiKey, tmpl) {
  const compiled = `Act as a ${tmpl.expertPerspective}.\n\nHere is the context:\n${tmpl.context}\n\nMy specific request is:\n${tmpl.specificQuestion}\n\n${tmpl.dialogueInstruction}`;
  const system = `You are an expert social media content strategist.${FORMAT_RULE}`;
  const res = await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"system",content:system},{role:"user",content:compiled}],max_tokens:900})});
  const data = await res.json().catch(()=>({}));
  return data.choices?.[0]?.message?.content || "No response received.";
}

function PerfectPromptingScreen({ apiKey, onBack, onUseInCreator }) {
  const [fields,      setFields]      = useState(DEFAULT_PROMPT_TEMPLATE);
  const [saved,       setSaved]       = useState([]);
  const [aiResult,    setAiResult]    = useState("");
  const [aiDrafts,    setAiDrafts]    = useState({});
  const [aiEditSection,setAiEditSection]=useState(null);
  const [generating,  setGenerating]  = useState(false);
  const [error,       setError]       = useState("");
  const [showSaved,   setShowSaved]   = useState(false);
  const [copiedPrompt,setCopiedPrompt]= useState(false);

  const f = (k,v) => setFields(prev=>({...prev,[k]:v}));
  const ready = fields.expertPerspective.trim() && fields.context.trim() && fields.specificQuestion.trim();

  const compiledPrompt = ready
    ? `Act as a ${fields.expertPerspective}.\n\nHere is the context:\n${fields.context}\n\nMy specific request is:\n${fields.specificQuestion}\n\n${fields.dialogueInstruction}`
    : "";

  const generate = async () => {
    if(!ready) return;
    setGenerating(true); setError(""); setAiResult(""); setAiDrafts({}); setAiEditSection(null);
    try {
      const result = apiKey
        ? await callOpenAIPrompt(apiKey, fields)
        : await new Promise(r=>setTimeout(()=>r(`HOOK:\nMost ${fields.expertPerspective||"content creators"} are solving the wrong problem entirely — and that one shift changes everything.\n\nCORE MESSAGE:\nThe real gap isn't strategy or effort. It's clarity on who you're speaking to and what transformation you actually offer them.\n\nBODY:\nHere's what I see happening again and again:\n\nPeople spend hours perfecting their content — the captions, the visuals, the posting schedule.\n\nBut the message underneath is still fuzzy.\n\nWhen you get crystal clear on the one person you're writing for — their exact fear, their exact desire — the content almost writes itself.\n\nThe strategy becomes obvious. The hook becomes natural. The CTA becomes easy.\n\nThat's the shift. Not more content. More clarity.\n\nCTA:\nWhat's the one thing your ideal client is secretly afraid of right now? Drop it below — let's build your next post around it.`),1400));
      setAiResult(result);
      const p = parseOutput(result);
      const structured = hasStructure(p) ? p : { hook:"", coreMessage:"", body:result.trim(), cta:"" };
      setAiDrafts(structured);
    } catch(e){ setError(e.message); }
    finally{ setGenerating(false); }
  };

  const savePrompt = () => {
    if(!ready) return;
    const newTemplate = { id:uid(), title:fields.specificQuestion.slice(0,50)+"…", ...fields, createdAt:new Date().toISOString() };
    setSaved(prev=>[newTemplate,...prev]);
  };

  const loadPrompt = tmpl => { setFields({ expertPerspective:tmpl.expertPerspective, context:tmpl.context, specificQuestion:tmpl.specificQuestion, dialogueInstruction:tmpl.dialogueInstruction }); setShowSaved(false); };

  const copyPrompt = () => {
    if(compiledPrompt) { copyToClipboard(compiledPrompt); setCopiedPrompt(true); setTimeout(()=>setCopiedPrompt(false),2000); }
  };

  const fieldCfg = [
    { key:"expertPerspective", label:"1. Expert Perspective", helper:"Who should the AI act as?", placeholder:'e.g. "a senior social media strategist specializing in personal brands"', rows:2 },
    { key:"context",           label:"2. Context",            helper:"What background should the AI know?", placeholder:"Describe your business, audience, goal, or situation…", rows:4 },
    { key:"specificQuestion",  label:"3. Specific Request",   helper:"What exactly do you want the AI to do?", placeholder:"e.g. Write 5 Instagram caption hooks about my new coaching program launch…", rows:3 },
    { key:"dialogueInstruction",label:"4. Encourage Dialogue",helper:"Invite the AI to ask clarifying questions.", placeholder:"If you need more details to improve your answer, ask.", rows:2 },
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      <PageHeader title="🧠 Content Prompting Framework™" subtitle="Build sharper AI content in 4 guided steps. Get better outputs every time." onBack={onBack}
        actions={
          <div style={{display:"flex",gap:"8px"}}>
            <Btn small variant="ghost" onClick={()=>setShowSaved(s=>!s)}>{showSaved?"✕ Close":"📂 Saved Prompts"} {saved.length>0&&`(${saved.length})`}</Btn>
          </div>
        }
      />

      {showSaved && (
        <div style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:"13px",padding:"16px"}}>
          <div style={{fontSize:TYPE.label,fontWeight:"700",color:C.muted,textTransform:"uppercase",marginBottom:"10px"}}>Saved Prompts</div>
          {saved.length===0 ? <div style={{color:C.dim,fontSize:TYPE.helper}}>No saved prompts yet.</div> : (
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {saved.map(s=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:"10px",padding:"10px 12px",background:C.surf2,borderRadius:"9px",border:`1px solid ${C.border}`}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:TYPE.body,fontWeight:"600",color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title}</div>
                    <div style={{fontSize:TYPE.helper,color:C.muted}}>{s.expertPerspective.slice(0,60)}…</div>
                  </div>
                  <Btn small variant="teal" onClick={()=>loadPrompt(s)}>Load</Btn>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18px",alignItems:"start"}}>
        {/* LEFT: 4 fields */}
        <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
          {fieldCfg.map(fc=>(
            <div key={fc.key} style={{background:C.surf,border:`1px solid ${C.border}`,borderRadius:"12px",padding:"16px"}}>
              <div style={{fontSize:TYPE.body,fontWeight:"700",color:C.white,marginBottom:"3px"}}>{fc.label}</div>
              <div style={{fontSize:TYPE.helper,color:C.muted,marginBottom:"8px"}}>{fc.helper}</div>
              <textarea value={fields[fc.key]} onChange={e=>f(fc.key,e.target.value)} placeholder={fc.placeholder} rows={fc.rows} style={{...inputSt,resize:"vertical",lineHeight:"1.6",fontSize:TYPE.body}} />
            </div>
          ))}
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            <Btn onClick={generate} disabled={!ready||generating} style={{flex:1}}>{generating?"⚡ Sending…":"✨ Generate with AI"}</Btn>
            <Btn variant="ghost" onClick={copyPrompt} disabled={!compiledPrompt}>{copiedPrompt?"✓ Copied!":"📋 Copy Prompt"}</Btn>
            <Btn variant="ghost" onClick={savePrompt} disabled={!ready}>💾 Save Prompt</Btn>
          </div>
          {error && <div style={{background:"#ff334418",border:"1px solid #ff334428",borderRadius:"8px",padding:"10px 13px",fontSize:TYPE.helper,color:"#ff6666"}}>⚠️ {error}</div>}
        </div>

        {/* RIGHT: compiled preview + AI result */}
        <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
          {/* Compiled prompt preview */}
          <div style={{background:C.surf,border:`1px solid ${C.teal}33`,borderRadius:"12px",padding:"16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
              <div style={{fontSize:TYPE.body,fontWeight:"700",color:C.teal}}>📄 Compiled Prompt</div>
              {compiledPrompt && <Btn small variant="ghost" onClick={copyPrompt}>{copiedPrompt?"✓":"📋"} Copy</Btn>}
            </div>
            {compiledPrompt ? (
              <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-word",color:C.text,fontSize:TYPE.helper,lineHeight:"1.7",fontFamily:"inherit",margin:0}}>{compiledPrompt}</pre>
            ) : (
              <div style={{color:C.dim,fontSize:TYPE.helper,textAlign:"center",padding:"24px 0"}}>Fill in the fields to see your compiled prompt here</div>
            )}
          </div>

          {/* AI result */}
          {(aiResult||generating) && (
            <div style={{background:C.surf,border:`1px solid ${C.pink}44`,borderRadius:"12px",padding:"20px",boxShadow:`0 0 16px ${C.pink}18`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                <div style={{fontSize:TYPE.body,fontWeight:"800",color:C.pink}}>✨ Generated Content</div>
                {aiResult&&<CopyBtn text={aiResult} label="📋 Copy All" small />}
              </div>
              {generating ? (
                <div style={{textAlign:"center",padding:"32px",color:C.muted,fontSize:TYPE.body}}>⚡ Generating your content…</div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  <OutputSection label="🪝 HOOK" sublabel="Scroll-stopping first line" color={C.pink}
                    value={aiDrafts.hook||""} isEditing={aiEditSection==="hook"}
                    onEdit={()=>setAiEditSection("hook")} onClose={()=>setAiEditSection(null)}
                    onChange={v=>setAiDrafts(d=>({...d,hook:v}))} />
                  <OutputSection label="💡 CORE MESSAGE" sublabel="The essential insight in 1–2 sentences" color={C.teal}
                    value={aiDrafts.coreMessage||""} isEditing={aiEditSection==="coreMessage"}
                    onEdit={()=>setAiEditSection("coreMessage")} onClose={()=>setAiEditSection(null)}
                    onChange={v=>setAiDrafts(d=>({...d,coreMessage:v}))} />
                  <OutputSection label="📝 BODY" sublabel="Main content" color="#9988ff"
                    value={aiDrafts.body||""} isEditing={aiEditSection==="body"}
                    onEdit={()=>setAiEditSection("body")} onClose={()=>setAiEditSection(null)}
                    onChange={v=>setAiDrafts(d=>({...d,body:v}))} tall />
                  <OutputSection label="🎯 CTA" sublabel="Call to action" color="#ffaa44"
                    value={aiDrafts.cta||""} isEditing={aiEditSection==="cta"}
                    onEdit={()=>setAiEditSection("cta")} onClose={()=>setAiEditSection(null)}
                    onChange={v=>setAiDrafts(d=>({...d,cta:v}))} />
                  {onUseInCreator && (
                    <div style={{paddingTop:"4px"}}>
                      <Btn small variant="teal" onClick={()=>onUseInCreator(compiledPrompt)}>→ Use in Content Creator</Btn>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const now = new Date();
  // ── Screen routing + history ────────────────────────────────────────────
  const [screen,        setScreenRaw]    = useState("dashboard");
  const [screenHistory, setScreenHistory]= useState([]);
  const setScreen = next => {
    setScreenHistory(h => [...h, screen]);
    setScreenRaw(next);
  };
  const goBack = () => {
    setScreenHistory(h => {
      const prev = h.length ? h[h.length-1] : "dashboard";
      setScreenRaw(prev);
      return h.slice(0,-1);
    });
  };
  // ── Calendar state ──────────────────────────────────────────────────────
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingId,    setEditingId]    = useState(null);
  const [draggingId,   setDraggingId]   = useState(null);
  const [dropTarget,   setDropTarget]   = useState(null);
  // ── Data ────────────────────────────────────────────────────────────────
  const [posts,        setPosts]        = useState(seedPosts);
  const [ideas,        setIdeas]        = useState(seedIdeas);
  const [campaigns,    setCampaigns]    = useState(seedCampaigns);
  const [brandProfile, setBrandProfile] = useState(DEFAULT_BRAND);
  // ── Modals ───────────────────────────────────────────────────────────────
  const [apiKey,        setApiKey]        = useState("");
  const [showSettings,   setShowSettings]   = useState(false);
  const [showCreator,    setShowCreator]    = useState(false);
  const [showRepurpose,  setShowRepurpose]  = useState(false);
  const [repurposePost,  setRepurposePost]  = useState(null);
  const [showHookGen,    setShowHookGen]    = useState(false);
  const [showCTAGen,     setShowCTAGen]     = useState(false);

  const today    = todayKey();
  const grid     = buildGrid(year, month);
  const dayPosts = selectedDate ? posts.filter(p=>p.date===selectedDate) : [];
  const trayPosts= posts.filter(p=>!p.date && (p.status==="draft"||p.status==="ready"));

  const prevMonth = () => month===0?(setYear(y=>y-1),setMonth(11)):setMonth(m=>m-1);
  const nextMonth = () => month===11?(setYear(y=>y+1),setMonth(0)):setMonth(m=>m+1);
  const goToday   = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelectedDate(todayKey()); };

  // ── Post mutations ─────────────────────────────────────────────────────────
  const upsert = useCallback(p => setPosts(prev => {
    const exists = prev.find(x=>x.id===p.id);
    return exists ? prev.map(x=>x.id===p.id?p:x) : [...prev,p];
  }), []);

  const remove = useCallback(id => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setEditingId(null);
  }, []);

  const move = useCallback((id, date) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      if (date) {
        // Dropping onto a calendar cell → mark as scheduled
        const newStatus = (p.status==="draft"||p.status==="ready") ? "scheduled" : p.status;
        return {...p, date, status: newStatus};
      } else {
        // Dropping back to tray → unschedule; revert scheduled→ready
        const newStatus = p.status==="scheduled" ? "ready" : p.status;
        return {...p, date:null, status: newStatus};
      }
    }));
  }, []);

  const bump = useCallback((id, s) => {
    setPosts(prev => prev.map(p => p.id===id ? {...p, status:s} : p));
  }, []);

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const startDrag = id => { setDraggingId(id); setEditingId(null); };
  const endDrag   = () => { setDraggingId(null); setDropTarget(null); };
  const drop      = target => {
    if(draggingId) move(draggingId, target==="tray" ? null : target);
    endDrag();
  };

  const handlePostChipClick = (postId, dateKey) => {
    setSelectedDate(dateKey);
    setEditingId(postId);
    setShowCreator(false);
  };

  const handleCreated = post => {
    upsert(post);
    if(post.date) { setSelectedDate(post.date); setScreen("calendar"); }
    setShowCreator(false);
  };

  const handleRepurposed = newPosts => {
    newPosts.forEach(p => upsert(p));
    setShowRepurpose(false);
    setRepurposePost(null);
    setScreen("content");
  };

  const handleConvertIdea = idea => {
    setShowCreator(true);
    setSelectedDate(null);
    setScreen("calendar");
    setCreatorIdeaPrefill(idea);
  };

  const handleQuickDraft = idea => {
    upsert({
      id:uid(), date:null, title:idea.title||idea.ideaText.slice(0,50),
      content:idea.ideaText, platforms:idea.platforms||[], status:"draft",
      pillar:idea.pillar||"", contentType:"text", campaignId:idea.campaignId||null,
      hashtags:"", notes:`Created from Idea Bank: ${idea.title||""}`, createdAt:new Date().toISOString(),
    });
    setScreen("content");
  };

  const [creatorIdeaPrefill,     setCreatorIdeaPrefill]     = useState(null);
  const [creatorTemplatePrefill, setCreatorTemplatePrefill] = useState(null);

  // ── Side panel ─────────────────────────────────────────────────────────────
  const SideContent = () => {
    if(selectedDate) return (
      <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
        <div style={{ paddingBottom:"12px", borderBottom:`1px solid ${C.border}`, marginBottom:"12px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"10px" }}>
            <div>
              <div style={{ fontSize:"14px", fontWeight:"800", color:C.white }}>{friendly(selectedDate)}</div>
              <div style={{ fontSize:"11px", color:C.muted, marginTop:"2px" }}>{dayPosts.length} post{dayPosts.length!==1?"s":""}</div>
            </div>
            <Btn small variant="ghost" onClick={()=>{ setSelectedDate(null); setEditingId(null); }}>✕</Btn>
          </div>
          <div style={{ display:"flex", gap:"6px" }}>
            <Btn small onClick={()=>setShowCreator(true)} style={{ flex:1 }}>✨ Generate with AI</Btn>
          </div>
        </div>

        <div onDragOver={e=>{e.preventDefault();setDropTarget(selectedDate);}} onDragLeave={()=>setDropTarget(null)} onDrop={e=>{e.preventDefault();drop(selectedDate);}}
          style={{ border:`1px dashed ${draggingId?C.teal:C.dim}`, borderRadius:"7px", padding:draggingId?"9px":"4px 9px", textAlign:"center", fontSize:"10px", color:draggingId?C.teal:C.dim, marginBottom:"10px", transition:"all 0.2s", background:dropTarget===selectedDate?`${C.teal}0c`:"transparent" }}>
          {draggingId?"⬇ Drop here to schedule":"Drag a post here to schedule it"}
        </div>

        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"8px" }}>
          {dayPosts.length===0 ? (
            <div style={{ textAlign:"center", padding:"24px", background:C.surf2, borderRadius:"10px", border:`1px dashed ${C.border}` }}>
              <div style={{ fontSize:"22px", marginBottom:"6px" }}>📅</div>
              <div style={{ color:C.muted, fontSize:"12px" }}>No posts yet. Generate one or drag from the tray.</div>
            </div>
          ) : dayPosts.map(p=>(
            <div key={p.id}>
              {editingId===p.id ? (
                <PostEditor post={p} campaigns={campaigns} apiKey={apiKey} onSave={up=>{ upsert(up); setEditingId(null); }} onDelete={id=>{remove(id);setEditingId(null);}} onClose={()=>setEditingId(null)} />
              ) : (
                <>
                  <PostCard post={p} isDragging={draggingId===p.id} onDragStart={()=>startDrag(p.id)} onDragEnd={endDrag} onClick={()=>setEditingId(p.id)} />
                  <div style={{ display:"flex", gap:"4px", paddingLeft:"2px", marginTop:"4px", flexWrap:"wrap" }}>
                    <span style={{ fontSize:"9px", color:C.dim, alignSelf:"center", marginRight:"2px" }}>Status:</span>
                    {[{id:"draft",label:"Draft",color:"#666699"},{id:"ready",label:"Ready",color:C.teal},{id:"scheduled",label:"Scheduled",color:"#f59e0b"},{id:"posted",label:"Posted",color:C.pink}].map(s=>(
                      <button key={s.id} onClick={()=>bump(p.id,s.id)}
                        style={{ background:p.status===s.id?`${s.color}22`:"transparent", border:`1px solid ${p.status===s.id?s.color:C.border}`, borderRadius:"4px", padding:"2px 8px", color:p.status===s.id?s.color:C.dim, cursor:"pointer", fontSize:"9px", fontWeight:"700", fontFamily:"inherit", transition:"all 0.12s" }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );

    // Default state
    const drafted=posts.filter(p=>p.status==="draft").length;
    const ready=posts.filter(p=>p.status==="ready").length;
    const posted=posts.filter(p=>p.status==="posted").length;
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        <div style={{ textAlign:"center", padding:"16px", background:C.surf2, borderRadius:"11px", border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:"22px", marginBottom:"5px" }}>📅</div>
          <div style={{ fontWeight:"700", color:C.white, fontSize:"13px", marginBottom:"3px" }}>Click any day to view & edit</div>
          <div style={{ fontSize:"11px", color:C.muted, lineHeight:"1.5" }}>Drag posts from the tray onto calendar days to schedule them</div>
        </div>
        <Btn onClick={()=>setShowCreator(true)}>✨ Create New Post</Btn>
        <div style={{ background:C.surf2, borderRadius:"11px", padding:"13px", border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:"10px", fontWeight:"700", color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:"9px" }}>This Month</div>
          {[{l:"Scheduled",v:posts.filter(p=>p.date).length,c:C.white},{l:"Draft",v:drafted,c:"#666699"},{l:"Ready",v:ready,c:"#00F5D4"},{l:"Posted",v:posted,c:"#FF10F0"}].map(s=>(
            <div key={s.l} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:"11px", color:C.muted }}>{s.l}</span>
              <span style={{ fontSize:"12px", fontWeight:"700", color:s.c }}>{s.v}</span>
            </div>
          ))}
        </div>
        <div style={{ background:C.surf2, borderRadius:"11px", padding:"13px", border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:"10px", fontWeight:"700", color:C.muted, textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:"9px" }}>Writing Styles ({ALL_STYLES.length})</div>
          {STYLE_CATEGORIES.map(cat=>(
            <div key={cat.id} style={{ marginBottom:"10px" }}>
              <div style={{ fontSize:"10px", fontWeight:"700", color:C.dim, marginBottom:"4px" }}>{cat.label}</div>
              {cat.styles.map(ws=>(
                <div key={ws.id} style={{ display:"flex", gap:"6px", alignItems:"flex-start", marginBottom:"5px" }}>
                  <span style={{ fontSize:"12px" }}>{ws.emoji}</span>
                  <div>
                    <div style={{ fontSize:"10px", fontWeight:"700", color:ws.color }}>{ws.name}{ws.badge&&" ★"}</div>
                    <div style={{ fontSize:"10px", color:C.muted, lineHeight:"1.4" }}>{ws.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.white, fontFamily:"system-ui,-apple-system,'Segoe UI',sans-serif" }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        button { font-family:inherit; }
        input::placeholder, textarea::placeholder { color:rgba(255,255,255,0.45); }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:#2a2a55; border-radius:2px; }
        textarea { resize:vertical; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 40px #FF10F055,0 0 80px #00F5D422} 50%{box-shadow:0 0 70px #FF10F099,0 0 120px #00F5D455} }
      `}</style>

      {showSettings  && <SettingsModal apiKey={apiKey} setApiKey={setApiKey} onClose={()=>setShowSettings(false)} />}
      {showCreator   && <CreatorModal  apiKey={apiKey} targetDate={selectedDate} brandProfile={brandProfile} campaigns={campaigns} ideaPrefill={creatorIdeaPrefill} templatePrefill={creatorTemplatePrefill} onCreated={p=>{setCreatorIdeaPrefill(null);setCreatorTemplatePrefill(null);handleCreated(p);}} onClose={()=>{setShowCreator(false);setCreatorIdeaPrefill(null);setCreatorTemplatePrefill(null);}} />}
      {showRepurpose && repurposePost && <RepurposeModal apiKey={apiKey} post={repurposePost} onSave={handleRepurposed} onClose={()=>{setShowRepurpose(false);setRepurposePost(null);}} />}
      {showHookGen   && <HookGeneratorModal apiKey={apiKey} onClose={()=>setShowHookGen(false)} onUseAsTopic={null} />}
      {showCTAGen    && <CTAGeneratorModal  apiKey={apiKey} onClose={()=>setShowCTAGen(false)}  onInsert={null} />}

      <NavBar screen={screen} setScreen={setScreen} apiKey={apiKey} onSettings={()=>setShowSettings(true)} onCreatePost={()=>setShowCreator(true)} onHookGen={()=>setShowHookGen(true)} onCTAGen={()=>setShowCTAGen(true)} />

      {/* Non-calendar screens */}
      {screen!=="calendar" && (
        <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"20px 18px" }}>
          {screen==="dashboard"         && <DashboardScreen posts={posts} ideas={ideas} campaigns={campaigns} setScreen={setScreen} onCreatePost={()=>setShowCreator(true)} />}
          {screen==="content"           && <ContentScreen posts={posts} campaigns={campaigns} upsert={upsert} remove={remove} apiKey={apiKey} onRepurpose={p=>{setRepurposePost(p);setShowRepurpose(true);}} onBack={goBack} onGoToCalendar={()=>setScreen("calendar")} />}
          {screen==="ideas"             && <IdeaBankScreen ideas={ideas} setIdeas={setIdeas} campaigns={campaigns} onConvertToPost={handleConvertIdea} onQuickDraft={handleQuickDraft} onBack={goBack} />}
          {screen==="campaigns"         && <CampaignsScreen campaigns={campaigns} setCampaigns={setCampaigns} posts={posts} upsert={upsert} onCreatePost={()=>setShowCreator(true)} onBack={goBack} />}
          {screen==="templates"         && <TemplatesScreen onUseTemplate={t=>{setCreatorTemplatePrefill(t);setShowCreator(true);}} onBack={goBack} setScreen={setScreen} />}
          {screen==="brand"             && <BrandProfileScreen brandProfile={brandProfile} setBrandProfile={setBrandProfile} onBack={goBack} />}
          {screen==="analytics"         && <AnalyticsScreen posts={posts} upsert={upsert} onBack={goBack} />}
          {screen==="perfect-prompting" && <PerfectPromptingScreen apiKey={apiKey} onBack={goBack} onUseInCreator={(prompt)=>{setShowCreator(true);}} />}
          {screen==="teddy-thread"      && <TeddyThreadScreen apiKey={apiKey} onBack={goBack} upsert={upsert} setScreen={setScreen} />}
        </div>
      )}

      {/* Calendar screen */}
      {screen==="calendar" && (
      <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"18px", display:"grid", gridTemplateColumns:"280px 1fr", gap:"18px", alignItems:"start" }}>

        {/* LEFT: Side panel */}
        <div style={{ background:C.surf, border:`1px solid ${C.border}`, borderRadius:"13px", padding:"16px", position:"sticky", top:"72px", maxHeight:"calc(100vh - 90px)", overflowY:"auto" }}>
          {SideContent()}
        </div>

        {/* RIGHT: Calendar + Tray */}
        <div>
          {/* Month nav */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <button onClick={prevMonth} style={{ background:C.surf,border:`1px solid ${C.border}`,borderRadius:"6px",color:C.muted,cursor:"pointer",padding:"5px 11px",fontSize:"14px",fontFamily:"inherit" }}>‹</button>
              <h2 style={{ fontSize:"17px",fontWeight:"800",color:C.white,minWidth:"150px" }}>{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} style={{ background:C.surf,border:`1px solid ${C.border}`,borderRadius:"6px",color:C.muted,cursor:"pointer",padding:"5px 11px",fontSize:"14px",fontFamily:"inherit" }}>›</button>
              <button onClick={goToday} style={{ background:"transparent",border:`1px solid ${C.teal}44`,borderRadius:"6px",color:C.teal,cursor:"pointer",padding:"5px 11px",fontSize:"11px",fontWeight:"700",fontFamily:"inherit" }}>Today</button>
            </div>
            <Btn small onClick={()=>setShowCreator(true)}>✨ Create Post</Btn>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"3px",marginBottom:"3px" }}>
            {DAYS_S.map(d=><div key={d} style={{ textAlign:"center",fontSize:"10px",fontWeight:"700",color:C.dim,textTransform:"uppercase",letterSpacing:"0.7px",padding:"4px 0" }}>{d}</div>)}
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"3px" }}>
            {grid.map((day,i)=>(
              <DayCell key={i} day={day} year={year} month={month} posts={posts}
                selected={day?toKey(year,month,day)===selectedDate:false}
                isToday={day?toKey(year,month,day)===today:false}
                isDropTarget={day?dropTarget===toKey(year,month,day):false}
                draggingId={draggingId}
                onCellClick={k=>{ setSelectedDate(k===selectedDate?null:k); setEditingId(null); setShowCreator(false); }}
                onPostClick={handlePostChipClick}
                onStatusChange={(postId,status)=>bump(postId,status)}
                onPostDragStart={startDrag} onPostDragEnd={endDrag}
                onDragOver={k=>setDropTarget(k)} onDragLeave={()=>setDropTarget(null)} onDrop={k=>drop(k)}
              />
            ))}
          </div>

          <div style={{ marginTop:"8px",padding:"8px 13px",background:C.surf,borderRadius:"8px",border:`1px solid ${C.border}`,display:"flex",gap:"14px",flexWrap:"wrap",alignItems:"center" }}>
            <span style={{ fontSize:"10px",color:C.dim,fontWeight:"700",textTransform:"uppercase" }}>Legend:</span>
            {STATUSES.map(s=><div key={s.id} style={{ display:"flex",alignItems:"center",gap:"4px" }}><StatusDot status={s.id}/><span style={{ fontSize:"10px",color:C.muted }}>{s.label}</span></div>)}
            <span style={{ fontSize:"10px",color:C.dim,marginLeft:"auto" }}>Drag posts directly from calendar cells to reschedule</span>
          </div>

          {/* Unscheduled tray */}
          <div style={{ marginTop:"16px" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"8px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:"7px" }}>
                <span style={{ fontSize:"13px",fontWeight:"800",color:C.white }}>📥 Unscheduled Posts</span>
                <Chip color={C.muted}>{trayPosts.length}</Chip>
                {dropTarget==="tray"&&draggingId&&<Chip color={C.teal}>Drop to unschedule</Chip>}
              </div>
              <Btn small variant="teal" onClick={()=>{ setSelectedDate(null); setShowCreator(true); }}>✨ Generate New</Btn>
            </div>
            <div onDragOver={e=>{e.preventDefault();setDropTarget("tray");}} onDragLeave={()=>setDropTarget(null)} onDrop={e=>{e.preventDefault();drop("tray");}}
              style={{ background:dropTarget==="tray"?`${C.teal}08`:C.surf, border:`1px ${dropTarget==="tray"?"solid":"dashed"} ${dropTarget==="tray"?C.teal:C.border}`, borderRadius:"11px", padding:"12px", minHeight:"80px", transition:"all 0.15s", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"9px", alignItems:"start" }}>
              {trayPosts.length===0 ? (
                <div style={{ gridColumn:"1/-1",textAlign:"center",color:C.dim,fontSize:"12px",padding:"16px 0" }}>
                  No unscheduled posts. Generate one above, then drag it onto the calendar.
                </div>
              ) : trayPosts.map(p=>(
                <div key={p.id}>
                  {editingId===p.id ? (
                    <PostEditor post={p} campaigns={campaigns} apiKey={apiKey} onSave={up=>{ upsert(up); setEditingId(null); }} onDelete={id=>{remove(id);setEditingId(null);}} onClose={()=>setEditingId(null)} />
                  ) : (
                    <PostCard post={p} isDragging={draggingId===p.id} onDragStart={()=>startDrag(p.id)} onDragEnd={endDrag} onClick={()=>setEditingId(p.id)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
