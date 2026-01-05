const SARCASM_MARKERS = [
  'oh great','just great','oh wonderful','perfect','fantastic','brilliant',
  'amazing','lovely','just what i needed','exactly what i wanted',
  'couldn\'t be better','best day ever'
];

const NEGATIVE_CONTEXT = [
  'not','never','worst','terrible','awful','horrible','hate','annoying',
  'frustrating','broken','useless','disappointed'
];

const SARCASM_EMOJIS = ['🙄', '😒', '😑', '🤷', '👍'];

export const detectSarcasm = (text, sentimentScores) => {
  const lowercaseText = (text || '').toLowerCase();

  const hasSarcasmMarker = SARCASM_MARKERS.some(m => lowercaseText.includes(m));
  const hasNegativeContext = NEGATIVE_CONTEXT.some(w => lowercaseText.includes(w));
  const hasExcessivePunctuation = /[!?]{2,}/.test(text || '');
  const hasSarcasmEmoji = SARCASM_EMOJIS.some(e => (text || '').includes(e));

  const contradiction = (sentimentScores?.positive ?? 0) > 0.3 && (sentimentScores?.compound ?? 0) < -0.1;

  let sarcasmScore = 0;
  if (hasSarcasmMarker) sarcasmScore += 3;
  if (hasNegativeContext && (sentimentScores?.positive ?? 0) > 0.2) sarcasmScore += 2;
  if (hasExcessivePunctuation) sarcasmScore += 1;
  if (hasSarcasmEmoji) sarcasmScore += 2;
  if (contradiction) sarcasmScore += 2;

  return {
    isSarcastic: sarcasmScore >= 3,
    confidence: Math.min(sarcasmScore / 5, 1),
    markers: { hasSarcasmMarker, hasNegativeContext, hasExcessivePunctuation, hasSarcasmEmoji, contradiction }
  };
};

export const adjustForSarcasm = (sentiment, scores, text) => {
  const sarcasmCheck = detectSarcasm(text, scores);

  if (sarcasmCheck.isSarcastic && sarcasmCheck.confidence > 0.6) {
    if (sentiment === 'positive') {
      return {
        sentiment: 'negative',
        scores: { ...scores, compound: -Math.abs(scores.compound) },
        sarcasmDetected: true,
        sarcasmConfidence: sarcasmCheck.confidence
      };
    }
  }

  return { sentiment, scores, sarcasmDetected: false };
};
