/**
 * QuizBlock Molecule Component
 *
 * A collapsible Q&A block for embedded quiz questions in content.
 * Shows the question with a reveal button for the answer.
 *
 * Event Contract:
 * - No events emitted (self-contained interaction)
 * - entityAware: false
 */
import React from 'react';
export interface QuizBlockProps {
    /** The quiz question */
    question: string;
    /** The quiz answer (revealed on toggle) */
    answer: string;
    /** Additional CSS classes */
    className?: string;
}
export declare const QuizBlock: React.FC<QuizBlockProps>;
