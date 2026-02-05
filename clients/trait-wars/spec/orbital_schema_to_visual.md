# Orbital Schema to Visual Mapping: The Manuscript Algorithm

**Purpose:** This document defines the "Function" `mapSchemaToVisual(schema)` that translates a rigorous KFlow Orbital Schema (JSON) into a descriptive Manuscript Art Prompt.

---

## The Mapping Function

**Input:** Orbital Trait Schema (JSON)
**Output:** Image Generation Prompt (text)

### 1. The Canvas (The Context)
*   **Base Layer:** Dark, ancient parchment texture (The fabric of reality).
*   **Lighting:** Cinematic top-down "God Ray" illuminating the center.
*   **Style:** `Illuminated Manuscript Futurism`.

### 2. The Entity (`trait.linkedEntity`) ==> **The Core**
*   **Visual:** The center of the diagram.
*   **Mapping:**
    *   If `User`: A Vitruvian Man sketch in silver ink.
    *   If `Robot`: A schematic diagram of the specific chassis (e.g., Hero Frame).
    *   If `Database/System`: A geometric cube or crystal.

### 3. The States (`trait.stateMachine.states`) ==> **The Nodes**
*   **Visual:** Gold Leaf Circles arranged in a ring around the Core.
*   **Mapping:**
    *   **Initial State:** A large, double-ringed Gold Node. Ornate.
    *   **Active State:** Glowing brightly with intense golden light.
    *   **Standard State:** A simple gold ring with the State Name written inside in Calligra-Futurism.

### 4. The Transitions (`trait.stateMachine.transitions`) ==> **The Arcs**
*   **Visual:** Curves of connecting text (The Logic Path).
*   **Mapping:**
    *   From `State A` to `State B`: A sweeping arc of calligraphy connecting the two nodes.
    *   **Direction:** Clockwise flow.

### 5. Guards (`transition.guards`) ==> **The Seals**
*   **Visual:** Physical obstructions on the Transition Arcs.
*   **Mapping:**
    *   `guard: "isAuthorized"`: A Keyhole symbol on the line.
    *   `guard: "hasEnergy"`: A Battery/Flask symbol.
    *   `guard: "notCooldown"`: An hourglass symbol.
*   **Metaphor:** "You cannot pass this path until the Seal is broken."

### 6. Render UI Effects (`effect: render_ui`) ==> **The Projection**
*   **Visual:** A Holographic "Materialization" emerging from the **Active State Node**.
*   **Mapping:**
    *   `target: "modal"`: A suspended, floating rectangular frame of light.
    *   `target: "drawer"`: A slide-out scroll panel on the side.
    *   `target: "toast"`: A small floating wisp of text.
    *   **The Content:** The `pattern` type determines the visual inside the projection (e.g., `form-section` = glowing input lines).

---

## Example Execution: The "Hero's Defend" Orbital

**Input Schema:**
```json
{
  "name": "Defend",
  "linkedEntity": "HeroRobot",
  "states": [
    { "name": "Idle", "isInitial": true },
    { "name": "Shielding" },
    { "name": "Counter" }
  ],
  "transitions": [
    {
      "from": "Idle",
      "to": "Shielding",
      "trigger": "DETECT_THREAT",
      "effects": [{ "type": "render_ui", "target": "overlay", "pattern": "shield-hud" }]
    },
    {
      "from": "Shielding",
      "to": "Counter",
      "guard": "charge > 50"
    }
  ]
}
```

**Output Prompt Logic:**
1.  **Core:** Central sketch of the **Hero Robot**.
2.  **Nodes:** Three gold circles: `Idle` (Ornate, Top), `Shielding` (Glowing, Right), `Counter` (Standard, Left).
3.  **Arcs:**
    *   Arc from `Idle` to `Shielding` is written in urgent, sharp calligraphy (`DETECT_THREAT`).
4.  **Projections (The UI):**
    *   From the **Shielding** Node, a massive **Holographic Hard-Light Barrier** (Overlay) projects out, covering the Hero. It looks like a transparent golden wall.
5.  **Seals (The Guard):**
    *   On the arc to `Counter`, a **Glowing Gauge/Battery Seal** (`charge > 50`) blocks the path.

---

## The Prompt Generation Function

```typescript
function generateOrbitalPrompt(traitName: string): string {
   return `
   Sci-Fi Technical Diagram. Style: 'Illuminated Manuscript Futurism'.
   Subject: 'The ${traitName} Orbital' (Full Schematic).
   Center: A sketch of the Robot Chassis.
   Surrounding: A ring of GOLD NODES representing States.
   Connectors: Calligraphic Arcs representing Logic Transitions.
   Active Effect: One State is GLOWING and projecting a HOLOGRAPHIC UI (The Manifestation) into the air.
   Detail: Small 'Seals' on the lines representing Logic Guards.
   Background: Dark Vellum.
   Atmosphere: "The Code Made Visible".
   `
}
```
