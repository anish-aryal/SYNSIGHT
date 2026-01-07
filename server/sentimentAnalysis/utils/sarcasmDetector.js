// General-purpose sarcasm signals for social text + VADER.
// This is still heuristic (no ML), but far broader than fixed phrase lists.
// Key idea: sarcasm often looks like "surface positivity" + (negative cue OR contrast OR sarcasm markers OR VADER contradiction)

const POS_WORDS = [
  'great','wonderful','perfect','fantastic','brilliant','amazing','lovely','awesome','incredible',
  'nice','excellent','genius','stellar','outstanding','remarkable','beautiful'
];

const NEG_WORDS = [
  'worst','terrible','awful','horrible','hate','annoying','frustrating','broken','useless',
  'disappointed','infuriating','dumb','stupid','garbage','trash','bonkers','ridiculous','pathetic','sorry-ass'
];

// Common sarcasm discourse markers (these are high-signal across domains)
const DISCOURSE_MARKERS = [
  'yeah right', 'as if', 'sure jan', 'sure buddy', 'sure pal', 'cool story',
  'good luck with that', 'of course', 'obviously', 'right...', 'sure...', 'totally', 'literally'
];

// Emoji + reactions (social sarcasm cues)
const SARCASM_EMOJIS = ['🙄','😒','😑','🤷','👍','😏','🤦','🤦‍♂️','🤦‍♀️','🤡','💀','🫠','🤨','😂'];

// Some common “fixed” sarcasm phrases still help, but keep the list short.
// You do NOT want to maintain 500 phrases.
const SHORT_PHRASES = [
  'just what i needed', 'exactly what i wanted', "couldn't be better",
  'best day ever', 'thanks i hate it', 'love that for me', 'what could possibly go wrong'
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const POS_RE = POS_WORDS.map(escapeRegex).join('|');
const NEG_RE = NEG_WORDS.map(escapeRegex).join('|');
const DISC_RE = DISCOURSE_MARKERS.map(escapeRegex).join('|');
const PHRASE_RE = SHORT_PHRASES.map(escapeRegex).join('|');

const normalize = (text = '') =>
  String(text).replace(/\u0000/g, '').replace(/\s+/g, ' ').trim();

const hasEmoji = (text = '') => SARCASM_EMOJIS.some(e => text.includes(e));
const hasExcessPunct = (text = '') => /[!?]{2,}/.test(text);
const hasEllipsis = (text = '') => /\.{3,}/.test(text);
const hasAllCaps = (text = '') => /\b[A-Z]{4,}\b/.test(text);

// Windowed check: negative cue near positive cue (reduces false positives)
function negNearPos(text, windowSize = 10) {
  const tokens = normalize(text).toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return false;

  const posSet = new Set(POS_WORDS.concat(['wow'])); // allow wow as “positive surface”
  const negSet = new Set(NEG_WORDS);

  const clean = (t) => t.replace(/[^\p{L}\p{N}'-]/gu, '');

  for (let i = 0; i < tokens.length; i++) {
    const ti = clean(tokens[i]);
    if (!posSet.has(ti)) continue;

    const start = Math.max(0, i - windowSize);
    const end = Math.min(tokens.length, i + windowSize + 1);

    for (let j = start; j < end; j++) {
      const tj = clean(tokens[j]);
      if (negSet.has(tj)) return true;
    }
  }
  return false;
}

// ---------- Sarcasm templates (broad coverage) ----------
const TEMPLATES = [
  // Explicit sarcasm tag
  { name: 'explicit_/s', re: /(^|\s)\/s(\s|$)/i, weight: 5 },

  // “just/oh/wow/yeah + positive word”: just wonderful, just wow, oh great, yeah amazing
  { name: 'exclamatory_positive', re: new RegExp(`\\b(oh|just|wow|yeah)\\s+(?:so\\s+)?(${POS_RE}|wow)\\b`, 'i'), weight: 2 },

  // Discourse markers: yeah right, as if, sure jan, cool story
  { name: 'discourse_marker', re: new RegExp(`\\b(${DISC_RE})\\b`, 'i'), weight: 3 },

  // Scare quotes around positive word: "great", 'perfect'
  { name: 'scare_quotes', re: new RegExp(`["']\\s*(?:${POS_RE})\\s*["']`, 'i'), weight: 2 },

  // Contrast: positive then but/however/yet/of course then negative cue
  { name: 'contrast_pattern', re: new RegExp(`\\b(${POS_RE})\\b.*\\b(but|however|yet|though|and then|of course)\\b.*\\b(${NEG_RE})\\b`, 'i'), weight: 2 },

  // “love it when …” pattern (very common sarcasm): "Love it when my phone dies"
  { name: 'love_it_when', re: /\blove\s+it\s+when\b/i, weight: 2 },

  // “thanks” sarcasm: Thanks, Apple. Thanks for nothing.
  { name: 'thanks_pattern', re: /\bthanks\b.*(\bnothing\b|\ba lot\b|[.!])?/i, weight: 1 },

  // Short high-signal fixed phrases
  { name: 'known_sarcasm_phrase', re: new RegExp(`\\b(${PHRASE_RE})\\b`, 'i'), weight: 3 },
];

export function detectSarcasm(text, vaderScores = {}) {
  const raw = String(text || '');
  const t = normalize(raw);

  const pos = vaderScores.positive ?? vaderScores.pos ?? 0;
  const neg = vaderScores.negative ?? vaderScores.neg ?? 0;
  const compound = vaderScores.compound ?? 0;

  const reasons = [];
  let score = 0;

  // Template hits
  for (const tpl of TEMPLATES) {
    if (tpl.re.test(t)) {
      score += tpl.weight;
      reasons.push(tpl.name);
    }
  }

  // Contextual signals
  const hasNeg = new RegExp(`\\b(${NEG_RE})\\b`, 'i').test(t);
  if (hasNeg) { score += 1; reasons.push('negative_cue'); }

  const negNear = negNearPos(t);
  if (negNear) { score += 2; reasons.push('negative_near_positive'); }

  if (hasEmoji(raw)) { score += 2; reasons.push('sarcasm_emoji'); }
  if (hasExcessPunct(raw)) { score += 1; reasons.push('excess_punctuation'); }
  if (hasEllipsis(raw)) { score += 1; reasons.push('ellipsis'); }
  if (hasAllCaps(raw)) { score += 1; reasons.push('all_caps'); }

  // VADER contradiction: positivity present but overall negative
  const contradiction = pos >= 0.25 && compound <= -0.15 && (pos - neg) >= 0.05;
  if (contradiction) { score += 2; reasons.push('vader_contradiction'); }

  // False-positive guard:
  // If only weak exclamatory positive matched (e.g., "just wonderful") with no other signals,
  // do not label sarcastic.
  const onlyWeakPositive =
    reasons.length === 1 &&
    reasons[0] === 'exclamatory_positive' &&
    !hasNeg &&
    !negNear &&
    !hasEmoji(raw) &&
    !contradiction;

  if (onlyWeakPositive) {
    score = Math.max(0, score - 2);
    reasons.push('downgraded_weak_positive_only');
  }

  const isSarcastic = score >= 4; // tuned for fewer false positives
  const confidence = Math.max(0, Math.min(score / 9, 1));

  return { isSarcastic, confidence, sarcasmScore: score, reasons };
}

// Safer adjustment: do not hard-flip your sentiment label.
// Flag sarcasm and soften compound (or nudge if you want).
export function adjustForSarcasm(sentiment, scores = {}, text) {
  const sarcasm = detectSarcasm(text, scores);
  if (!sarcasm.isSarcastic) return { sentiment, scores, sarcasmDetected: false };

  const compound = scores.compound ?? 0;

  let adjustedCompound = compound * 0.6;
  if (sentiment === 'positive' && sarcasm.confidence >= 0.7) {
    adjustedCompound = Math.min(adjustedCompound, -0.05); // slight nudge negative
  }

  return {
    sentiment,
    scores: { ...scores, compound: adjustedCompound },
    sarcasmDetected: true,
    sarcasmConfidence: sarcasm.confidence,
    sarcasmReasons: sarcasm.reasons,
    sarcasmScore: sarcasm.sarcasmScore
  };
}
