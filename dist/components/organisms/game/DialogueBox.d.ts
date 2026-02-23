/**
 * DialogueBox Component
 *
 * NPC dialogue display with typewriter effect and choices.
 *
 * **State categories (closed-circuit compliant):**
 * - Content (dialogue node, speaker, text, choices) → received via props
 * - UI-transient animation (displayedText, isTyping, charIndex, selectedChoice) → local only
 * - Events → emitted via `useEventBus()` (complete, choice, advance)
 *
 * Local state is typewriter animation only — an inherently rendering-only
 * concern analogous to Form's `formData`.
 */
import React from 'react';
export interface DialogueChoice {
    text: string;
    action?: string;
    next?: string;
    disabled?: boolean;
}
export interface DialogueNode {
    id?: string;
    speaker: string;
    text: string;
    portrait?: string;
    choices?: DialogueChoice[];
    autoAdvance?: number;
}
export interface DialogueBoxProps {
    /** Current dialogue node to display */
    dialogue: DialogueNode;
    /** Typewriter speed in ms per character (0 = instant) */
    typewriterSpeed?: number;
    /** Position of dialogue box */
    position?: 'top' | 'bottom';
    /** Called when text animation completes */
    onComplete?: () => void;
    /** Called when a choice is selected */
    onChoice?: (choice: DialogueChoice) => void;
    /** Called when dialogue is advanced (no choices) */
    onAdvance?: () => void;
    /** Declarative event: emits UI:{completeEvent} when text animation completes */
    completeEvent?: string;
    /** Declarative event: emits UI:{choiceEvent} with { choice } when a choice is selected */
    choiceEvent?: string;
    /** Declarative event: emits UI:{advanceEvent} when dialogue is advanced */
    advanceEvent?: string;
    /** Optional className */
    className?: string;
}
/**
 * Dialogue box component with typewriter effect
 *
 * @example
 * ```tsx
 * <DialogueBox
 *   dialogue={{
 *     speaker: "Old Man",
 *     text: "It's dangerous to go alone! Take this.",
 *     portrait: "/portraits/oldman.png",
 *     choices: [
 *       { text: "Thank you!", action: "ACCEPT_ITEM" },
 *       { text: "No thanks", next: "decline_node" }
 *     ]
 *   }}
 *   typewriterSpeed={30}
 *   onChoice={(choice) => handleChoice(choice)}
 *   position="bottom"
 * />
 * ```
 */
export declare function DialogueBox({ dialogue, typewriterSpeed, position, onComplete, onChoice, onAdvance, completeEvent, choiceEvent, advanceEvent, className, }: DialogueBoxProps): React.JSX.Element;
export default DialogueBox;
