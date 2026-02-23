// lib/visualizer/index.ts
function formatSExprGuardToDomain(guard, _entityName) {
  if (Array.isArray(guard)) {
    const [op, ...args] = guard;
    return `${op}(${args.map((a) => JSON.stringify(a)).join(", ")})`;
  }
  return JSON.stringify(guard);
}
function formatSExprEffectToDomain(effect, _entityName) {
  if (Array.isArray(effect)) {
    const [op, ...args] = effect;
    return `${op}(${args.map((a) => JSON.stringify(a)).join(", ")})`;
  }
  return JSON.stringify(effect);
}
function isArraySExpr(expr) {
  return Array.isArray(expr);
}
var DEFAULT_CONFIG = {
  nodeRadius: 70,
  nodeSpacing: 650,
  // Increased to give more room for transitions
  initialIndicatorOffset: 45,
  arrowSize: 12,
  colors: {
    background: "#0d1117",
    node: "#161b22",
    nodeBorder: "#30363d",
    nodeText: "#e6edf3",
    initialNode: "#238636",
    finalNode: "#f85149",
    arrow: "#8b949e",
    arrowText: "#8b949e",
    effectText: "#ffb86c",
    guardText: "#ff79c6",
    initial: "#238636"
  },
  fonts: {
    node: '18px "Inter", sans-serif',
    event: '16px "JetBrains Mono", monospace',
    effect: '14px "JetBrains Mono", monospace'
  }
};
function isBinding(val) {
  return typeof val === "string" && val.startsWith("@");
}
function parseBinding(binding) {
  if (!isBinding(binding)) return null;
  const withoutAt = binding.substring(1);
  const parts = withoutAt.split(".");
  return {
    root: parts[0],
    path: parts.slice(1),
    raw: binding
  };
}
function formatGuard(guard) {
  let text = "";
  if (typeof guard === "string") {
    text = guard;
  } else if (Array.isArray(guard)) {
    text = formatSExprCompact(guard);
  }
  return text ? `[${text}]` : "";
}
function formatGuardHuman(guard, entityName) {
  if (!guard) return "";
  if (typeof guard === "string") {
    return `if ${guard}`;
  }
  if (isArraySExpr(guard)) {
    return formatSExprGuardToDomain(guard);
  }
  return "";
}
function formatEffectsHuman(effects, entityName) {
  if (!Array.isArray(effects) || effects.length === 0) return [];
  return effects.map((effect) => {
    if (isArraySExpr(effect)) {
      return formatSExprEffectToDomain(effect);
    }
    return String(effect);
  }).filter(Boolean);
}
function formatSExprCompact(expr) {
  if (!Array.isArray(expr) || expr.length === 0) return "[]";
  const op = expr[0];
  const args = expr.slice(1);
  const formattedArgs = args.map((a) => {
    if (isBinding(a)) {
      const parsed = parseBinding(a);
      if (parsed && parsed.path.length > 0) {
        return `${parsed.root}.${parsed.path.join(".")}`;
      }
      return parsed?.root || a;
    }
    if (typeof a === "string") return a;
    if (typeof a === "number" || typeof a === "boolean") return String(a);
    if (Array.isArray(a)) return formatSExprCompact(a);
    return "{...}";
  });
  return `${op} ${formattedArgs.join(" ")}`;
}
function getEffectSummary(effects) {
  if (!Array.isArray(effects) || effects.length === 0) return "";
  const setFields = [];
  const otherEffects = [];
  effects.forEach((effect) => {
    if (!Array.isArray(effect)) return;
    const op = effect[0];
    if (op === "set" && effect[1] && typeof effect[1] === "string") {
      const parsed = parseBinding(effect[1]);
      if (parsed && parsed.path.length > 0) {
        setFields.push(parsed.path[parsed.path.length - 1]);
      } else {
        setFields.push("field");
      }
    } else {
      otherEffects.push(effect);
    }
  });
  const summaries = [];
  if (setFields.length > 0) {
    summaries.push(`\u2192 ${setFields.join(", ")}`);
  }
  otherEffects.forEach((effect) => {
    const op = effect[0];
    switch (op) {
      case "emit":
        summaries.push(`\u2191 ${effect[1] || "event"}`);
        break;
      case "notify":
        summaries.push(`\u{1F4E7} ${effect[1] || ""}`);
        break;
      case "persist":
        summaries.push(`\u{1F4BE} ${effect[1] || "save"}`);
        break;
      case "navigate":
        summaries.push(`\u{1F517} nav`);
        break;
      case "spawn":
        summaries.push(`+ ${effect[1] || "spawn"}`);
        break;
      case "despawn":
        summaries.push(`- despawn`);
        break;
      default:
        summaries.push(op);
    }
  });
  return summaries.join(" | ");
}
function extractOutputsFromTransitions(transitions) {
  const outputs = /* @__PURE__ */ new Set();
  transitions.forEach((t) => {
    if (t.effects) {
      t.effects.forEach((effect) => {
        if (Array.isArray(effect)) {
          const op = effect[0];
          if (["emit", "notify", "persist", "navigate", "call-service"].includes(op)) {
            if (isArraySExpr(effect)) {
              const humanText = formatSExprEffectToDomain(effect);
              outputs.add(humanText);
            }
          }
        }
      });
    }
  });
  return Array.from(outputs);
}
function getNodeRadius(stateName, config) {
  const baseRadius = config.nodeRadius;
  const textLength = stateName.length;
  if (textLength > 12) return baseRadius + 25;
  if (textLength > 8) return baseRadius + 15;
  if (textLength > 6) return baseRadius + 8;
  return baseRadius;
}
function calculateLayout(states, transitions, options, config) {
  const positions = {};
  const entityBoxWidth = options.hasEntity ? 200 : 0;
  const outputBoxWidth = options.hasOutputs ? 200 : 0;
  const leftOffset = 100 + entityBoxWidth;
  const initialState = states.find((s) => s.isInitial) || states[0];
  states.filter((s) => s.isFinal);
  states.filter((s) => !s.isInitial && !s.isFinal);
  let maxLabelLength = 0;
  transitions.forEach((t) => {
    if (t.effects && t.effects.length > 0) {
      const summary = getEffectSummary(t.effects);
      maxLabelLength = Math.max(maxLabelLength, summary.length);
    }
    if (t.guard) {
      const guardStr = formatGuard(t.guard);
      maxLabelLength = Math.max(maxLabelLength, guardStr.length);
    }
    if (t.event) {
      maxLabelLength = Math.max(maxLabelLength, t.event.length);
    }
  });
  const labelWidth = Math.min(maxLabelLength * 10, 350);
  const dynamicSpacing = Math.min(Math.max(config.nodeSpacing, labelWidth + 100), 400);
  const stateColumn = {};
  if (initialState) {
    const queue = [{ name: initialState.name, col: 0 }];
    const visited = /* @__PURE__ */ new Set();
    while (queue.length > 0) {
      const { name, col } = queue.shift();
      if (visited.has(name)) continue;
      visited.add(name);
      if (stateColumn[name] === void 0) {
        stateColumn[name] = col;
      }
      transitions.forEach((t) => {
        if (t.from === name && t.from !== t.to && !visited.has(t.to)) {
          queue.push({ name: t.to, col: col + 1 });
        }
      });
    }
  }
  states.forEach((s) => {
    if (stateColumn[s.name] === void 0) {
      stateColumn[s.name] = 0;
    }
  });
  const columns = {};
  Object.entries(stateColumn).forEach(([name, col]) => {
    if (!columns[col]) columns[col] = [];
    columns[col].push(name);
  });
  Object.values(columns).forEach((stateNames) => {
    stateNames.sort((a, b) => {
      const stateA = states.find((s) => s.name === a);
      const stateB = states.find((s) => s.name === b);
      if (stateA?.isInitial) return -1;
      if (stateB?.isInitial) return 1;
      if (stateA?.isFinal && !stateB?.isFinal) return 1;
      if (stateB?.isFinal && !stateA?.isFinal) return -1;
      return a.localeCompare(b);
    });
  });
  const numColumns = Math.max(...Object.keys(columns).map(Number)) + 1;
  const maxRowsInColumn = Math.max(...Object.values(columns).map((arr) => arr.length));
  const minVerticalSpacing = 420;
  const tooltipPadding = 150;
  const width = Math.max(1400, numColumns * dynamicSpacing + entityBoxWidth + outputBoxWidth + 400);
  const height = Math.max(1e3, maxRowsInColumn * minVerticalSpacing + 350 + tooltipPadding);
  Object.entries(columns).forEach(([colStr, stateNames]) => {
    const col = parseInt(colStr);
    const x = leftOffset + col * dynamicSpacing;
    const numInColumn = stateNames.length;
    const verticalSpacing = Math.max(minVerticalSpacing, height / (numInColumn + 1));
    stateNames.forEach((stateName, rowIndex) => {
      const state = states.find((s) => s.name === stateName);
      if (state) {
        const y = verticalSpacing * (rowIndex + 1);
        positions[stateName] = { x, y, state };
      }
    });
  });
  return { positions, width, height: height + 60 };
}
function escapeXml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function createArrowMarkerSvg(id, color, config) {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="${config.arrowSize}" markerHeight="${config.arrowSize}" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="${color}"/>
  </marker>`;
}
function drawStateSvg(name, x, y, state, config) {
  const radius = getNodeRadius(name, config);
  let borderColor = config.colors.nodeBorder;
  let borderWidth = 2;
  if (state.isInitial) {
    borderColor = config.colors.initialNode;
    borderWidth = 3;
  } else if (state.isFinal) {
    borderColor = config.colors.finalNode;
    borderWidth = 3;
  }
  let svg = `<g class="state-node">
    <circle cx="${x}" cy="${y}" r="${radius}" fill="${config.colors.node}" stroke="${borderColor}" stroke-width="${borderWidth}"/>`;
  if (state.isFinal) {
    svg += `<circle cx="${x}" cy="${y}" r="${radius - 6}" fill="none" stroke="${borderColor}" stroke-width="2"/>`;
  }
  if (state.isInitial) {
    svg += `<path d="M ${x - radius - config.initialIndicatorOffset} ${y} L ${x - radius - 5} ${y}" stroke="${config.colors.initial}" stroke-width="2" fill="none" marker-end="url(#arrow-initial)"/>`;
  }
  svg += `<text x="${x}" y="${y + 7}" text-anchor="middle" fill="${config.colors.nodeText}" font-family="Inter, sans-serif" font-size="18px" font-weight="600">${escapeXml(name)}</text>`;
  svg += `</g>`;
  return svg;
}
function drawTransitionPathSvg(from, to, transitions, positions, config) {
  const fromPos = positions[from];
  const toPos = positions[to];
  if (!fromPos || !toPos) return "";
  const relevantTransitions = transitions.filter((t) => t.from === from && t.to === to);
  if (relevantTransitions.length === 0) return "";
  const fromRadius = getNodeRadius(from, config);
  const toRadius = getNodeRadius(to, config);
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return "";
  const nx = dx / dist;
  const ny = dy / dist;
  const startX = fromPos.x + nx * fromRadius;
  const startY = fromPos.y + ny * fromRadius;
  const endX = toPos.x - nx * (toRadius + 5);
  const endY = toPos.y - ny * (toRadius + 5);
  const hasReverse = transitions.some((t) => t.from === to && t.to === from);
  const isReverse = hasReverse && from > to;
  const baseOffset = hasReverse ? 50 : 30;
  const curveOffset = baseOffset + (relevantTransitions.length > 1 ? 20 : 0);
  const curveDirection = isReverse ? 1 : -1;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2 + curveOffset * curveDirection;
  return `<path class="transition-path" data-from="${from}" data-to="${to}" d="M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}" stroke="${config.colors.arrow}" stroke-width="1.5" fill="none" marker-end="url(#arrow)"/>`;
}
function drawTransitionLabelsSvg(from, to, transitions, positions, config) {
  const fromPos = positions[from];
  const toPos = positions[to];
  if (!fromPos || !toPos) return "";
  const relevantTransitions = transitions.filter((t) => t.from === from && t.to === to);
  if (relevantTransitions.length === 0) return "";
  const fromRadius = getNodeRadius(from, config);
  const toRadius = getNodeRadius(to, config);
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return "";
  const nx = dx / dist;
  const ny = dy / dist;
  const startX = fromPos.x + nx * fromRadius;
  const startY = fromPos.y + ny * fromRadius;
  const endX = toPos.x - nx * (toRadius + 5);
  const endY = toPos.y - ny * (toRadius + 5);
  const hasReverse = transitions.some((t) => t.from === to && t.to === from);
  const isReverse = hasReverse && from > to;
  const baseOffset = hasReverse ? 50 : 40;
  const curveOffset = baseOffset + (relevantTransitions.length > 1 ? 25 : 0);
  const curveDirection = isReverse ? 1 : -1;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2 + curveOffset * curveDirection;
  let svg = "";
  relevantTransitions.forEach((transition, index) => {
    const blockOffset = index * 60 * curveDirection;
    const dataAttrs = `data-from="${from}" data-to="${to}" data-event="${transition.event}"`;
    const labelY = midY + curveDirection * 5 + blockOffset;
    svg += `<g class="transition-group" ${dataAttrs}>`;
    svg += `<text class="transition-label transition-event" x="${midX}" y="${labelY}" text-anchor="middle" fill="${config.colors.arrowText}" font-family="JetBrains Mono, monospace" font-size="14px" font-weight="600">${escapeXml(transition.event)}</text>`;
    const hasGuard = !!transition.guard;
    const guardText = hasGuard ? formatGuardHuman(transition.guard) : "";
    const effectLines = transition.effects ? formatEffectsHuman(transition.effects) : [];
    const hasEffects = effectLines.length > 0;
    if (hasGuard || hasEffects) {
      const tooltipStartY = labelY + 20 * curveDirection;
      const lineHeight = 18;
      const padding = 12;
      let maxTextWidth = 0;
      if (guardText) maxTextWidth = Math.max(maxTextWidth, guardText.length * 7);
      effectLines.forEach((line) => {
        maxTextWidth = Math.max(maxTextWidth, line.length * 7);
      });
      const boxWidth = Math.max(180, Math.min(maxTextWidth + padding * 2 + 20, 400));
      const numLines = (hasGuard ? 1 : 0) + effectLines.length;
      const boxHeight = numLines * lineHeight + padding * 2;
      const boxY = curveDirection > 0 ? tooltipStartY : tooltipStartY - boxHeight;
      svg += `<g class="transition-detail">`;
      svg += `<rect x="${midX - boxWidth / 2}" y="${boxY}" width="${boxWidth}" height="${boxHeight}" fill="rgba(22, 27, 34, 0.95)" stroke="${config.colors.nodeBorder}" stroke-width="1" rx="6"/>`;
      let currentY = boxY + padding + 12;
      if (hasGuard && guardText) {
        svg += `<text x="${midX - boxWidth / 2 + padding}" y="${currentY}" fill="${config.colors.guardText}" font-family="Inter, sans-serif" font-size="12px">`;
        svg += `<tspan font-weight="600">Guard:</tspan> ${escapeXml(guardText)}</text>`;
        currentY += lineHeight;
      }
      if (hasEffects) {
        effectLines.forEach((effectText, idx) => {
          const prefix = idx === 0 ? "Then: " : "      ";
          svg += `<text x="${midX - boxWidth / 2 + padding}" y="${currentY}" fill="${config.colors.effectText}" font-family="Inter, sans-serif" font-size="12px">`;
          svg += `<tspan font-weight="${idx === 0 ? "600" : "400"}">${prefix}</tspan>${escapeXml(effectText)}</text>`;
          currentY += lineHeight;
        });
      }
      svg += `</g>`;
    }
    svg += `</g>`;
  });
  return svg;
}
function drawEntityInputSvg(entity, x, y, _height) {
  const fieldCount = entity.fields ? entity.fields.length : 0;
  const boxWidth = 160;
  const boxHeight = Math.max(80, fieldCount * 22 + 50);
  const boxY = y - boxHeight / 2;
  let svg = `<g class="entity-input">
    <rect x="${x}" y="${boxY}" width="${boxWidth}" height="${boxHeight}" fill="#1a1f2e" stroke="#4a9eff" stroke-width="2" rx="8"/>
    <text x="${x + boxWidth / 2}" y="${boxY + 24}" text-anchor="middle" fill="#4a9eff" font-family="Inter, sans-serif" font-size="14px" font-weight="600">\u{1F4E6} ${escapeXml(entity.name || "Entity")}</text>`;
  if (entity.fields && entity.fields.length > 0) {
    entity.fields.forEach((field, idx) => {
      const fieldName = typeof field === "string" ? field : field.name;
      svg += `<text x="${x + 12}" y="${boxY + 48 + idx * 20}" fill="#8b949e" font-family="JetBrains Mono, monospace" font-size="11px">\u2022 ${escapeXml(fieldName)}</text>`;
    });
  }
  svg += `<path d="M ${x + boxWidth + 5} ${y} L ${x + boxWidth + 40} ${y}" stroke="#4a9eff" stroke-width="2" fill="none" marker-end="url(#arrow-input)"/>`;
  svg += `</g>`;
  return svg;
}
function drawOutputsSvg(outputs, x, y, height) {
  if (!outputs || outputs.length === 0) return "";
  const maxOutputLength = Math.max(...outputs.map((o) => o.length));
  const boxWidth = Math.max(200, maxOutputLength * 7 + 30);
  const lineHeight = 22;
  const boxHeight = outputs.length * lineHeight + 50;
  const boxY = y - boxHeight / 2;
  let svg = `<g class="outputs">
    <rect x="${x}" y="${boxY}" width="${boxWidth}" height="${boxHeight}" fill="#1a1f2e" stroke="#ffb86c" stroke-width="2" rx="8"/>
    <text x="${x + boxWidth / 2}" y="${boxY + 24}" text-anchor="middle" fill="#ffb86c" font-family="Inter, sans-serif" font-size="13px" font-weight="600">\u{1F4E4} External Effects</text>`;
  outputs.forEach((output, idx) => {
    svg += `<text x="${x + 12}" y="${boxY + 48 + idx * lineHeight}" fill="#e6edf3" font-family="Inter, sans-serif" font-size="11px">\u2022 ${escapeXml(output)}</text>`;
  });
  svg += `</g>`;
  return svg;
}
function drawLegendSvg(y, config) {
  const items = [
    { label: "Initial", color: config.colors.initialNode },
    { label: "Final", color: config.colors.finalNode },
    { label: "State", color: config.colors.nodeBorder }
  ];
  let svg = `<g class="legend">`;
  let x = 20;
  items.forEach((item) => {
    svg += `<circle cx="${x}" cy="${y}" r="6" fill="${config.colors.node}" stroke="${item.color}" stroke-width="2"/>`;
    svg += `<text x="${x + 12}" y="${y + 4}" fill="${config.colors.arrowText}" font-family="Inter, sans-serif" font-size="10px">${escapeXml(item.label)}</text>`;
    x += 70;
  });
  svg += `</g>`;
  return svg;
}
function renderStateMachineToSvg(stateMachine, options = {}, config = DEFAULT_CONFIG) {
  const states = stateMachine.states || [];
  const transitions = stateMachine.transitions || [];
  const title = options.title || "";
  const entity = options.entity;
  const outputs = extractOutputsFromTransitions(transitions);
  const layoutOptions = {
    hasEntity: !!entity,
    hasOutputs: outputs.length > 0
  };
  const { positions, width, height } = calculateLayout(states, transitions, layoutOptions, config);
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height + 40}" viewBox="0 0 ${width} ${height + 40}" class="orbital-state-machine" style="display: block; max-width: none;">`;
  svg += `<defs>`;
  svg += createArrowMarkerSvg("arrow", config.colors.arrow, config);
  svg += createArrowMarkerSvg("arrow-initial", config.colors.initial, config);
  svg += createArrowMarkerSvg("arrow-input", "#4a9eff", config);
  svg += createArrowMarkerSvg("arrow-output", "#ffb86c", config);
  svg += `</defs>`;
  svg += `<rect x="0" y="0" width="${width}" height="${height + 40}" fill="${config.colors.background}" rx="8"/>`;
  if (title) {
    svg += `<text x="${width / 2}" y="20" text-anchor="middle" fill="${config.colors.nodeText}" font-family="Inter, sans-serif" font-size="14px" font-weight="600">${escapeXml(title)}</text>`;
  }
  const offsetY = title ? 30 : 0;
  svg += `<g transform="translate(0, ${offsetY})">`;
  if (entity) {
    svg += drawEntityInputSvg(entity, 20, height / 2);
  }
  const drawnPairs = /* @__PURE__ */ new Set();
  transitions.forEach((transition) => {
    const pairKey = `${transition.from}->${transition.to}`;
    if (!drawnPairs.has(pairKey)) {
      drawnPairs.add(pairKey);
      svg += drawTransitionPathSvg(transition.from, transition.to, transitions, positions, config);
    }
  });
  for (const [name, pos] of Object.entries(positions)) {
    svg += drawStateSvg(name, pos.x, pos.y, pos.state, config);
  }
  drawnPairs.clear();
  transitions.forEach((transition) => {
    const pairKey = `${transition.from}->${transition.to}`;
    if (!drawnPairs.has(pairKey)) {
      drawnPairs.add(pairKey);
      svg += drawTransitionLabelsSvg(transition.from, transition.to, transitions, positions, config);
    }
  });
  if (outputs.length > 0) {
    const maxX = Math.max(...Object.values(positions).map((p) => p.x));
    svg += drawOutputsSvg(outputs, maxX + config.nodeRadius + 60, height / 2);
  }
  svg += `</g>`;
  svg += drawLegendSvg(height + 25, config);
  svg += `</svg>`;
  return svg;
}
function extractStateMachine(data) {
  if (!data || typeof data !== "object") return null;
  const obj = data;
  if (obj.states && obj.transitions) {
    return obj;
  }
  if (obj.stateMachine) {
    return obj.stateMachine;
  }
  if (Array.isArray(obj.traits)) {
    const traitWithSM = obj.traits.find(
      (t) => typeof t === "object" && t !== null && "stateMachine" in t
    );
    if (traitWithSM && typeof traitWithSM === "object" && "stateMachine" in traitWithSM) {
      return traitWithSM.stateMachine;
    }
  }
  return null;
}
function calculateTransitionPathData(from, to, transitions, positions, config) {
  const fromPos = positions[from];
  const toPos = positions[to];
  if (!fromPos || !toPos) return null;
  const relevantTransitions = transitions.filter((t) => t.from === from && t.to === to);
  if (relevantTransitions.length === 0) return null;
  const fromRadius = getNodeRadius(from, config);
  const toRadius = getNodeRadius(to, config);
  if (from === to) {
    const loopRadius = 50;
    const cx = fromPos.x;
    const cy = fromPos.y - fromRadius - loopRadius;
    const startAngle = -0.5;
    const endAngle = 0.5;
    const startX2 = fromPos.x + Math.cos(-Math.PI / 2 + startAngle) * fromRadius;
    const startY2 = fromPos.y + Math.sin(-Math.PI / 2 + startAngle) * fromRadius;
    const endX2 = fromPos.x + Math.cos(-Math.PI / 2 + endAngle) * fromRadius;
    const endY2 = fromPos.y + Math.sin(-Math.PI / 2 + endAngle) * fromRadius;
    const pathData = `M ${startX2} ${startY2} A ${loopRadius} ${loopRadius} 0 1 1 ${endX2} ${endY2}`;
    return {
      pathData,
      labelX: cx,
      labelY: cy - loopRadius * 0.5
    };
  }
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return null;
  const nx = dx / dist;
  const ny = dy / dist;
  const startX = fromPos.x + nx * fromRadius;
  const startY = fromPos.y + ny * fromRadius;
  const endX = toPos.x - nx * (toRadius + 5);
  const endY = toPos.y - ny * (toRadius + 5);
  const hasReverse = transitions.some((t) => t.from === to && t.to === from);
  const isReverse = hasReverse && from > to;
  const baseOffset = hasReverse ? 50 : 30;
  const curveOffset = baseOffset + (relevantTransitions.length > 1 ? 20 : 0);
  const curveDirection = isReverse ? 1 : -1;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2 + curveOffset * curveDirection;
  return {
    pathData: `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`,
    labelX: midX,
    labelY: midY + curveDirection * 5
  };
}
function renderStateMachineToDomData(stateMachine, options = {}, config = DEFAULT_CONFIG) {
  const states = stateMachine.states || [];
  const transitions = stateMachine.transitions || [];
  const title = options.title || "";
  const entity = options.entity;
  const outputs = extractOutputsFromTransitions(transitions);
  const layoutOptions = {
    hasEntity: !!entity,
    hasOutputs: outputs.length > 0
  };
  const { positions, width, height } = calculateLayout(states, transitions, layoutOptions, config);
  const domStates = Object.entries(positions).map(([name, pos]) => ({
    id: `state-${name}`,
    name,
    x: pos.x,
    y: pos.y,
    radius: getNodeRadius(name, config),
    isInitial: pos.state.isInitial ?? false,
    isFinal: pos.state.isFinal ?? false,
    description: pos.state.description
  }));
  const domPaths = [];
  const domLabels = [];
  const drawnPairs = /* @__PURE__ */ new Set();
  transitions.forEach((transition, idx) => {
    const pairKey = `${transition.from}->${transition.to}`;
    if (!drawnPairs.has(pairKey)) {
      drawnPairs.add(pairKey);
      const pathData2 = calculateTransitionPathData(
        transition.from,
        transition.to,
        transitions,
        positions,
        config
      );
      if (pathData2) {
        domPaths.push({
          id: `path-${transition.from}-${transition.to}`,
          from: transition.from,
          to: transition.to,
          pathData: pathData2.pathData,
          labelX: pathData2.labelX,
          labelY: pathData2.labelY
        });
      }
    }
    const guardText = transition.guard ? formatGuardHuman(transition.guard) : void 0;
    const effectTexts = transition.effects ? formatEffectsHuman(transition.effects) : [];
    const hasDetails = !!guardText || effectTexts.length > 0;
    const pathData = calculateTransitionPathData(
      transition.from,
      transition.to,
      transitions,
      positions,
      config
    );
    if (pathData) {
      const sameEventIndex = domLabels.filter(
        (l) => l.from === transition.from && l.to === transition.to
      ).length;
      const labelOffset = sameEventIndex * 60;
      domLabels.push({
        id: `label-${transition.from}-${transition.to}-${idx}`,
        from: transition.from,
        to: transition.to,
        event: transition.event,
        x: pathData.labelX,
        y: pathData.labelY + labelOffset,
        guardText,
        effectTexts,
        hasDetails
      });
    }
  });
  let domEntity;
  if (entity) {
    const fieldCount = entity.fields ? entity.fields.length : 0;
    const boxWidth = 160;
    const boxHeight = Math.max(80, fieldCount * 22 + 50);
    domEntity = {
      name: entity.name || "Entity",
      fields: entity.fields?.map((f) => typeof f === "string" ? f : f.name) || [],
      x: 20,
      y: height / 2 - boxHeight / 2,
      width: boxWidth,
      height: boxHeight
    };
  }
  let domOutputs;
  if (outputs.length > 0) {
    const maxX = Math.max(...Object.values(positions).map((p) => p.x));
    const maxOutputLength = Math.max(...outputs.map((o) => o.length));
    const boxWidth = Math.max(200, maxOutputLength * 7 + 30);
    const lineHeight = 22;
    const boxHeight = outputs.length * lineHeight + 50;
    domOutputs = {
      outputs,
      x: maxX + config.nodeRadius + 300,
      y: height / 2 - boxHeight / 2,
      width: boxWidth,
      height: boxHeight
    };
  }
  return {
    width,
    height: height + 40,
    title: title || void 0,
    states: domStates,
    paths: domPaths,
    labels: domLabels,
    entity: domEntity,
    outputs: domOutputs,
    config
  };
}

// lib/parseContentSegments.ts
function tryParseOrbitalSchema(code) {
  try {
    const parsed = JSON.parse(code);
    if (parsed.states && parsed.transitions || Array.isArray(parsed.orbitals)) {
      return parsed;
    }
  } catch {
  }
  return null;
}
function parseMarkdownWithCodeBlocks(content) {
  if (!content) return [];
  const segments = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index);
    if (before.trim()) {
      segments.push({ type: "markdown", content: before });
    }
    const language = match[1] || "text";
    const code = match[2].trim();
    if (language === "json" || language === "orb") {
      const schema = tryParseOrbitalSchema(code);
      if (schema) {
        segments.push({ type: "orbital", language, content: code, schema });
        lastIndex = codeBlockRegex.lastIndex;
        continue;
      }
    }
    segments.push({ type: "code", language, content: code });
    lastIndex = codeBlockRegex.lastIndex;
  }
  const remaining = content.slice(lastIndex);
  if (remaining.trim()) {
    segments.push({ type: "markdown", content: remaining });
  }
  return segments;
}
function parseContentSegments(content) {
  if (!content) return [];
  const segments = [];
  const tagRegex = /<question>([\s\S]*?)<\/question>\s*<answer>([\s\S]*?)<\/answer>/gi;
  let lastIndex = 0;
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    const before = content.slice(lastIndex, match.index);
    if (before.trim()) {
      segments.push(...parseMarkdownWithCodeBlocks(before));
    }
    segments.push({
      type: "quiz",
      question: match[1].trim(),
      answer: match[2].trim()
    });
    lastIndex = tagRegex.lastIndex;
  }
  const remaining = content.slice(lastIndex);
  if (remaining.trim()) {
    segments.push(...parseMarkdownWithCodeBlocks(remaining));
  }
  return segments;
}

export { DEFAULT_CONFIG, extractOutputsFromTransitions, extractStateMachine, formatGuard, getEffectSummary, parseContentSegments, parseMarkdownWithCodeBlocks, renderStateMachineToDomData, renderStateMachineToSvg };
